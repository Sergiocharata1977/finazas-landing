import { withAuth } from '@/lib/api/withAuth';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { SUPER_ADMIN_AUTH_OPTIONS } from '@/lib/api/superAdminAuth';
import { NextResponse } from 'next/server';

export const GET = withAuth(async () => {
  try {
    const db = getAdminFirestore();
    const orgsSnapshot = await db.collection('organizations').get();

    const organizations = orgsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error('Error al obtener organizaciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener organizaciones' },
      { status: 500 }
    );
  }
}, SUPER_ADMIN_AUTH_OPTIONS);

export const POST = withAuth(async request => {
  try {
    const db = getAdminFirestore();
    const data = await request.json();

    if (!data.name || !data.plan) {
      return NextResponse.json(
        { error: 'Nombre y plan son requeridos' },
        { status: 400 }
      );
    }

    const orgId = `org_${data.name
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')}`;

    const orgData = {
      id: orgId,
      name: data.name,
      plan: data.plan || 'free',
      settings: {
        timezone: data.timezone || 'America/Argentina/Buenos_Aires',
        currency: data.currency || 'ARS',
        language: data.language || 'es',
      },
      features: {
        private_sections: data.features?.private_sections ?? true,
        ai_assistant: data.features?.ai_assistant ?? true,
        max_users: data.features?.max_users ?? 50,
      },
      created_at: new Date(),
      updated_at: new Date(),
    };

    await db.collection('organizations').doc(orgId).set(orgData);
    return NextResponse.json({ organization: orgData }, { status: 201 });
  } catch (error) {
    console.error('Error al crear organizacion:', error);
    return NextResponse.json(
      { error: 'Error al crear organizacion' },
      { status: 500 }
    );
  }
}, SUPER_ADMIN_AUTH_OPTIONS);
