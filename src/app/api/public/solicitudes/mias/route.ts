import {
  PublicApiError,
  listPortalSolicitudes,
  resolvePublicPortalCustomer,
  serializePortalSolicitudList,
} from '@/lib/public/portalCustomer';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const context = await resolvePublicPortalCustomer(request, 'solicitudes');
    const solicitudes = await listPortalSolicitudes(context, { limit: 50 });

    return NextResponse.json({
      success: true,
      data: serializePortalSolicitudList(solicitudes),
    });
  } catch (error) {
    if (error instanceof PublicApiError) {
      return NextResponse.json(
        { success: false, error: error.message, errorCode: error.code },
        { status: error.status }
      );
    }

    console.error('[GET /api/public/solicitudes/mias]', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener solicitudes' },
      { status: 500 }
    );
  }
}
