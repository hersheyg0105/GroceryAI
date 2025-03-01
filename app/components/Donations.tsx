'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import { DONATION_TIERS } from '@/config/stripe';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const CheckoutForm = ({ onCancel }: { onCancel: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (error) {
        console.error('Payment error:', error);
        toast.error(error.message || 'Payment failed');
        window.location.href = '/payment-error'; // Redirect to error page
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast.error(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Enter Payment Details</h3>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <PaymentElement />
        <button
          type="submit"
          disabled={!stripe || isLoading}
          className={`
            relative w-full py-4 px-6 rounded-xl font-semibold text-white mt-4
            transform transition-all duration-200
            ${!stripe || isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#0A2540] hover:bg-[#0A2540]/90 hover:shadow-lg active:scale-95'
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Processing...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1.5 text-[17px]">
              <span className="font-normal">Complete Payment</span>
            </div>
          )}
        </button>
      </form>
    </div>
  );
};

export const Donations = () => {
  const [amount, setAmount] = useState(3);
  const [recentlySelected, setRecentlySelected] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (typeof window === 'undefined') {
    return null; // Ensure client-side rendering only
  }

  const handleAmountClick = (value: number) => {
    setAmount(value);
    setRecentlySelected(true);
    setTimeout(() => setRecentlySelected(false), 500);
  };

  const handleDonate = async () => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      const stripe = await stripePromise;

      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          console.error('Stripe redirect error:', error);
          toast.error(error.message || 'Failed to redirect to Stripe');
        }
      }
    } catch (error) {
      console.error('Checkout session error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create checkout session');
    }
  };

  if (!mounted) {
    return null;
  }

  if (showPaymentForm) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <Elements 
          stripe={stripePromise} 
          options={{
            payment_method_types: ['card', 'apple_pay'],
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary: '#2563eb',
                colorBackground: '#ffffff',
                colorText: '#1f2937',
              },
            },
          }}
        >
          <CheckoutForm 
            onCancel={() => setShowPaymentForm(false)} 
          />
        </Elements>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Support Our Project</h2>
      
      {/* Amount Display with Animation */}
      <div className="relative text-center mb-12">
        <div className={`
          text-6xl font-bold text-blue-600 transition-all duration-300
          ${recentlySelected ? 'scale-110' : 'scale-100'}
        `}>
          ${amount}
        </div>
        {recentlySelected && (
          <div className="absolute -right-8 top-1/2 -translate-y-1/2 animate-fade-left">
            <span className="text-green-500 text-xl">
              ✨
            </span>
          </div>
        )}
        <div className="text-sm text-gray-600 mt-2">
          {DONATION_TIERS[amount].description}
        </div>
      </div>

      {/* Amount Buttons */}
      <div className="grid grid-cols-5 gap-2 mb-8">
        {Object.entries(DONATION_TIERS).map(([value]) => (
          <button
            key={value}
            onClick={() => handleAmountClick(Number(value))}
            className={`
              relative overflow-hidden group
              py-3 rounded-xl font-semibold text-sm
              transition-all duration-200 ease-in-out
              ${amount === Number(value)
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {/* Background animation on hover */}
            <div className={`
              absolute inset-0 w-full h-full
              transition-transform duration-300
              ${amount === Number(value)
                ? 'bg-blue-500 opacity-0 group-hover:opacity-100'
                : 'bg-gray-200 opacity-0 group-hover:opacity-100'
              }
            `} />
            
            {/* Dollar amount */}
            <div className="relative z-10 flex items-center justify-center">
              <span className="text-sm mr-1">$</span>
              <span className="text-lg">{value}</span>
            </div>

            {/* Selected indicator dot */}
            {amount === Number(value) && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Donate Button */}
      <button
        onClick={handleDonate}
        className="
          relative w-full py-4 px-6 rounded-xl font-semibold text-white
          transform transition-all duration-200
          bg-[#0A2540] hover:bg-[#0A2540]/90 hover:shadow-lg active:scale-95
        "
      >
        <div className="flex items-center justify-center gap-1.5 text-[17px]">
          <span className="font-normal">Pay with</span>
          <span 
            className="font-medium tracking-[-0.02em] relative -top-[0.5px]" 
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
          >
            Stripe
          </span>
        </div>
      </button>
    </div>
  );
};
