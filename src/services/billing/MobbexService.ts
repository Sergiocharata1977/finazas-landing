/**
 * MobbexService - Servicio para integración con Mobbex Payments
 * https://mobbex.dev/
 */

import { createHmac } from 'crypto';

const MOBBEX_API_BASE = 'https://api.mobbex.com/p';

type MobbexHeaders = Record<string, string>;

interface MobbexCheckoutRequest {
  total: number;
  currency: string;
  reference: string;
  description: string;
  return_url: string;
  webhook: string;
  test?: boolean;
  items?: Array<{
    image: string;
    quantity: number;
    description: string;
    total: number;
  }>;
  customer?: {
    email: string;
    name: string;
    identification: string;
  };
  options?: {
    theme?: {
      type: string;
      background: string;
      showHeader: boolean;
    };
  };
}

interface MobbexCheckoutResponse {
  result: boolean;
  data: {
    id: string;
    url: string;
    description: string;
    currency: {
      code: string;
    };
    total: number;
  };
}

interface MobbexWebhookPayload {
  type: string;
  data: {
    payment: {
      id: string;
      status: {
        code: string;
        text: string;
      };
      total: number;
      reference: string;
    };
    subscriber?: {
      uid: string;
      email: string;
    };
  };
}

// Plan types for demo
export const MOBBEX_PLANS = {
  BASIC: {
    id: 'plan_basic_demo',
    name: 'Plan Básico',
    price: 5000, // ARS
    description: 'Acceso básico a la plataforma',
  },
  PREMIUM: {
    id: 'plan_premium_demo',
    name: 'Plan Premium',
    price: 15000, // ARS
    description: 'Acceso completo con todas las funcionalidades',
  },
} as const;

export class MobbexService {
  private apiKey: string;
  private accessToken: string;
  private testMode: boolean;

  constructor() {
    this.apiKey = process.env.MOBBEX_API_KEY || '';
    this.accessToken = process.env.MOBBEX_ACCESS_TOKEN || '';
    this.testMode = process.env.MOBBEX_TEST_MODE === 'true';
    this.webhookSecret = process.env.MOBBEX_WEBHOOK_SECRET || '';

    // Evitar warning en build time
    if (
      (!this.apiKey || !this.accessToken) &&
      process.env.NODE_ENV !== 'production' &&
      process.env.NEXT_PHASE !== 'phase-production-build'
    ) {
      console.warn('[MobbexService] Missing API credentials');
    }
  }

  private webhookSecret: string;

  private getHeaders(): MobbexHeaders {
    return {
      'x-api-key': this.apiKey,
      'x-access-token': this.accessToken,
      'content-type': 'application/json',
    };
  }

  /**
   * Crear checkout de suscripción
   */
  async createSubscriptionCheckout(params: {
    userId: string;
    userEmail: string;
    userName: string;
    planId: keyof typeof MOBBEX_PLANS;
    returnUrl: string;
    webhookUrl: string;
  }): Promise<MobbexCheckoutResponse> {
    const plan = MOBBEX_PLANS[params.planId];

    const checkoutData: MobbexCheckoutRequest = {
      total: plan.price,
      currency: 'ARS',
      reference: `sub_${params.userId}_${Date.now()}`,
      description: `Suscripción ${plan.name} - 9001App`,
      return_url: params.returnUrl,
      webhook: params.webhookUrl,
      test: this.testMode,
      items: [
        {
          image: 'https://9001app.com/logo.png',
          quantity: 1,
          description: plan.description,
          total: plan.price,
        },
      ],
      customer: {
        email: params.userEmail,
        name: params.userName,
        identification: params.userId,
      },
      options: {
        theme: {
          type: 'light',
          background: '#4F46E5', // Indigo theme
          showHeader: true,
        },
      },
    };

    const response = await fetch(`${MOBBEX_API_BASE}/checkout`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(checkoutData),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[MobbexService] Checkout error:', error);
      throw new Error(`Mobbex checkout failed: ${error}`);
    }

    return response.json();
  }
  /**
   * Valida la firma HMAC del webhook de Mobbex
   * CRÍTICO: Siempre validar antes de procesar el webhook
   */
  validateWebhookSignature(
    rawBody: string,
    providedSignature: string
  ): boolean {
    if (!this.webhookSecret) {
      console.error('[MobbexService] MOBBEX_WEBHOOK_SECRET no configurado');
      return false;
    }

    const expectedSignature = createHmac('sha256', this.webhookSecret)
      .update(rawBody)
      .digest('hex');

    // Comparación segura contra timing attacks
    if (providedSignature.length !== expectedSignature.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < expectedSignature.length; i++) {
      result |=
        expectedSignature.charCodeAt(i) ^ providedSignature.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Procesar webhook de Mobbex
   * @param payload - Payload del webhook
   * @param rawBody - Body raw para validar firma (opcional en dev)
   * @param signature - Firma proporcionada por Mobbex (opcional en dev)
   */
  parseWebhookPayload(
    payload: MobbexWebhookPayload,
    options?: { rawBody?: string; signature?: string }
  ): {
    success: boolean;
    userId: string | null;
    status: 'approved' | 'pending' | 'rejected';
    transactionId: string;
    signatureValid: boolean;
  } {
    // Validar firma si se proporcionan los parámetros
    let signatureValid = false;
    if (options?.rawBody && options?.signature) {
      signatureValid = this.validateWebhookSignature(
        options.rawBody,
        options.signature
      );
      if (!signatureValid && !this.testMode) {
        console.error('[MobbexService] Firma de webhook inválida');
        return {
          success: false,
          userId: null,
          status: 'rejected',
          transactionId: '',
          signatureValid: false,
        };
      }
    } else if (!this.testMode) {
      console.warn('[MobbexService] Webhook recibido sin validación de firma');
    }

    const paymentStatus = payload.data.payment.status.code;
    const reference = payload.data.payment.reference;

    // Extract userId from reference (format: sub_userId_timestamp)
    const userIdMatch = reference.match(/sub_(.+?)_\d+/);
    const userId = userIdMatch ? userIdMatch[1] : null;

    let status: 'approved' | 'pending' | 'rejected' = 'pending';

    // Mobbex status codes: 200 = approved, 1-99 = pending, 400+ = rejected
    const statusCode = parseInt(paymentStatus);
    if (statusCode >= 200 && statusCode < 400) {
      status = 'approved';
    } else if (statusCode >= 400) {
      status = 'rejected';
    }

    return {
      success: status === 'approved',
      userId,
      status,
      transactionId: payload.data.payment.id,
      signatureValid,
    };
  }

  /**
   * Verificar credenciales
   */
  async verifyCredentials(): Promise<boolean> {
    try {
      const response = await fetch(`${MOBBEX_API_BASE}/sources`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const mobbexService = new MobbexService();
