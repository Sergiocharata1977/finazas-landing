import { ChannelIdentityResolver } from '@/services/ai-core/channelIdentityResolver';
import { AIIdempotencyGuard } from '@/services/ai-core/idempotencyGuard';
import { AIPolicyEngine } from '@/services/ai-core/policyEngine';
import { UnifiedConverseService } from '@/services/ai-core/UnifiedConverseService';
import { UserRoleResolver } from '@/services/ai-core/userRoleResolver';
import type { ConverseResponse } from '@/types/ai-core';

export class WhatsAppAdapter {
  static async processIncoming(params: {
    from: string;
    body?: string;
    mediaUrl?: string;
    messageSid?: string;
    fallbackOrganizationId?: string | null;
  }): Promise<
    | {
        ok: true;
        response: ConverseResponse;
        userId: string;
        organizationId: string;
      }
    | { ok: false; reason: string; code: string }
  > {
    const identity = await ChannelIdentityResolver.resolveByExternalId({
      channel: 'whatsapp',
      externalId: params.from,
    });

    if (!identity) {
      return {
        ok: false,
        code: 'IDENTITY_NOT_LINKED',
        reason: 'Numero de WhatsApp no vinculado a un usuario',
      };
    }

    const content = (params.body || '').trim();
    const resolvedRole = await UserRoleResolver.resolve(identity.userId);
    const policy = AIPolicyEngine.checkPermission({
      userId: identity.userId,
      organizationId:
        identity.organizationId || params.fallbackOrganizationId || '',
      role: resolvedRole,
      channel: 'whatsapp',
      action: 'converse',
      inputText: content,
    });
    if (!policy.allowed) {
      return {
        ok: false,
        code: policy.code || 'FORBIDDEN',
        reason: policy.reason || 'Accion bloqueada por permisos',
      };
    }

    const key = AIIdempotencyGuard.buildKey({
      channel: 'whatsapp',
      userId: identity.userId,
      organizationId: identity.organizationId,
      externalMessageId: params.messageSid,
      contentPreview: content || params.mediaUrl || '',
    });
    if (key) {
      const cached = await AIIdempotencyGuard.get(key);
      if (cached) {
        return {
          ok: true,
          response: cached,
          userId: identity.userId,
          organizationId: identity.organizationId,
        };
      }
    }

    const response = await UnifiedConverseService.converse({
      channel: 'whatsapp',
      message: content || params.mediaUrl || '[audio sin transcripcion]',
      sessionId: `wa:${params.from.replace(/^whatsapp:/i, '')}`,
      organizationId: identity.organizationId,
      userId: identity.userId,
      userRole: resolvedRole,
      pathname: '/whatsapp',
    });

    const mappedResponse: ConverseResponse = {
      traceId: response.traceId,
      conversationId: response.sessionId,
      messages: response.messages,
      actions: [],
      uiCommands: [],
    };

    if (key) {
      await AIIdempotencyGuard.set({
        key,
        conversationId: mappedResponse.conversationId,
        response: mappedResponse,
      });
    }

    return {
      ok: true,
      response: mappedResponse,
      userId: identity.userId,
      organizationId: identity.organizationId,
    };
  }
}
