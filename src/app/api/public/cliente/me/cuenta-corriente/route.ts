import {
  PublicApiError,
  buildCuentaCorrientePayload,
  getPortalCustomerOverview,
  resolvePublicPortalCustomer,
} from '@/lib/public/portalCustomer';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const context = await resolvePublicPortalCustomer(request, 'cuenta_corriente');
    const overview = await getPortalCustomerOverview(context);
    const evaluacionVigente =
      overview.evaluaciones.find(item => item.es_vigente) ??
      overview.evaluaciones[0] ??
      null;

    return NextResponse.json({
      success: true,
      data: buildCuentaCorrientePayload({
        cliente: context.crm_cliente,
        evaluacion: evaluacionVigente,
        estadoSituacion: overview.estadosSituacion[0] ?? null,
        estadoResultados: overview.estadosResultados[0] ?? null,
      }),
    });
  } catch (error) {
    if (error instanceof PublicApiError) {
      return NextResponse.json(
        { success: false, error: error.message, errorCode: error.code },
        { status: error.status }
      );
    }

    console.error('[GET /api/public/cliente/me/cuenta-corriente]', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener cuenta corriente del cliente' },
      { status: 500 }
    );
  }
}
