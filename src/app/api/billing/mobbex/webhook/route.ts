/**
 * API Route: POST /api/billing/mobbex/webhook
 * Recibe notificaciones de pago de Mobbex
 */

import { adminDb } from '@/firebase/admin';
import { writeIntegrationDLQ } from '@/lib/integration/dlq';
import { mobbexService } from '@/services/billing/MobbexService';
import { createHash } from 'crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let replayKey = '';
  try {
    const signature =
      request.headers.get('x-mobbex-signature') ||
      request.headers.get('x-signature') ||
      request.headers.get('x-webhook-signature') ||
      '';
    const rawBody = await request.text();

    if (!signature) {
      console.error('[Mobbex Webhook] Missing signature');
      return NextResponse.json(
        { received: true, processed: false, error: 'Missing signature' },
        { status: 401 }
      );
    }

    if (!mobbexService.validateWebhookSignature(rawBody, signature)) {
      console.error('[Mobbex Webhook] Invalid signature');
      return NextResponse.json(
        { received: true, processed: false, error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody);

    console.log('[Mobbex Webhook] Received:', JSON.stringify(payload, null, 2));

    // Parsear el payload
    const result = mobbexService.parseWebhookPayload(payload, {
      rawBody,
      signature,
    });

    replayKey = createHash('sha256')
      .update(`${signature}:${rawBody}`)
      .digest('hex');

    const receiptRef = adminDb.collection('webhook_receipts').doc(replayKey);
    const receipt = await receiptRef.get();
    if (receipt.exists) {
      const status = String(receipt.data()?.status || 'processed');
      if (status === 'processed') {
        return NextResponse.json({
          received: true,
          processed: true,
          duplicate: true,
          replayKey,
        });
      }
    }

    await receiptRef.set(
      {
        provider: 'mobbex',
        status: 'processing',
        replay_key: replayKey,
        transaction_id: result.transactionId || null,
        user_id: result.userId || null,
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    if (!result.userId) {
      console.error('[Mobbex Webhook] Could not extract userId from reference');
      return NextResponse.json({ received: true, warning: 'userId not found' });
    }

    // Actualizar usuario en Firestore
    const userRef = adminDb.collection('users').doc(result.userId);

    if (result.success) {
      // Pago exitoso - activar suscripción
      const nextBillingDate = new Date();
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

      await userRef.update({
        planType: 'premium',
        status: 'active',
        activo: true,
        billing_status: 'active',
        mobbex_transaction_id: result.transactionId,
        next_billing_date: nextBillingDate,
        expirationDate: nextBillingDate,
        updated_at: FieldValue.serverTimestamp(),
      });

      console.log(`[Mobbex Webhook] User ${result.userId} upgraded to premium`);
    } else if (result.status === 'rejected') {
      // Pago rechazado
      await userRef.update({
        billing_status: 'past_due',
        last_payment_error: result.transactionId,
        updated_at: FieldValue.serverTimestamp(),
      });

      console.log(
        `[Mobbex Webhook] Payment rejected for user ${result.userId}`
      );
    }

    await receiptRef.set(
      {
        status: 'processed',
        processed_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({
      received: true,
      processed: true,
      userId: result.userId,
      status: result.status,
      signatureValid: result.signatureValid,
      replayKey,
    });
  } catch (error) {
    console.error('[Mobbex Webhook] Error:', error);
    if (replayKey) {
      await adminDb
        .collection('webhook_receipts')
        .doc(replayKey)
        .set(
          {
            status: 'failed',
            failed_at: FieldValue.serverTimestamp(),
            updated_at: FieldValue.serverTimestamp(),
            error_message:
              error instanceof Error ? error.message : 'Processing error',
          },
          { merge: true }
        );
    }
    await writeIntegrationDLQ({
      source: 'billing',
      operation: 'mobbex.webhook.process',
      payload: { replay_key: replayKey || null },
      error,
      traceId: replayKey || undefined,
    });
    return NextResponse.json(
      {
        received: true,
        processed: false,
        error: error instanceof Error ? error.message : 'Processing error',
      },
      { status: 400 }
    );
  }
}

// GET para verificar que el endpoint está activo
export async function GET() {
  return NextResponse.json({
    service: 'mobbex-webhook',
    status: 'active',
    timestamp: new Date().toISOString(),
  });
}
