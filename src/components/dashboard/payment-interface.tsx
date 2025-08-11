'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Service } from '@/lib/db/schema';
import { CreditCard, Lock, Check, AlertCircle, DollarSign } from 'lucide-react';

interface PaymentInterfaceProps {
  selectedServices: Service[];
  totals: {
    originalTotal: number;
    discountedTotal: number;
    savings: number;
    savingsPercentage: number;
    selectedCount: number;
  };
  onPaymentSuccess?: () => void;
  onCancel?: () => void;
}

interface PaymentState {
  step: 'review' | 'processing' | 'success' | 'error';
  error?: string;
  paymentIntentId?: string;
}

export default function PaymentInterface({
  selectedServices,
  totals,
  onPaymentSuccess,
  onCancel
}: PaymentInterfaceProps) {
  const [paymentState, setPaymentState] = useState<PaymentState>({ step: 'review' });
  const [stripe, setStripe] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string>('');

  // Initialize Stripe
  useEffect(() => {
    const initializeStripe = async () => {
      const stripePromise = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      setStripe(stripePromise);
    };
    initializeStripe();
  }, []);

  // Create payment intent when component mounts
  useEffect(() => {
    if (selectedServices.length > 0) {
      createPaymentIntent();
    }
  }, [selectedServices]);

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceIds: selectedServices.map(s => s.id),
          amount: Math.round(totals.discountedTotal * 100), // Convert to cents
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret, paymentIntentId } = await response.json();
      setClientSecret(clientSecret);
      setPaymentState(prev => ({ ...prev, paymentIntentId }));

      // Initialize Stripe Elements
      if (stripe && clientSecret) {
        const elementsInstance = stripe.elements({
          clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#2563eb',
              colorBackground: '#ffffff',
              colorText: '#1f2937',
              colorDanger: '#dc2626',
              fontFamily: 'system-ui, sans-serif',
              spacingUnit: '4px',
              borderRadius: '8px',
            },
          },
        });
        setElements(elementsInstance);
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      setPaymentState({ step: 'error', error: 'Failed to initialize payment' });
    }
  };

  const handlePayment = async () => {
    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setPaymentState({ step: 'processing' });

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard?payment=success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setPaymentState({ 
          step: 'error', 
          error: error.message || 'Payment failed' 
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Process successful payment
        await processSuccessfulPayment(paymentIntent.id);
        setPaymentState({ step: 'success' });
        onPaymentSuccess?.();
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentState({ 
        step: 'error', 
        error: 'An unexpected error occurred' 
      });
    }
  };

  const processSuccessfulPayment = async (paymentIntentId: string) => {
    try {
      await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId,
          serviceIds: selectedServices.map(s => s.id),
          amount: totals.discountedTotal,
        }),
      });
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  if (paymentState.step === 'success') {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h3>
          <p className="text-gray-600 mb-6">
            Your payment of ${totals.discountedTotal.toFixed(2)} has been processed successfully.
            You saved ${totals.savings.toFixed(2)} ({totals.savingsPercentage}% off) by paying directly.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Services Paid:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {selectedServices.map(service => (
                <li key={service.id} className="flex justify-between">
                  <span>{service.serviceName}</span>
                  <span>${parseFloat(service.discountedAmount).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={onCancel}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (paymentState.step === 'error') {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Payment Failed</h3>
          <p className="text-gray-600 mb-6">
            {paymentState.error || 'An unexpected error occurred while processing your payment.'}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setPaymentState({ step: 'review' })}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onCancel}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <CreditCard className="h-6 w-6 mr-2 text-blue-600" />
          Complete Your Payment
        </h3>
        <p className="text-gray-600 mt-1">
          Pay for {totals.selectedCount} service{totals.selectedCount !== 1 ? 's' : ''} at discounted rates
        </p>
      </div>

      <div className="p-6">
        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
          <div className="space-y-2">
            {selectedServices.map(service => (
              <div key={service.id} className="flex justify-between text-sm">
                <div>
                  <span className="text-gray-900">{service.serviceName}</span>
                  <span className="text-gray-500 ml-2">({service.serviceCode})</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 line-through mr-2">
                    ${parseFloat(service.originalAmount).toFixed(2)}
                  </span>
                  <span className="text-gray-900 font-medium">
                    ${parseFloat(service.discountedAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 mt-4 pt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Original Total:</span>
              <span>${totals.originalTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-green-600 mb-2">
              <span>Your Savings ({totals.savingsPercentage}% off):</span>
              <span>-${totals.savings.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>Total to Pay:</span>
              <span>${totals.discountedTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        {stripe && elements && clientSecret && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Lock className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm text-blue-800">
                  Your payment information is secure and encrypted
                </span>
              </div>
            </div>

            {/* Stripe Elements will be mounted here */}
            <div id="payment-element" className="mb-4">
              {elements && (
                <div ref={(ref) => {
                  if (ref && elements) {
                    const paymentElement = elements.create('payment');
                    paymentElement.mount(ref);
                  }
                }} />
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handlePayment}
                disabled={paymentState.step === 'processing'}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                {paymentState.step === 'processing' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-5 w-5 mr-2" />
                    Pay ${totals.discountedTotal.toFixed(2)}
                  </>
                )}
              </button>
              <button
                onClick={onCancel}
                disabled={paymentState.step === 'processing'}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {(!stripe || !elements || !clientSecret) && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Initializing secure payment...</p>
          </div>
        )}
      </div>
    </div>
  );
}