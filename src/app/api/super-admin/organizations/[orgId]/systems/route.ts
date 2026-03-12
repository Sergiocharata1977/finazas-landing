import { SUPER_ADMIN_AUTH_OPTIONS } from '@/lib/api/superAdminAuth';
import { withAuth } from '@/lib/api/withAuth';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { NextResponse } from 'next/server';

/**
 * GET /api/super-admin/organizations/[orgId]/systems
 * Lista los sistemas contratados por una organización
 */
export const GET = withAuth(async (_request, context: any) => {
  try {
    const db = getAdminFirestore();
    const orgId = context?.params?.orgId;

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization ID requerido' },
        { status: 400 }
      );
    }

    const snapshot = await db
      .collection('organizations')
      .doc(orgId)
      .collection('contracted_systems')
      .get();

    const systems = snapshot.docs.map((doc: any) => ({
      systemId: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ systems });
  } catch (error) {
    console.error('Error al obtener sistemas de org:', error);
    return NextResponse.json(
      { error: 'Error al obtener sistemas contratados' },
      { status: 500 }
    );
  }
}, SUPER_ADMIN_AUTH_OPTIONS);

/**
 * POST /api/super-admin/organizations/[orgId]/systems
 * Asignar un sistema a una organización
 */
export const POST = withAuth(async (request, context: any) => {
  try {
    const db = getAdminFirestore();
    const orgId = context?.params?.orgId;
    const data = await request.json();

    if (!orgId || !data.systemId) {
      return NextResponse.json(
        { error: 'Organization ID y systemId son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el sistema existe
    const sysDoc = await db
      .collection('platform_systems')
      .doc(data.systemId)
      .get();
    if (!sysDoc.exists) {
      return NextResponse.json(
        { error: `Sistema '${data.systemId}' no encontrado` },
        { status: 404 }
      );
    }

    const sysData = sysDoc.data();
    const contractData = {
      systemId: data.systemId,
      systemName: sysData?.name || data.systemId,
      status: data.status || 'trial',
      modulesEnabled: data.modulesEnabled || sysData?.modules || [],
      contractedAt: new Date(),
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      notes: data.notes || '',
    };

    await db
      .collection('organizations')
      .doc(orgId)
      .collection('contracted_systems')
      .doc(data.systemId)
      .set(contractData);

    return NextResponse.json({ contract: contractData }, { status: 201 });
  } catch (error) {
    console.error('Error al asignar sistema:', error);
    return NextResponse.json(
      { error: 'Error al asignar sistema a la organización' },
      { status: 500 }
    );
  }
}, SUPER_ADMIN_AUTH_OPTIONS);

/**
 * DELETE /api/super-admin/organizations/[orgId]/systems
 * Remover un sistema de una organización
 */
export const DELETE = withAuth(async (request, context: any) => {
  try {
    const db = getAdminFirestore();
    const orgId = context?.params?.orgId;
    const { searchParams } = new URL(request.url);
    const systemId = searchParams.get('systemId');

    if (!orgId || !systemId) {
      return NextResponse.json(
        { error: 'Organization ID y systemId son requeridos' },
        { status: 400 }
      );
    }

    await db
      .collection('organizations')
      .doc(orgId)
      .collection('contracted_systems')
      .doc(systemId)
      .delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al desasignar sistema:', error);
    return NextResponse.json(
      { error: 'Error al desasignar sistema' },
      { status: 500 }
    );
  }
}, SUPER_ADMIN_AUTH_OPTIONS);
