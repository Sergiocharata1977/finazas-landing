// Service for tracking Claude API usage and costs

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { UsoClaude, UsageSummary, LimitStatus } from '@/types/chat';
import { CLAUDE_PRICING, CLAUDE_LIMITS } from '@/types/claude';

const COLLECTION_NAME = 'uso_claude';

export class UsageTrackingService {
  /**
   * Register Claude API usage
   * @param data Usage data
   */
  static async registrar(data: {
    userId: string;
    sessionId?: string;
    tipoOperacion: UsoClaude['tipo_operacion'];
    tokens: { input: number; output: number };
    metadata: Record<string, any>;
  }): Promise<void> {
    try {
      const costoEstimado = this.calcularCosto(
        data.tokens.input,
        data.tokens.output
      );

      const usoData = {
        user_id: data.userId,
        session_id: data.sessionId || null,
        tipo_operacion: data.tipoOperacion,
        tokens_input: data.tokens.input,
        tokens_output: data.tokens.output,
        costo_estimado: costoEstimado,
        fecha: serverTimestamp(),
        metadata: data.metadata,
      };

      await addDoc(collection(db, COLLECTION_NAME), usoData);

      console.log('[UsageTrackingService] Registered usage:', {
        userId: data.userId,
        tokens: data.tokens,
        cost: costoEstimado,
      });
    } catch (error) {
      console.error('[UsageTrackingService] Error registering usage:', error);
      // Don't throw - usage tracking failure shouldn't break the app
    }
  }

  /**
   * Calculate cost from tokens
   * @param tokensInput Input tokens
   * @param tokensOutput Output tokens
   * @returns Estimated cost in USD
   */
  static calcularCosto(tokensInput: number, tokensOutput: number): number {
    const inputCost =
      (tokensInput / 1000000) * CLAUDE_PRICING.INPUT_PER_MILLION;
    const outputCost =
      (tokensOutput / 1000000) * CLAUDE_PRICING.OUTPUT_PER_MILLION;

    return inputCost + outputCost;
  }

