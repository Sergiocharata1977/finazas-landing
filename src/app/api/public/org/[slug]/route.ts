import { getAdminFirestore } from '@/lib/firebase/admin';
import { resolveOrgIdBySlug } from '@/lib/public/resolveTenantOrg';
import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 300;

function isActiveCapability(data: Record<string, unknown>) {
  return data.activo === true || data.enabled === true || data.status === 'enabled';
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  if (!slug || slug.length > 60) {
    return NextResponse.json(
      { success: false, error: 'Slug invalido' },
      { status: 400 }
    );
  }

  const orgId = await resolveOrgIdBySlug(slug);
  if (!orgId) {
    return NextResponse.json(
      { success: false, error: 'Organizacion no encontrada' },
      { status: 404 }
    );
  }

  const db = getAdminFirestore();
  const orgRef = db.collection('organizations').doc(orgId);

  const [orgDoc, legacyCapsSnap, installedCapsSnap] = await Promise.all([
    orgRef.get(),
    orgRef.collection('capabilities').get(),
    orgRef.collection('installed_capabilities').get(),
  ]);

  const org = orgDoc.data() || {};
  const features = Array.from(
    new Set(
      [...legacyCapsSnap.docs, ...installedCapsSnap.docs]
        .filter(doc => isActiveCapability(doc.data() as Record<string, unknown>))
        .map(doc => doc.id)
    )
  );

  return NextResponse.json({
    success: true,
    data: {
      slug,
      nombre: org.nombre || slug,
      color_primario: org.color_primario || '#dc2626',
      logo_url: org.logo_url || null,
      features,
    },
  });
}
