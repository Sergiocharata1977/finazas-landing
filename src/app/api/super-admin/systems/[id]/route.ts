import { SUPER_ADMIN_AUTH_OPTIONS } from '@/lib/api/superAdminAuth';
import { withAuth } from '@/lib/api/withAuth';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { NextResponse } from 'next/server';

/**
 * GET /api/super-admin/systems/[id] — Detalle de un sistema
 */
export const GET = withAuth(async (_request, context: any) => {
  try {
    const db = getAdminFirestore();
    const systemId = context?.params?.id;

    if (!systemId) {
      return NextResponse.json(
        { error: 'System ID requerido' },
        { status: 400 }
      );
    }

    const doc = await db.collection('platform_systems').doc(systemId).get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Sistema no encontrado' },
        { status: 404 }
      );
    }

    // Contar organizaciones que usan este sistema
    const orgsSnapshot = await db.collection('organizations').get();
    let orgCount = 0;
    let activeOrgCount = 0;

    for (const orgDoc of orgsSnapshot.docs) {
      const contractedRef = orgDoc.ref
        .collection('contracted_systems')
        .doc(systemId);
      const contractDoc = await contractedRef.get();
      if (contractDoc.exists) {
        orgCount++;
        const cData = contractDoc.data();
        if (cData?.status === 'active' || cData?.status === 'trial') {
          activeOrgCount++;
        }
      }
    }

    // Health check (best-effort)
    const systemData = doc.data();
    let healthStatus: any = {
      status: 'unknown',
      lastChecked: new Date().toISOString(),
    };

    if (systemData?.url && systemData?.healthEndpoint) {
      try {
        const healthUrl = `${systemData.url}${systemData.healthEndpoint}`;
        const start = Date.now();
        const res = await fetch(healthUrl, {
          signal: AbortSignal.timeout(5000),
        });
        const elapsed = Date.now() - start;
        healthStatus = {
          status: res.ok ? 'online' : 'degraded',
          responseTimeMs: elapsed,
          lastChecked: new Date().toISOString(),
        };
      } catch {
        healthStatus = {
          status: 'offline',
          lastChecked: new Date().toISOString(),
          error: 'No se pudo conectar al sistema',
        };
      }
    }

    return NextResponse.json({
      system: { id: doc.id, ...systemData },
      stats: {
        totalOrganizations: orgCount,
        activeOrganizations: activeOrgCount,
      },
      health: healthStatus,
    });
  } catch (error) {
    console.error('Error al obtener sistema:', error);
    return NextResponse.json(
      { error: 'Error al obtener detalle del sistema' },
      { status: 500 }
    );
  }
}, SUPER_ADMIN_AUTH_OPTIONS);

/**
 * PUT /api/super-admin/systems/[id] — Actualizar sistema
 */
export const PUT = withAuth(async (request, context: any) => {
  try {
    const db = getAdminFirestore();
    const systemId = context?.params?.id;

    if (!systemId) {
      return NextResponse.json(
        { error: 'System ID requerido' },
        { status: 400 }
      );
    }

    const data = await request.json();

    await db
      .collection('platform_systems')
      .doc(systemId)
      .update({
        ...data,
        updated_at: new Date(),
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al actualizar sistema:', error);
    return NextResponse.json(
      { error: 'Error al actualizar sistema' },
      { status: 500 }
    );
  }
}, SUPER_ADMIN_AUTH_OPTIONS);
