import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_PRICES } from '@/lib/stripe';
import { createServerClient } from '@/lib/supabase/server-client';

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please add your Stripe API keys to the environment variables.' },
        { status: 500 }
      );
    }

    const supabase = await createServerClient();
    
    // Get user from session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, planType = 'PRO' } = await request.json();

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    // Get or create customer
    let customer;
    const customerEmail = session.user.email;
    
    // Check if customer already exists
    const existingCustomers = await stripe.customers.list({
      email: customerEmail,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      // Create new customer
      customer = await stripe.customers.create({
        email: customerEmail,
        name: session.user.user_metadata?.full_name || session.user.email,
        metadata: {
          supabaseUserId: session.user.id,
        },
      });
    }

    // Create Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.nextUrl.origin}/subscription?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${request.nextUrl.origin}/subscription?canceled=true`,
      metadata: {
        supabaseUserId: session.user.id,
        planType: planType,
      },
      subscription_data: {
        metadata: {
          supabaseUserId: session.user.id,
          planType: planType,
        },
      },
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}
