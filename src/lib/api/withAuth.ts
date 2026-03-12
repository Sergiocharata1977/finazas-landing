/**
 * withAuth - Middleware de autenticacion para API Routes
 */

import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin';
import { UserRole } from '@/types/auth';
import { NextRequest, NextResponse } from 'next/server';

export interface AuthContext {
  uid: string;
  email: string;
  organizationId: string;
  role: UserRole;
  user: {
    id: string;
    email: string;
    rol: UserRole;
    organization_id: string | null;
    personnel_id: string | null;
    activo: boolean;
    status: string;
  };
}

export type AuthenticatedHandler = (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
  auth: AuthContext
) => Promise<NextResponse>;

export interface WithAuthOptions {
  roles?: UserRole[];
  allowNoOrg?: boolean;
  allowInactive?: boolean;
  allowMissingUser?: boolean;
}

const userCache = new Map<
  string,
  { data: AuthContext['user']; timestamp: number }
>();
const CACHE_TTL = 5 * 60 * 1000;

function normalizeUserRole(role?: string | null): UserRole {
  const r = (role || '').toLowerCase().trim();
  switch (r) {
    case 'supervisor':
      return 'jefe';
    case 'administrator':
    case 'administrador':
      return 'admin';
    case 'manager':
      return 'gerente';
    case 'employee':
    case 'empleado':
      return 'operario';
    case 'admin':
    case 'gerente':
    case 'jefe':
    case 'operario':
    case 'auditor':
    case 'super_admin':
      return r;
    default:
      return 'operario';
  }
}

function getCachedUser(uid: string): AuthContext['user'] | null {
  const cached = userCache.get(uid);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;
  if (cached) userCache.delete(uid);
  return null;
}

function setCachedUser(uid: string, data: AuthContext['user']): void {
  if (userCache.size > 100) {
    const oldestKey = userCache.keys().next().value;
    if (oldestKey) userCache.delete(oldestKey);
  }
  userCache.set(uid, { data, timestamp: Date.now() });
}

export function withAuth(
  handler: AuthenticatedHandler,
  options?: WithAuthOptions
) {
  return async (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> }
  ): Promise<NextResponse> => {
    try {
      const authHeader =
        request.headers.get('authorization') ||
        request.headers.get('Authorization');
      const bearerToken = authHeader?.startsWith('Bearer ')
        ? authHeader.split('Bearer ')[1]
        : null;
      const sessionCookie = request.cookies.get('session')?.value;
      const authTokenCookie = request.cookies.get('auth-token')?.value;

      if (!bearerToken && !sessionCookie && !authTokenCookie) {
        return NextResponse.json(
          {
            error: 'No autorizado',
            message:
              'Se requiere token de autenticacion (Authorization Bearer o cookie de sesion)',
          },
          { status: 401 }
        );
      }

      const auth = getAdminAuth();
      let decodedToken: { uid: string; email?: string; [key: string]: unknown };
      try {
        if (bearerToken) {
          decodedToken = (await auth.verifyIdToken(bearerToken)) as {
            uid: string;
            email?: string;
          };
        } else if (sessionCookie) {
          decodedToken = (await auth.verifySessionCookie(
            sessionCookie,
            true
          )) as { uid: string; email?: string };
        } else if (authTokenCookie) {
          decodedToken = (await auth.verifyIdToken(authTokenCookie)) as {
            uid: string;
            email?: string;
          };
        } else {
          throw new Error('Missing credentials');
        }
      } catch {
        return NextResponse.json(
          {
            error: 'Token invalido',
            message: 'El token de autenticacion es invalido o ha expirado',
          },
          { status: 401 }
        );
      }

      const uid = decodedToken.uid;
      const email = decodedToken.email || '';

      let userData: AuthContext['user'] | null = getCachedUser(uid);
      if (!userData) {
        const db = getAdminFirestore();
        const userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists && !options?.allowMissingUser) {
          return NextResponse.json(
            {
              error: 'Usuario no encontrado',
              message: 'No se encontro el registro del usuario en el sistema',
            },
            { status: 403 }
          );
        }

        if (userDoc.exists) {
          const data = userDoc.data()!;
          userData = {
            id: uid,
            email: data.email || email,
            rol: normalizeUserRole(data.rol || data.role),
            organization_id: data.organization_id || null,
            personnel_id: data.personnel_id || null,
            activo: data.activo ?? false,
            status: data.status || 'pending_approval',
          };
        } else {
          userData = {
            id: uid,
            email,
            rol: normalizeUserRole((decodedToken.role as string) || null),
            organization_id: (decodedToken.organization_id as string) || null,
            personnel_id: (decodedToken.personnel_id as string) || null,
            activo: true,
            status: 'active',
          };
        }
        setCachedUser(uid, userData);
      }

      if (!userData) {
        return NextResponse.json(
          {
            error: 'Usuario no encontrado',
            message: 'No se pudo resolver contexto de usuario',
          },
          { status: 403 }
        );
      }

      if (!options?.allowInactive && !userData.activo) {
        return NextResponse.json(
          {
            error: 'Cuenta inactiva',
            message: 'Tu cuenta no esta activa. Contacta al administrador.',
          },
          { status: 403 }
        );
      }

      if (
        !options?.allowNoOrg &&
        !userData.organization_id &&
        userData.rol !== 'super_admin'
      ) {
        return NextResponse.json(
          {
            error: 'Sin organizacion',
            message:
              'Tu cuenta no tiene una organizacion asignada. Contacta al administrador.',
          },
          { status: 403 }
        );
      }

      if (
        options?.roles &&
        options.roles.length > 0 &&
        !options.roles.includes(userData.rol)
      ) {
        return NextResponse.json(
          {
            error: 'Sin permisos',
            message: `Se requiere uno de los siguientes roles: ${options.roles.join(', ')}`,
          },
          { status: 403 }
        );
      }

      const authContext: AuthContext = {
        uid,
        email: userData.email,
        organizationId: userData.organization_id || '',
        role: userData.rol,
        user: userData,
      };

      try {
        return await handler(request, context, authContext);
      } catch (handlerError) {
        console.error('[withAuth] Error en handler:', handlerError);
        return NextResponse.json(
          {
            error: 'Error interno del servidor',
            message:
              handlerError instanceof Error
                ? handlerError.message
                : 'Error procesando la solicitud',
          },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('[withAuth] Error inesperado en autenticacion:', error);
      return NextResponse.json(
        {
          error: 'Error interno',
          message: 'Error al verificar autenticacion',
        },
        { status: 500 }
      );
    }
  };
}

export function invalidateUserCache(uid: string): void {
  userCache.delete(uid);
}

export function clearUserCache(): void {
  userCache.clear();
}
