import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { payments, patientActions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(failedPayment);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    const patientId = paymentIntent.metadata.patientId;
    
    if (!patientId) {
      console.error('No patient ID in payment intent metadata');
      return;
    }

    // Update payment record status if it exists
    await db
      .update(payments)
      .set({ 
        status: 'succeeded',
        updatedAt: new Date()
      })
      .where(eq(payments.stripePaymentIntentId, paymentIntent.id));

    // Log the webhook event
    await db.insert(patientActions).values({
      patientId,
      action: 'payment_webhook_received',
      details: JSON.stringify({
        description: 'Payment succeeded webhook received',
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100, // Convert from cents
        eventType: 'payment_intent.succeeded',
      }),
    });

    console.log(`Payment succeeded for patient ${patientId}: ${paymentIntent.id}`);

  } catch (error) {
    console.error('Error handling payment success webhook:', error);
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  try {
    const patientId = paymentIntent.metadata.patientId;
    
    if (!patientId) {
      console.error('No patient ID in payment intent metadata');
      return;
    }

    // Update payment record status if it exists
    await db
      .update(payments)
      .set({ 
        status: 'failed',
        updatedAt: new Date()
      })
      .where(eq(payments.stripePaymentIntentId, paymentIntent.id));

    // Log the webhook event
    await db.insert(patientActions).values({
      patientId,
      action: 'payment_webhook_received',
      details: JSON.stringify({
        description: 'Payment failed webhook received',
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100, // Convert from cents
        eventType: 'payment_intent.payment_failed',
        lastPaymentError: paymentIntent.last_payment_error?.message,
      }),
    });

    console.log(`Payment failed for patient ${patientId}: ${paymentIntent.id}`);

  } catch (error) {
    console.error('Error handling payment failure webhook:', error);
  }
}