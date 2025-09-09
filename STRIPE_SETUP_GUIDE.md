# KYNEX Stripe Integration Setup Guide

## Overview
KYNEX now includes a complete Stripe integration for subscription management. This guide will help you set up Stripe payments for your Pro subscription plan.

## Step 1: Create a Stripe Account
1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Create your Stripe account
3. Complete the account verification process

## Step 2: Get Your API Keys
1. In your Stripe Dashboard, go to **Developers > API Keys**
2. Copy your **Publishable Key** (starts with `pk_test_`)
3. Copy your **Secret Key** (starts with `sk_test_`)
4. Add these to your `.env.local` file:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

## Step 3: Create Your Product and Price
1. In Stripe Dashboard, go to **Products**
2. Click **+ Add Product**
3. Create a product called "KYNEX Pro"
4. Set the price to $49/month (or your preferred amount)
5. Set it as a **Recurring** subscription
6. Copy the **Price ID** (starts with `price_`)
7. Add it to your `.env.local`:

```env
STRIPE_PRO_MONTHLY_PRICE_ID=price_your_price_id_here
```

## Step 4: Set Up Webhooks
1. Go to **Developers > Webhooks** in Stripe Dashboard
2. Click **+ Add Endpoint**
3. Set the endpoint URL to: `https://yourdomain.com/api/stripe/webhooks`
   - For local development: `http://localhost:9002/api/stripe/webhooks`
4. Select these events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy the **Webhook Secret** (starts with `whsec_`)
6. Add it to your `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Step 5: Update Your Environment Variables
Your `.env.local` should now include:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_PRO_MONTHLY_PRICE_ID=price_your_price_id_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

## Step 6: Update Supabase Database
Run the SQL script `supabase_schema_fix.sql` in your Supabase SQL Editor to ensure proper database schema and Row Level Security policies.

## Step 7: Test the Integration

### Local Testing
1. Start your development server: `npm run dev`
2. Go to `/subscription` page
3. Click "Upgrade to Pro"
4. Use Stripe's test card: `4242 4242 4242 4242`
5. Use any future expiry date and any 3-digit CVC
6. Complete the payment flow

### Webhook Testing (Local Development)
1. Install Stripe CLI: [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
2. Login: `stripe login`
3. Forward webhooks to local dev: `stripe listen --forward-to localhost:9002/api/stripe/webhooks`
4. Test with: `stripe trigger checkout.session.completed`

## Features Included

### ✅ **Subscription Management**
- Free 30-day trial for all new users
- Pro plan subscription at $49/month
- Automatic trial-to-paid conversion
- Subscription status tracking

### ✅ **Payment Processing**
- Secure Stripe Checkout integration
- Test and live mode support
- Automatic invoice generation
- Failed payment handling

### ✅ **Database Integration**
- Subscription data stored in Supabase
- User trial status tracking
- Usage limits enforcement
- Automatic subscription updates via webhooks

### ✅ **User Experience**
- Trial progress tracking
- Subscription status alerts
- Payment success/failure notifications
- Seamless checkout flow

## Subscription Flow
1. **New User** → Automatic 30-day free trial starts
2. **During Trial** → User can upgrade to Pro anytime
3. **Trial Expires** → User must upgrade to continue using agents
4. **Pro Subscriber** → Unlimited access to all features
5. **Payment Issues** → Graceful handling with notifications

## Going Live
1. Switch to live API keys in Stripe Dashboard
2. Update webhook endpoint to your production domain
3. Update environment variables with live keys
4. Test the complete flow in production

## Support
- Stripe Documentation: [https://stripe.com/docs](https://stripe.com/docs)
- Stripe Testing: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)
- Webhook Testing: [https://stripe.com/docs/webhooks/test](https://stripe.com/docs/webhooks/test)

## Security Notes
- Never commit API keys to version control
- Use environment variables for all secrets
- Enable Stripe's fraud protection
- Regularly monitor failed payments and disputes
