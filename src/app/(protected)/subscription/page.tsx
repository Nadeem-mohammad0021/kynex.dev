
'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Clock, Zap, Shield, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { STRIPE_PRICES } from '@/lib/stripe';
import { useSearchParams } from 'next/navigation';

const plans = [
  {
    name: 'Free Trial',
    price: 'Free',
    pricePeriod: '30 days',
    description: 'Start your AI agent journey with a full month of free access.',
    features: [
      'Unlimited agents during trial',
      'Deploy to any platform', 
      'Real-time performance analytics',
      'Community support'
    ],
    cta: 'Start Free Trial',
    href: '/agents/editor/new',
    badge: 'Most Popular',
    icon: Clock,
  },
  {
    name: 'Pro',
    price: '$49',
    pricePeriod: '/ month',
    description: 'For professionals and small teams who need continuous access.',
    features: [
      'Unlimited agents',
      'All deployment platforms', 
      'Advanced analytics & insights',
      'Priority support',
      'Custom webhook endpoints',
      'API access'
    ],
    cta: 'Upgrade to Pro',
    popular: true,
    href: '/api/stripe/checkout',
    stripePrice: STRIPE_PRICES.PRO_MONTHLY,
    icon: Zap,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    pricePeriod: '',
    description: 'For large organizations with enterprise requirements.',
    features: [
      'Everything in Pro',
      'Dedicated support team', 
      'Custom integrations',
      'SLA guarantees',
      'On-premise deployment',
      'Advanced security features'
    ],
    cta: 'Contact Sales',
    href: '/contact',
    icon: Shield,
  },
];

interface SubscriptionStatus {
  plan: string;
  isTrialActive: boolean;
  daysRemaining: number;
  expiresAt: string | null;
  agentCount: number;
  deploymentCount: number;
  hasDeployments: boolean;
}

