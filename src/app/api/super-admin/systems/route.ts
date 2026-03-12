import { SUPER_ADMIN_AUTH_OPTIONS } from '@/lib/api/superAdminAuth';
import { withAuth } from '@/lib/api/withAuth';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { NextResponse } from 'next/server';

/**
 * GET /api/super-admin/systems — Lista todos los sistemas registrados
 */
export const GET = withAuth(async () => {
  try {
    const db = getAdminFirestore();
    const snapshot = await db.collection('platform_systems').get();

    const systems = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ systems });
  } catch (error) {
    console.error('Error al obtener sistemas:', error);
    return NextResponse.json(
      { error: 'Error al obtener sistemas' },
      { status: 500 }
    );
  }
}, SUPER_ADMIN_AUTH_OPTIONS);

/**
 * POST /api/super-admin/systems — Registrar un nuevo sistema
 */
export const POST = withAuth(async request => {
  try {
    const db = getAdminFirestore();
    const data = await request.json();

    if (!data.id || !data.name || !data.url) {
      return NextResponse.json(
        { error: 'id, name y url son requeridos' },
        { status: 400 }
      );
    }

    const systemData = {
      id: data.id,
      name: data.name,
      description: data.description || '',
      url: data.url,
      healthEndpoint: data.healthEndpoint || '/api/health',
      color: data.color || 'slate',
      icon: data.icon || 'Server',
      status: data.status || 'active',
      version: data.version || '1.0.0',
      modules: data.modules || [],
      created_at: new Date(),
      updated_at: new Date(),
    };

    await db.collection('platform_systems').doc(data.id).set(systemData);

    return NextResponse.json({ system: systemData }, { status: 201 });
  } catch (error) {
    console.error('Error al registrar sistema:', error);
    return NextResponse.json(
      { error: 'Error al registrar sistema' },
      { status: 500 }
    );
  }
}, SUPER_ADMIN_AUTH_OPTIONS);
