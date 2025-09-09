import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Server-side Stripe instance (only initialize if key exists)
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    })
  : null;

// Client-side Stripe instance (only initialize if key exists)
export const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

// Stripe pricing configuration
export const STRIPE_PRICES = {
  PRO_MONTHLY: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_placeholder_monthly',
  PRO_YEARLY: process.env.STRIPE_PRO_YEARLY_PRICE_ID || 'price_placeholder_yearly',
} as const;

// Plan configuration
export const PLANS = {
  FREE_TRIAL: {
    name: 'Free Trial',
    price: 0,
    duration: 30, // days
    features: [
      'Unlimited agents during trial',
      'Deploy to any platform',
      'Real-time performance analytics',
      'Community support'
    ],
    limits: {
      agents: 999, // Unlimited during trial
      deployments: 999,
      apiCalls: 10000
    }
  },
  PRO: {
    name: 'Pro',
    price: 49,
    duration: 'monthly',
    features: [
      'Unlimited agents',
      'All deployment platforms',
      'Advanced analytics & insights',
      'Priority support',
      'Custom webhook endpoints',
      'API access'
    ],
    limits: {
      agents: 999999,
      deployments: 999999,
      apiCalls: 1000000
    }
  }
} as const;

export type PlanType = keyof typeof PLANS;