export default function SubscriptionPage() {
  const [user, setUser] = useState<User | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchUserAndTrial = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        
        try {
          // Use Supabase Auth user ID directly
          const supabaseUserId = session.user.id;
          
          // Get or create user in users table if needed
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('user_id')
            .eq('user_id', supabaseUserId)
            .single();

          // If user doesn't exist in users table, create them
          if (userError && userError.code === 'PGRST116') {
            const { error: createError } = await supabase
              .from('users')
              .insert({
                user_id: supabaseUserId,
                email: session.user.email || '',
                name: session.user.user_metadata?.full_name || session.user.email || ''
              });
            
            if (createError) {
              console.error('Error creating user:', createError);
              setIsLoading(false);
              return;
            }
          } else if (userError) {
            console.error('Error fetching user:', userError);
            setIsLoading(false);
            return;
          }

          const userId = supabaseUserId;

          // Fetch user data from users table
          const { data: userSubscriptionData, error: userSubError } = await supabase
            .from('users')
            .select('subscription_plan, subscription_expires_at, trial_started_at')
            .eq('user_id', userId)
            .single();

          // Count user's agents and deployments
          const { data: workflows } = await supabase
            .from('workflows')
            .select('workflow_id')
            .eq('user_id', userId);
          
          const workflowIds = workflows?.map(w => w.workflow_id) || [];
          
          let agentCount = 0;
          let deploymentCount = 0;
          
          if (workflowIds.length > 0) {
            const { count: agentCountResult } = await supabase
              .from('agents')
              .select('*', { count: 'exact', head: true })
              .in('workflow_id', workflowIds);
            
            const { data: agents } = await supabase
              .from('agents')
              .select('agent_id')
              .in('workflow_id', workflowIds);
              
            const agentIds = agents?.map(a => a.agent_id) || [];
            
            if (agentIds.length > 0) {
              const { count: deploymentCountResult } = await supabase
                .from('deployments')
                .select('*', { count: 'exact', head: true })
                .in('agent_id', agentIds);
              
              deploymentCount = deploymentCountResult || 0;
            }
            
            agentCount = agentCountResult || 0;
          }

          const hasDeployments = deploymentCount > 0;
          let daysRemaining = 0;
          let isTrialActive = false;
          
          if (hasDeployments && userSubscriptionData?.subscription_expires_at) {
            // User has deployments and subscription expiry date
            const now = new Date();
            const expiresAt = new Date(userSubscriptionData.subscription_expires_at);
            daysRemaining = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
            isTrialActive = daysRemaining > 0;
          }
          
          setSubscriptionStatus({
            plan: userSubscriptionData?.subscription_plan || 'free',
            isTrialActive,
            daysRemaining,
            expiresAt: userSubscriptionData?.subscription_expires_at || null,
            agentCount: agentCount || 0,
            deploymentCount: deploymentCount || 0,
            hasDeployments
          });
        } catch (error) {
          console.error('Error fetching trial data:', error);
        }
      }
      
      setIsLoading(false);
    };

    fetchUserAndTrial();
  }, []);

  const handleUpgrade = async (priceId: string) => {
    if (checkoutLoading) return;
    
    // Check if Stripe is configured
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      console.error('Stripe is not configured. Please add your Stripe API keys.');
      return;
    }
    
    setCheckoutLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: priceId,
          planType: 'pro',
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        console.error('Checkout error:', error);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const trialProgress = subscriptionStatus?.isTrialActive ? ((30 - subscriptionStatus.daysRemaining) / 30) * 100 : 0;
  
  // Check for success/cancel from Stripe
  const paymentSuccess = searchParams.get('success') === 'true';
  const paymentCanceled = searchParams.get('canceled') === 'true';

  return (
    <div className="p-4 md:p-6">
        <div className="container mx-auto">
          {paymentSuccess && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Payment Successful!</strong> Your subscription has been activated. Welcome to KYNEX Pro!
              </AlertDescription>
            </Alert>
          )}
          
          {paymentCanceled && (
            <Alert className="mb-6 border-yellow-200 bg-yellow-50">
              <Clock className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Payment Canceled.</strong> Your subscription was not activated. You can try again anytime.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Only show trial status if user has deployments and trial is active */}
          {subscriptionStatus?.hasDeployments && subscriptionStatus?.isTrialActive && (
            <div className="mb-8">
              <Alert className="border-blue-200 bg-blue-50">
                <Calendar className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Free Trial Active:</strong> {subscriptionStatus.daysRemaining} days remaining 
                  ({subscriptionStatus.agentCount} agents created, {subscriptionStatus.deploymentCount} deployments)
                </AlertDescription>
              </Alert>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Trial Progress</span>
                  <span>{30 - subscriptionStatus.daysRemaining} / 30 days used</span>
                </div>
                <Progress value={trialProgress} className="h-2" />
              </div>
            </div>
          )}
          
          {/* Show message for users without deployments */}
          {subscriptionStatus && !subscriptionStatus.hasDeployments && (
            <div className="mb-8">
              <Alert className="border-blue-200 bg-blue-50">
                <Calendar className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Ready to Start:</strong> Deploy your first agent to activate your 30-day free trial.
                  You have {subscriptionStatus.agentCount} agents ready to deploy.
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold font-headline">
              {subscriptionStatus?.isTrialActive ? 'Upgrade Your Plan' : 'Choose Your Plan'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {subscriptionStatus?.isTrialActive 
                ? 'Enjoy your free trial or upgrade for continuous access.' 
                : 'Select the perfect plan to fit your needs.'}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <Card 
                  key={plan.name} 
                  className={`relative overflow-hidden ${plan.popular ? 'border-primary shadow-md' : ''}`}
                >
                  {plan.badge && (
                    <div className="absolute top-0 right-0">
                      <Badge variant="default" className="rounded-bl-md rounded-tr-md rounded-br-none rounded-tl-none py-1.5">
                        {plan.badge}
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="items-start pb-4">
                    <div className="flex items-center w-full justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-md ${plan.popular ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                      </div>
                    </div>
                    <div className="flex items-baseline mb-2">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.pricePeriod && (
                        <span className="text-muted-foreground ml-1">{plan.pricePeriod}</span>
                      )}
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? 'default' : 'outline'} 
                      size="lg"
                      disabled={checkoutLoading || plan.name === 'Free Trial'}
                      onClick={() => {
                        if (plan.stripePrice) {
                          handleUpgrade(plan.stripePrice);
                        }
                      }}
                    >
                      {checkoutLoading && plan.popular ? 'Processing...' : plan.cta}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
    </div>
  );
}
