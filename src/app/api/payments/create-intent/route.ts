import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { services, patientActions } from '@/lib/db/schema';
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

    const { serviceIds, amount } = await request.json();

    if (!serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
      return NextResponse.json({ error: 'Service IDs are required' }, { status: 400 });
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    // Verify services belong to the authenticated patient and are unpaid
    const patientServices = await db
      .select()
      .from(services)
      .where(
        eq(services.patientId, session.user.id)
      );

    const selectedServices = patientServices.filter(service => 
      serviceIds.includes(service.id) && !service.isPaid
    );

    if (selectedServices.length === 0) {
      return NextResponse.json({ error: 'No valid unpaid services found' }, { status: 400 });
    }

    // Calculate expected amount from selected services
    const expectedAmount = selectedServices.reduce((total, service) => {
      return total + parseFloat(service.discountedAmount);
    }, 0);

    // Verify amount matches (allow for small rounding differences)
    if (Math.abs(expectedAmount * 100 - amount) > 1) {
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(expectedAmount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        patientId: session.user.id,
        serviceIds: serviceIds.join(','),
        serviceCount: selectedServices.length.toString(),
      },
      description: `Payment for ${selectedServices.length} medical service${selectedServices.length !== 1 ? 's' : ''}`,
    });

    // Log the payment intent creation
    await db.insert(patientActions).values({
      patientId: session.user.id,
      action: 'payment_intent_created',
      details: JSON.stringify({
        description: `Created payment intent for ${selectedServices.length} services totaling $${expectedAmount.toFixed(2)}`,
        paymentIntentId: paymentIntent.id,
        serviceIds,
        amount: expectedAmount,
      }),
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: expectedAmount,
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}