  /**
   * Get usage by user
   * @param userId User ID
   * @param startDate Optional start date
   * @param endDate Optional end date
   * @returns Array of usage records
   */
  static async getUsageByUser(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<UsoClaude[]> {
    try {
      let q = query(
        collection(db, COLLECTION_NAME),
        where('user_id', '==', userId),
        orderBy('fecha', 'desc')
      );

      // Add date filters if provided
      if (startDate) {
        q = query(q, where('fecha', '>=', Timestamp.fromDate(startDate)));
      }
      if (endDate) {
        q = query(q, where('fecha', '<=', Timestamp.fromDate(endDate)));
      }

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          user_id: data.user_id,
          session_id: data.session_id,
          tipo_operacion: data.tipo_operacion,
          tokens_input: data.tokens_input,
          tokens_output: data.tokens_output,
          costo_estimado: data.costo_estimado,
          fecha: data.fecha?.toDate() || new Date(),
          metadata: data.metadata,
        } as UsoClaude;
      });
    } catch (error) {
      console.error(
        '[UsageTrackingService] Error getting usage by user:',
        error
      );
      throw new Error('Failed to get usage by user');
    }
  }

  /**
   * Get usage summary for a period
   * @param userId User ID
   * @param period Period type
   * @returns Usage summary
   */
  static async getUsageSummary(
    userId: string,
    period: 'day' | 'week' | 'month'
  ): Promise<UsageSummary> {
    try {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'day':
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }

      const usage = await this.getUsageByUser(userId, startDate);

      const summary: UsageSummary = {
        total_consultas: usage.length,
        total_tokens_input: usage.reduce((sum, u) => sum + u.tokens_input, 0),
        total_tokens_output: usage.reduce((sum, u) => sum + u.tokens_output, 0),
        costo_total: usage.reduce((sum, u) => sum + u.costo_estimado, 0),
        promedio_tokens_por_consulta: 0,
      };

      if (summary.total_consultas > 0) {
        const totalTokens =
          summary.total_tokens_input + summary.total_tokens_output;
        summary.promedio_tokens_por_consulta = Math.round(
          totalTokens / summary.total_consultas
        );
      }

      return summary;
    } catch (error) {
      console.error(
        '[UsageTrackingService] Error getting usage summary:',
        error
      );
      throw new Error('Failed to get usage summary');
    }
  }

  /**
   * Check if user has exceeded limits
   * @param userId User ID
   * @returns Limit status
   */
  static async checkLimits(userId: string): Promise<LimitStatus> {
    try {
      // Check daily queries
      const todaySummary = await this.getUsageSummary(userId, 'day');
      const consultasRestantes = Math.max(
        0,
        CLAUDE_LIMITS.CONSULTAS_POR_DIA - todaySummary.total_consultas
      );

      // Check monthly tokens
      const monthSummary = await this.getUsageSummary(userId, 'month');
      const totalTokensMonth =
        monthSummary.total_tokens_input + monthSummary.total_tokens_output;
      const tokensRestantes = Math.max(
        0,
        CLAUDE_LIMITS.TOKENS_POR_MES - totalTokensMonth
      );

      // Check monthly cost
      const costoRestante = Math.max(
        0,
        CLAUDE_LIMITS.COSTO_MAXIMO_MENSUAL - monthSummary.costo_total
      );

      const exceeded =
        consultasRestantes === 0 ||
        tokensRestantes === 0 ||
        costoRestante === 0;

      return {
        exceeded,
        consultas_restantes: consultasRestantes,
        tokens_restantes: tokensRestantes,
        costo_restante: costoRestante,
      };
    } catch (error) {
      console.error('[UsageTrackingService] Error checking limits:', error);
      // Return permissive limits on error
      return {
        exceeded: false,
        consultas_restantes: CLAUDE_LIMITS.CONSULTAS_POR_DIA,
        tokens_restantes: CLAUDE_LIMITS.TOKENS_POR_MES,
        costo_restante: CLAUDE_LIMITS.COSTO_MAXIMO_MENSUAL,
      };
    }
  }

  /**
   * Get usage by operation type
   * @param userId User ID
   * @param tipoOperacion Operation type
   * @param startDate Optional start date
   * @param endDate Optional end date
   * @returns Array of usage records
   */
  static async getUsageByType(
    userId: string,
    tipoOperacion: UsoClaude['tipo_operacion'],
    startDate?: Date,
    endDate?: Date
  ): Promise<UsoClaude[]> {
    try {
      let q = query(
        collection(db, COLLECTION_NAME),
        where('user_id', '==', userId),
        where('tipo_operacion', '==', tipoOperacion),
        orderBy('fecha', 'desc')
      );

      if (startDate) {
        q = query(q, where('fecha', '>=', Timestamp.fromDate(startDate)));
      }
      if (endDate) {
        q = query(q, where('fecha', '<=', Timestamp.fromDate(endDate)));
      }

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          user_id: data.user_id,
          session_id: data.session_id,
          tipo_operacion: data.tipo_operacion,
          tokens_input: data.tokens_input,
          tokens_output: data.tokens_output,
          costo_estimado: data.costo_estimado,
          fecha: data.fecha?.toDate() || new Date(),
          metadata: data.metadata,
        } as UsoClaude;
      });
    } catch (error) {
      console.error(
        '[UsageTrackingService] Error getting usage by type:',
        error
      );
      throw new Error('Failed to get usage by type');
    }
  }

  /**
   * Get total usage across all users (admin only)
   * @param startDate Start date
   * @param endDate End date
   * @returns Array of all usage records
   */
  static async getTotalUsage(
    startDate?: Date,
    endDate?: Date
  ): Promise<UsoClaude[]> {
    try {
      let q = query(collection(db, COLLECTION_NAME), orderBy('fecha', 'desc'));

      if (startDate) {
        q = query(q, where('fecha', '>=', Timestamp.fromDate(startDate)));
      }
      if (endDate) {
        q = query(q, where('fecha', '<=', Timestamp.fromDate(endDate)));
      }

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          user_id: data.user_id,
          session_id: data.session_id,
          tipo_operacion: data.tipo_operacion,
          tokens_input: data.tokens_input,
          tokens_output: data.tokens_output,
          costo_estimado: data.costo_estimado,
          fecha: data.fecha?.toDate() || new Date(),
          metadata: data.metadata,
        } as UsoClaude;
      });
    } catch (error) {
      console.error('[UsageTrackingService] Error getting total usage:', error);
      throw new Error('Failed to get total usage');
    }
  }
}
