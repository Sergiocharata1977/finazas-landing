import { AgentJob } from '@/types/agents';
import { IntentHandler } from './IntentHandler';

/**
 * Handler baseline para intent de entrada WhatsApp.
 */
export class WhatsappMessageReceivedHandler implements IntentHandler {
  intent = 'whatsapp.message.received';

  /**
   * Mantiene compatibilidad actual mientras se integra router bidireccional.
   */
  async handle(_job: AgentJob): Promise<unknown> {
    return { action: 'ignored', reason: 'Not implemented yet' };
  }
}
