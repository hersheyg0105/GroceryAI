'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const paymentIntent = searchParams.get('payment_intent');
  const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');

  useEffect(() => {
    if (paymentIntent && paymentIntentClientSecret) {
      toast.success('Thank you for your donation!');
    }
  }, [paymentIntent, paymentIntentClientSecret]);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Payment Successful</h2>
      <p className="text-center text-gray-700 mb-4">
        Thank you for your donation! Your transaction was successful.
      </p>
      <Link
        href="/"
        className="w-full py-3 px-6 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
      >
        Return Home
      </Link>
    </div>
  );
}
