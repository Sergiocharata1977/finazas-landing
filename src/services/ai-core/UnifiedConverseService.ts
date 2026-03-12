import { ContextBuilder } from '@/ai/services/ContextBuilder';
import { LLMRouter, type LLMRouterMessage } from '@/ai/services/LLMRouter';
import type { LLMResponseMetadata } from '@/ai/types/LLMRouterTypes';
import { ContextService } from '@/features/chat/services/ContextService';
import { AIConversationStore } from '@/services/ai-core/conversationStore';
import type { AIChannel, AIMessage } from '@/types/ai-core';

interface UnifiedConverseInput {
  channel: AIChannel;
  message: string;
  sessionId?: string;
  organizationId: string;
  userId: string;
  userRole: string;
  pathname?: string;
}

export interface UnifiedConverseResult {
  reply: string;
  sessionId: string;
  tokensUsed: number;
  metadata: LLMResponseMetadata;
  traceId: string;
  messages: [AIMessage, AIMessage];
}

function estimateTokensUsed(parts: string[]): number {
  const chars = parts.join(' ').trim().length;
  if (chars === 0) {
    return 0;
  }

  return Math.max(1, Math.ceil(chars / 4));
}

function buildPromptWithDocs(basePrompt: string, docsContext: string): string {
  if (!docsContext) {
    return basePrompt;
  }

  return [
    basePrompt,
    '## Documentacion funcional relevante',
    docsContext,
    'Usa esta documentacion como referencia prioritaria para explicar pantallas, pasos y restricciones del sistema.',
  ].join('\n\n');
}

export class UnifiedConverseService {
  static async converse(
    input: UnifiedConverseInput
  ): Promise<UnifiedConverseResult> {
    const conversation = await AIConversationStore.getOrCreateConversation({
      userId: input.userId,
      organizationId: input.organizationId,
      channel: input.channel,
      sessionId: input.sessionId,
    });

    const history = await AIConversationStore.getHistory(conversation.id, 20);
    const systemPrompt = await this.buildSystemPrompt({
      organizationId: input.organizationId,
      userId: input.userId,
      pathname: input.pathname,
      userRole: input.userRole,
    });

    const llmResponse = await LLMRouter.chat({
      message: input.message,
      history: history.map(message => ({
        role: message.role,
        content: message.content,
      })) as LLMRouterMessage[],
      systemPrompt,
      capability: 'chat_general',
      mode: 'fast',
    });

    const traceId = crypto.randomUUID();
    const createdAt = new Date();

    const userMessage = await AIConversationStore.appendMessage({
      conversationId: conversation.id,
      role: 'user',
      channel: input.channel,
      content: input.message,
      traceId,
      timestamp: createdAt,
      userId: input.userId,
      organizationId: input.organizationId,
    });

    const assistantMessage = await AIConversationStore.appendMessage({
      conversationId: conversation.id,
      role: 'assistant',
      channel: input.channel,
      content: llmResponse.content,
      traceId,
      timestamp: new Date(),
      userId: input.userId,
      organizationId: input.organizationId,
    });

    return {
      reply: llmResponse.content,
      sessionId: conversation.id,
      tokensUsed: estimateTokensUsed([
        systemPrompt,
        ...history.map(message => message.content),
        input.message,
        llmResponse.content,
      ]),
      metadata: llmResponse.metadata,
      traceId,
      messages: [userMessage, assistantMessage],
    };
  }

  private static async buildSystemPrompt(input: {
    organizationId: string;
    userId: string;
    pathname?: string;
    userRole: string;
  }): Promise<string> {
    const unifiedContext = await ContextService.getUnifiedContext(
      input.organizationId,
      input.userId
    );
    const legacyContext = ContextBuilder.toLegacyChatContext(unifiedContext);
    const basePrompt = ContextService.generateSystemPrompt(legacyContext);
    const docsContext = ContextBuilder.buildDocumentationContext(
      input.pathname,
      input.userRole
    );

    return buildPromptWithDocs(basePrompt, docsContext);
  }
}
