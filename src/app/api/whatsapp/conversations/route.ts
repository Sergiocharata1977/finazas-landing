import { withAuth } from '@/lib/api/withAuth';
import { getConversations } from '@/services/whatsapp';
import type { ConversationType } from '@/types/whatsapp';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export const GET = withAuth(
  async (request, _context, auth) => {
    try {
      const { searchParams } = new URL(request.url);
      const requestedOrgId = searchParams.get('organization_id') || undefined;
      const organizationId =
        auth.role === 'super_admin'
          ? requestedOrgId || auth.organizationId
          : auth.organizationId;
      const type = searchParams.get('type') as ConversationType | null;
      const clienteId = searchParams.get('cliente_id');
      const limit = searchParams.get('limit');

      if (!organizationId) {
        return NextResponse.json(
          { success: false, error: 'organization_id es requerido' },
          { status: 400 }
        );
      }

      const conversations = await getConversations(organizationId, {
        type: type || undefined,
        clienteId: clienteId || undefined,
        limit: limit ? parseInt(limit) : 50,
      });

      return NextResponse.json({
        success: true,
        data: conversations,
        count: conversations.length,
      });
    } catch (error: any) {
      console.error('[API /whatsapp/conversations] Error:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Error interno del servidor',
        },
        { status: 500 }
      );
    }
  },
  { roles: ['admin', 'gerente', 'jefe', 'operario', 'super_admin'] }
);
