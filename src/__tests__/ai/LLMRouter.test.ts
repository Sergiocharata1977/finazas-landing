import { LLMRouter } from '@/ai/services/LLMRouter';
import { AIRouter } from '@/lib/ai/AIRouter';
import { ClaudeService } from '@/lib/claude/client';
import { GroqService } from '@/lib/groq/GroqService';

jest.mock('@/lib/groq/GroqService', () => ({
  GroqService: {
    enviarMensaje: jest.fn(),
    enviarMensajeStream: jest.fn(),
  },
}));

jest.mock('@/lib/claude/client', () => ({
  ClaudeService: {
    enviarMensaje: jest.fn(),
    getModel: jest.fn(() => 'claude-test-model'),
  },
}));

describe('LLMRouter', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      GROQ_API_KEY: 'test-groq',
      ANTHROPIC_API_KEY: 'test-claude',
      NEXT_PUBLIC_CLAUDE_MODEL: 'claude-test-model',
      AI_ROUTER_ENABLE_GROQ: 'true',
      AI_ROUTER_ENABLE_CLAUDE: 'true',
      AI_ROUTER_ENABLE_FALLBACK: 'true',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('routes fast mode to groq for chat_general and returns metadata', async () => {
    (GroqService.enviarMensaje as jest.Mock).mockResolvedValue({
      role: 'assistant',
      content: 'respuesta groq',
    });

    const result = await LLMRouter.chat({
      message: 'Hola',
      mode: 'fast',
    });

    expect(GroqService.enviarMensaje).toHaveBeenCalledTimes(1);
    expect(ClaudeService.enviarMensaje).not.toHaveBeenCalled();
    expect(result.content).toBe('respuesta groq');
    expect(result.metadata.provider).toBe('groq');
    expect(result.metadata.mode).toBe('fast');
    expect(result.metadata.capability).toBe('chat_general');
    expect(result.metadata.fallbackUsed).toBe(false);
  });

  it('falls back to groq when claude fails in quality mode', async () => {
    (ClaudeService.enviarMensaje as jest.Mock).mockRejectedValue(
      new Error('Claude down')
    );
    (GroqService.enviarMensaje as jest.Mock).mockResolvedValue({
      role: 'assistant',
      content: 'fallback groq',
    });

    const result = await LLMRouter.chat({
      message: 'Analiza esto',
      mode: 'quality',
    });

    expect(ClaudeService.enviarMensaje).toHaveBeenCalledTimes(1);
    expect(GroqService.enviarMensaje).toHaveBeenCalledTimes(1);
    expect(result.content).toBe('fallback groq');
    expect(result.metadata.provider).toBe('groq');
    expect(result.metadata.capability).toBe('chat_general');
    expect(result.metadata.fallbackUsed).toBe(true);
    expect(result.metadata.attempts).toHaveLength(2);
    expect(result.metadata.attempts[0].success).toBe(false);
    expect(result.metadata.attempts[1].success).toBe(true);
  });

  it('uses explicit audit_eval capability with claude as primary', async () => {
    (ClaudeService.enviarMensaje as jest.Mock).mockResolvedValue({
      content: 'audit ok',
      usage: { input: 1, output: 1 },
      tiempo_respuesta_ms: 12,
    });

    const result = await LLMRouter.chat({
      message: 'Evalua auditoria',
      capability: 'audit_eval',
    });

    expect(ClaudeService.enviarMensaje).toHaveBeenCalledTimes(1);
    expect(result.metadata.provider).toBe('claude');
    expect(result.metadata.capability).toBe('audit_eval');
  });

  it('keeps AIRouter compatibility for chat and provider info', async () => {
    (GroqService.enviarMensaje as jest.Mock).mockResolvedValue({
      role: 'assistant',
      content: 'ok',
    });

    const response = await AIRouter.chat('Ping', [], undefined, 'fast');
    const info = AIRouter.getProviderInfo('fast');

    expect(response).toBe('ok');
    expect(info.provider).toBe('groq');
    expect(typeof AIRouter.getAvailableProviders).toBe('function');
  });
});
