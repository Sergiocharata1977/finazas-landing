import { withAuth } from '@/lib/api/withAuth';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export const GET = withAuth(
  async (request, _context, auth) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const vendedorId = searchParams.get('vendedorId');
      const requestedOrgId = searchParams.get('organizationId') || undefined;
      const organizationId =
        auth.role === 'super_admin'
          ? requestedOrgId || auth.organizationId
          : auth.organizationId;

      if (!organizationId) {
        return NextResponse.json(
          { success: false, error: 'organizationId es requerido' },
          { status: 400 }
        );
      }

      const db = getAdminFirestore();
      const clientesSnapshot = await db
        .collection('crm_organizaciones')
        .where('organization_id', '==', organizationId)
        .where('isActive', '==', true)
        .get();

      const clientes = clientesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          organizationId: data.organization_id,
          razonSocial: data.razon_social || data.nombre || 'Sin nombre',
          cuit: data.cuit || '',
          direccion: data.direccion || '',
          localidad: data.localidad || data.ciudad || '',
          provincia: data.provincia || '',
          ubicacion: data.ubicacion || undefined,
          telefono: data.telefono || '',
          email: data.email || '',
          vendedorId: data.responsable_id || vendedorId || '',
          estado: data.isActive ? 'activo' : 'inactivo',
          ultimaVisita: data.ultima_interaccion || undefined,
          notas: data.notas || '',
          lastSyncAt: new Date().toISOString(),
          version: 1,
        };
      });

      return NextResponse.json({
        success: true,
        clientes,
        count: clientes.length,
        syncedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[API Vendedor Clientes] Error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Error al listar clientes',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  },
  { roles: ['admin', 'gerente', 'jefe', 'operario', 'super_admin'] }
);
