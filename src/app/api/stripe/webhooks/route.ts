import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClient } from '@/lib/supabase/server-client';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  // Check if Stripe is configured
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  const supabase = await createServerClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription') {
          const subscriptionId = session.subscription as string;
          const supabaseUserId = session.metadata?.supabaseUserId;
          const planType = session.metadata?.planType || 'pro';

          if (supabaseUserId) {
            // Get subscription details
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            
            // Update or create subscription in database
            const { error } = await supabase
              .from('subscriptions')
              .upsert({
                user_id: supabaseUserId,
                stripe_subscription_id: subscriptionId,
                stripe_customer_id: session.customer as string,
                plan: planType,
                status: 'active',
                start_date: new Date((subscription as any).current_period_start * 1000).toISOString(),
                end_date: new Date((subscription as any).current_period_end * 1000).toISOString(),
              }, {
                onConflict: 'user_id'
              });

            if (error) {
              console.error('Error updating subscription:', error);
            }
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const supabaseUserId = subscription.metadata?.supabaseUserId;

        if (supabaseUserId) {
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: subscription.status as any,
              end_date: new Date((subscription as any).current_period_end * 1000).toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id);

          if (error) {
            console.error('Error updating subscription status:', error);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const supabaseUserId = subscription.metadata?.supabaseUserId;

        if (supabaseUserId) {
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              end_date: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id);

          if (error) {
            console.error('Error canceling subscription:', error);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = ((invoice as any).subscription as string) || '';

        if (subscriptionId) {
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
            })
            .eq('stripe_subscription_id', subscriptionId);

          if (error) {
            console.error('Error updating subscription for failed payment:', error);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: `Webhook handler failed: ${error.message}` },
      { status: 500 }
    );
  }
}
