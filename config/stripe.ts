export type DonationTier = {
  amount: number;
  productId: string;
  priceId: string;
  description: string;
};

export const DONATION_TIERS: { [key: number]: DonationTier } = {
  1: {
    amount: 100, // in cents
    productId: 'prod_Rr3SFJUsN84unN', // Replace with your actual product ID for $1 donation
    priceId: 'price_H5ggYwtDq8jGJQ', // Replace with your actual price ID for $1
    description: 'Support our project with $1',
  },
  2: {
    amount: 200,
    productId: 'prod_Rr3Te4DylUsXSX', // Replace with your actual product ID for $2 donation
    priceId: 'price_H5ggZ9NnqG7HJb', // Replace with your actual price ID for $2
    description: 'Support our project with $2',
  },
  3: {
    amount: 300,
    productId: 'prod_Rr3TgDuYfekmOt', // Replace with your actual product ID for $3 donation
    priceId: 'price_H5ggaBNmqL8KMc', // Replace with your actual price ID for $3
    description: 'Support our project with $3',
  },
  4: {
    amount: 400,
    productId: 'prod_Rr3TmhNqeHufXm', // Replace with your actual product ID for $4 donation
    priceId: 'price_H5ggbCOprM9LNd', // Replace with your actual price ID for $4
    description: 'Support our project with $4',
  },
  5: {
    amount: 500,
    productId: 'prod_Rr3TrEww7phnXY', // Replace with your actual product ID for $5 donation
    priceId: 'price_H5ggcDPqsN0MOe', // Replace with your actual price ID for $5
    description: 'Support our project with $5',
  },
};

export const STRIPE_CONFIG = {
  currency: 'usd',
  allowedCountries: ['US'],
  paymentMethods: ['card'],
  minAmount: 100, // $1 in cents
  maxAmount: 500, // $5 in cents
};

// Helper function to get donation tier by amount
export function getDonationTier(amount: number): DonationTier | null {
  return DONATION_TIERS[amount] || null;
}

// Helper function to validate amount
export function isValidDonationAmount(amount: number): boolean {
  return amount >= STRIPE_CONFIG.minAmount && 
         amount <= STRIPE_CONFIG.maxAmount && 
         amount % 100 === 0 && // Must be whole dollar amounts
         DONATION_TIERS[amount / 100] !== undefined;
}
