/**
 * API Route: POST /api/billing/mobbex/subscribe
 * Inicia el checkout de suscripcion con Mobbex
 */

import { withAuth } from '@/lib/api/withAuth';
import { MOBBEX_PLANS, mobbexService } from '@/services/billing/MobbexService';
import { NextRequest, NextResponse } from 'next/server';

export const POST = withAuth(
  async (request: NextRequest, _context, auth) => {
    try {
      const body = await request.json();
      const { userName, planId } = body as {
        userName?: string;
        planId?: string;
      };

      if (!planId) {
        return NextResponse.json(
          { error: 'Missing required field: planId' },
          { status: 400 }
        );
      }

      if (!Object.keys(MOBBEX_PLANS).includes(planId)) {
        return NextResponse.json(
          {
            error: `Invalid planId. Valid options: ${Object.keys(MOBBEX_PLANS).join(', ')}`,
          },
          { status: 400 }
        );
      }

      const userId = auth.uid;
      const userEmail = auth.email;
      if (!userEmail) {
        return NextResponse.json(
          { error: 'Missing authenticated user email' },
          { status: 400 }
        );
      }

      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const returnUrl = `${baseUrl}/billing/success?userId=${userId}`;
      const webhookUrl = `${baseUrl}/api/billing/mobbex/webhook`;

      const checkout = await mobbexService.createSubscriptionCheckout({
        userId,
        userEmail,
        userName: userName || userEmail.split('@')[0],
        planId: planId as keyof typeof MOBBEX_PLANS,
        returnUrl,
        webhookUrl,
      });

      if (!checkout.result) {
        throw new Error('Failed to create Mobbex checkout');
      }

      return NextResponse.json({
        success: true,
        checkoutUrl: checkout.data.url,
        checkoutId: checkout.data.id,
        plan: MOBBEX_PLANS[planId as keyof typeof MOBBEX_PLANS],
      });
    } catch (error) {
      console.error('[Mobbex Subscribe] Error:', error);
      return NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : 'Internal server error',
        },
        { status: 500 }
      );
    }
  },
  { roles: ['admin', 'gerente', 'super_admin'] }
);

export const GET = withAuth(
  async () => {
    const isConfigured = await mobbexService.verifyCredentials();

    return NextResponse.json({
      service: 'mobbex-subscribe',
      configured: isConfigured,
      plans: MOBBEX_PLANS,
      testMode: process.env.MOBBEX_TEST_MODE === 'true',
    });
  },
  { roles: ['admin', 'gerente', 'super_admin'] }
);
