import { withAuth } from '@/lib/api/withAuth';
import { UnifiedConverseService } from '@/services/ai-core/UnifiedConverseService';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type LegacyConverseBody = {
  channel?: 'chat' | 'voice' | 'whatsapp';
  message?: string;
  text?: string;
  prompt?: string;
  sessionId?: string;
  session_id?: string;
  organizationId?: string;
  organization_id?: string;
  pathname?: string;
};

export const POST = withAuth(
  async (request, _context, auth) => {
    try {
      const body = (await request.json()) as LegacyConverseBody;
      const message = String(
        body.message || body.text || body.prompt || ''
      ).trim();
      if (!message) {
        return NextResponse.json(
          { error: 'message requerido' },
          { status: 400 }
        );
      }

      const organizationId = String(
        body.organizationId || body.organization_id || auth.organizationId || ''
      ).trim();
      if (!organizationId) {
        return NextResponse.json(
          { error: 'organizationId requerido' },
          { status: 400 }
        );
      }

      const sessionId = String(body.sessionId || body.session_id || '').trim();
      const resolvedSessionId =
        sessionId || `legacy-converse:${auth.uid || 'anonymous'}`;

      const result = await UnifiedConverseService.converse({
        channel: body.channel || 'chat',
        message,
        sessionId: resolvedSessionId,
        organizationId,
        userId: auth.uid,
        userRole: auth.role,
        pathname: body.pathname || undefined,
      });

      return NextResponse.json({
        reply: result.reply,
        sessionId: result.sessionId,
        tokensUsed: result.tokensUsed,
        traceId: result.traceId,
        conversationId: result.sessionId,
        messages: result.messages,
      });
    } catch (error) {
      console.error('[API /api/converse] Error:', error);
      return NextResponse.json(
        {
          error: 'Error al procesar conversacion IA',
          message: error instanceof Error ? error.message : 'Error desconocido',
        },
        { status: 500 }
      );
    }
  },
  { roles: ['admin', 'gerente', 'jefe', 'operario', 'auditor', 'super_admin'] }
);
