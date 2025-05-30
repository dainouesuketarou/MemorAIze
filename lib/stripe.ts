import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-04-30.basil',
  typescript: true,
});

export const STRIPE_PRICE_IDS = {
  FREE: process.env.STRIPE_FREE_PRICE_ID,
  PRO_MONTHLY: process.env.STRIPE_PRO_PRICE_ID, // TODO: 環境変数から取得するように変更
  PRO_YEARLY: process.env.STRIPE_PRO_YEARLY_PRICE_ID, // TODO: 環境変数から取得するように変更
} as const;

export type StripePriceId =
  (typeof STRIPE_PRICE_IDS)[keyof typeof STRIPE_PRICE_IDS];
