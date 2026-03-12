import { withAuth } from '@/lib/api/withAuth';
import {
  resolveAuthorizedOrganizationId,
  toOrganizationApiError,
} from '@/middleware/verifyOrganization';
import { ChannelIdentityResolver } from '@/services/ai-core/channelIdentityResolver';
import { UnifiedConverseService } from '@/services/ai-core/UnifiedConverseService';
import { UserRoleResolver } from '@/services/ai-core/userRoleResolver';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const ConverseRequestSchema = z.object({
  channel: z.enum(['chat', 'voice', 'whatsapp']),
  message: z.string().trim().min(1, 'message requerido'),
  sessionId: z.string().trim().min(1, 'sessionId requerido'),
  organizationId: z.string().trim().min(1, 'organizationId requerido'),
  pathname: z.string().trim().optional(),
  externalId: z.string().trim().optional(),
});

type ConverseBody = z.infer<typeof ConverseRequestSchema>;

function resolveInternalWebhookSecret(): string {
  return (
    process.env.AI_INTERNAL_API_SECRET ||
    process.env.INTERNAL_API_SECRET ||
    process.env.WHATSAPP_INTERNAL_API_SECRET ||
    process.env.WHATSAPP_APP_SECRET ||
    ''
  );
}

async function runConverse(
  body: ConverseBody,
  actor: {
    userId: string;
    organizationId: string;
    userRole: string;
  }
) {
  const result = await UnifiedConverseService.converse({
    channel: body.channel,
    message: body.message,
    sessionId: body.sessionId,
    organizationId: actor.organizationId,
    userId: actor.userId,
    userRole: actor.userRole,
    pathname: body.pathname,
  });

  return NextResponse.json({
    reply: result.reply,
    sessionId: result.sessionId,
    tokensUsed: result.tokensUsed,
    traceId: result.traceId,
    conversationId: result.sessionId,
    messages: result.messages,
  });
}

const authenticatedPost = withAuth(
  async (request, _context, auth) => {
    const body = ConverseRequestSchema.parse(await request.json());
    const orgScope = await resolveAuthorizedOrganizationId(
      {
        uid: auth.uid,
        role: auth.role,
        organizationId: auth.organizationId,
      },
      body.organizationId
    );

    if (!orgScope.ok || !orgScope.organizationId) {
      const error = toOrganizationApiError(orgScope, {
        defaultStatus: 403,
        defaultError: 'Acceso denegado',
      });
      return NextResponse.json(
        { error: error.error, errorCode: error.errorCode },
        { status: error.status }
      );
    }

    return runConverse(body, {
      userId: auth.uid,
      organizationId: orgScope.organizationId,
      userRole: auth.role,
    });
  },
  { roles: ['admin', 'gerente', 'jefe', 'operario', 'auditor', 'super_admin'] }
);

export async function POST(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  try {
    const internalSecret = resolveInternalWebhookSecret();
    const providedSecret = request.headers.get('x-internal-webhook-secret');

    if (internalSecret && providedSecret && providedSecret === internalSecret) {
      const body = ConverseRequestSchema.parse(await request.json());

      if (body.channel !== 'whatsapp') {
        return NextResponse.json(
          { error: 'Canal interno no permitido' },
          { status: 403 }
        );
      }

      const externalId = body.externalId?.trim();
      if (!externalId) {
        return NextResponse.json(
          { error: 'externalId requerido para WhatsApp interno' },
          { status: 400 }
        );
      }

      const identity = await ChannelIdentityResolver.resolveByExternalId({
        channel: 'whatsapp',
        externalId,
      });

      if (!identity?.organizationId) {
        return NextResponse.json(
          {
            error: 'Numero de WhatsApp no vinculado a un usuario',
            errorCode: 'IDENTITY_NOT_LINKED',
          },
          { status: 404 }
        );
      }

      const userRole = await UserRoleResolver.resolve(identity.userId);

      return runConverse(body, {
        userId: identity.userId,
        organizationId: identity.organizationId,
        userRole,
      });
    }

    return authenticatedPost(request, context);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Payload invalido', details: error.issues },
        { status: 400 }
      );
    }

    console.error('[API /api/ai/converse] Error:', error);
    return NextResponse.json(
      {
        error: 'Error al procesar conversacion IA',
        message: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
