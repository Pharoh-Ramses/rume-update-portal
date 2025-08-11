import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { services, payments, patientActions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentIntentId, serviceIds, amount } = await request.json();

    if (!paymentIntentId || !serviceIds || !Array.isArray(serviceIds) || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    // Verify the payment intent belongs to this patient
    if (paymentIntent.metadata.patientId !== session.user.id) {
      return NextResponse.json({ error: 'Payment intent mismatch' }, { status: 403 });
    }

    // Get the services to be marked as paid
    const servicesToUpdate = await db
      .select()
      .from(services)
      .where(
        eq(services.patientId, session.user.id)
      );

    const selectedServices = servicesToUpdate.filter(service => 
      serviceIds.includes(service.id) && !service.isPaid
    );

    if (selectedServices.length === 0) {
      return NextResponse.json({ error: 'No valid services to update' }, { status: 400 });
    }

    // Start a transaction to update services and create payment record
    await db.transaction(async (tx) => {
      // Mark services as paid
      for (const service of selectedServices) {
        await tx
          .update(services)
          .set({ 
            isPaid: true,
            updatedAt: new Date()
          })
          .where(eq(services.id, service.id));
      }

      // Create payment record
      await tx.insert(payments).values({
        patientId: session.user.id,
        stripePaymentIntentId: paymentIntentId,
        amount: amount.toString(),
        currency: 'usd',
        status: 'succeeded',
        serviceIds: serviceIds,
      });

      // Log the successful payment
      await tx.insert(patientActions).values({
        patientId: session.user.id,
        action: 'payment_completed',
        details: JSON.stringify({
          description: `Successfully paid for ${selectedServices.length} services`,
          paymentIntentId,
          serviceIds,
          amount,
          serviceNames: selectedServices.map(s => s.serviceName),
        }),
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Payment processed successfully',
      servicesUpdated: selectedServices.length,
    });

  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}