import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getDonationTier, isValidDonationAmount } from '@/config/stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    // Convert amount to cents for validation
    const amountInCents = amount * 100;

    if (!isValidDonationAmount(amountInCents)) {
      return NextResponse.json(
        { error: 'Invalid donation amount' },
        { status: 400 }
      );
    }

    const donationTier = getDonationTier(amount);
    if (!donationTier) {
      return NextResponse.json(
        { error: 'Invalid donation tier' },
        { status: 400 }
      );
    }

    console.log('Creating payment intent for amount:', donationTier.amount);
    console.log('Using Stripe secret key:', process.env.STRIPE_SECRET_KEY);

    // Create a PaymentIntent with the specified amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount: donationTier.amount,
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        donationAmount: amount,
        description: donationTier.description,
        priceId: donationTier.priceId,
        productId: donationTier.productId
      }
    });

    console.log('Payment intent created successfully:', paymentIntent.id);

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Payment intent error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
