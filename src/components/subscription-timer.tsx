"use client";

import { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Timer, AlertTriangle, Crown, Zap, Plus } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionStatus {
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  expiresAt: string;
  usageCount: number;
  usageLimit: number;
  deploymentCount: number;
  daysRemaining: number;
  isTrialActive: boolean;
}

interface DeploymentActivity {
  deploymentId: string;
  agentName: string;
  platform: string;
  deployedAt: string;
  messageCount: number;
  lastActivity: string;
}

export function SubscriptionTimer() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [recentDeployments, setRecentDeployments] = useState<DeploymentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const { toast } = useToast();

  const fetchSubscriptionData = useCallback(async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      const userId = session.user.id;

      // Get user subscription info
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('subscription_plan, subscription_expires_at, created_at, trial_started_at')
        .eq('user_id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        setIsLoading(false);
        return;
      }
      
      // Get usage limits based on plan
      const plan = userData?.subscription_plan || 'free';
      const usageLimits = {
        free: 100,
        starter: 1000,
        pro: 10000,
        enterprise: 100000
      };

      // Fetch user workflows and agents
      const { data: workflows } = await supabase
        .from('workflows')
        .select('workflow_id')
        .eq('user_id', userId);

      const workflowIds = workflows?.map(w => w.workflow_id) || [];
      
      let totalUsage = 0;
      let deploymentCount = 0;
      let deploymentActivities: DeploymentActivity[] = [];

      if (workflowIds.length > 0) {
        // Get agents
        const { data: agents } = await supabase
          .from('agents')
          .select('agent_id, workflow_id, name, platform, created_at')
          .in('workflow_id', workflowIds);

        const agentIds = agents?.map(a => a.agent_id) || [];

        if (agentIds.length > 0) {
          // Get deployments
          const { data: deployments } = await supabase
            .from('deployments')
            .select('deployment_id, agent_id, status, deployed_at')
            .in('agent_id', agentIds)
            .eq('status', 'deployed');

          deploymentCount = deployments?.length || 0;

          // Get usage logs
          const { data: logs } = await supabase
            .from('logs')
            .select('agent_id, created_at')
            .in('agent_id', agentIds)
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

          totalUsage = logs?.length || 0;

          // Build deployment activities
          deploymentActivities = (deployments || []).slice(0, 5).map(deployment => {
            const agent = agents?.find(a => a.agent_id === deployment.agent_id);
            const agentLogs = logs?.filter(log => log.agent_id === deployment.agent_id) || [];
            const lastLog = agentLogs.length > 0 ? agentLogs[agentLogs.length - 1] : null;
            
            return {
              deploymentId: deployment.deployment_id,
              agentName: agent?.name || 'Unknown Agent',
              platform: agent?.platform || 'Unknown',
              deployedAt: deployment.deployed_at,
              messageCount: agentLogs.length,
              lastActivity: lastLog?.created_at || deployment.deployed_at
            };
          });
        }
      }

      // Calculate subscription expiry based on trial start
      let expiresAt: string;
      let daysRemaining: number;
      let isTrialActive = false;
      
      if (deploymentCount > 0) {
        // User has deployments - trial should be active
        if (!userData?.trial_started_at && !userData?.subscription_expires_at) {
          // First deployment - start trial now
          const trialStartDate = new Date();
          const trialEndDate = new Date(trialStartDate.getTime() + 30 * 24 * 60 * 60 * 1000);
          
          // Update user with trial start time
          await supabase
            .from('users')
            .update({
              trial_started_at: trialStartDate.toISOString(),
              subscription_expires_at: trialEndDate.toISOString()
            })
            .eq('user_id', userId);
          
          expiresAt = trialEndDate.toISOString();
          daysRemaining = 30;
          isTrialActive = true;
        } else {
          // Use existing trial/subscription dates
          expiresAt = userData?.subscription_expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
          daysRemaining = Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
          isTrialActive = daysRemaining > 0;
        }
      } else {
        // No deployments - no trial yet
        expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // Future date, not active
        daysRemaining = 0; // No active trial
        isTrialActive = false;
      }

      setSubscription({
        plan,
        expiresAt,
        usageCount: totalUsage,
        usageLimit: usageLimits[plan as keyof typeof usageLimits],
        deploymentCount,
        daysRemaining,
        isTrialActive
      });

      setRecentDeployments(deploymentActivities);

      // Show upgrade prompts based on usage
      const usagePercentage = (totalUsage / usageLimits[plan as keyof typeof usageLimits]) * 100;
      if (usagePercentage > 80 || daysRemaining <= 3) {
        setShowUpgradePrompt(true);
      }

      setIsLoading(false);

    } catch (error) {
      console.error('Error fetching subscription data:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptionData();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchSubscriptionData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchSubscriptionData]);

  // Show upgrade notification
  useEffect(() => {
    if (subscription && showUpgradePrompt) {
      const usagePercentage = (subscription.usageCount / subscription.usageLimit) * 100;
      
      if (usagePercentage > 90) {
        toast({
          title: "Usage Limit Approaching",
          description: `You've used ${Math.round(usagePercentage)}% of your monthly message limit. Upgrade to continue.`,
          duration: 10000,
        });
      } else if (subscription.daysRemaining <= 3) {
        toast({
          title: "Subscription Expiring Soon",
          description: `Your subscription expires in ${subscription.daysRemaining} days. Upgrade to keep your agents running.`,
          duration: 10000,
        });
      }
    }
  }, [subscription, showUpgradePrompt, toast]);

  if (isLoading || !subscription) {
    return null;
  }

  // Don't show subscription timer until user has deployed at least one agent
  if (subscription.deploymentCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Get Started
          </CardTitle>
          <CardDescription>
            Deploy your first agent to activate your 30-day trial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="text-sm text-muted-foreground mb-4">
              Your trial will start when you deploy your first agent
            </div>
            <Button asChild>
              <Link href="/agents/editor/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Agent
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const subscriptionProgress = Math.min((subscription.usageCount / subscription.usageLimit) * 100, 100);
  const isExpiringSoon = subscription.daysRemaining <= 7;
  const isUsageHigh = subscriptionProgress > 80;

  return (
    <div className="space-y-4">
      {/* Main Subscription Card */}
      <Card className={`${isExpiringSoon || isUsageHigh ? 'border-yellow-200 bg-yellow-50/50' : ''}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Subscription Status
            {subscription.isTrialActive && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">
                Trial Active
              </span>
            )}
          </CardTitle>
          <CardDescription>
            {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
            • {subscription.daysRemaining} days remaining
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Usage Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Monthly Usage</span>
              <span>{subscription.usageCount} / {subscription.usageLimit} messages</span>
            </div>
            <Progress 
              value={usagePercentage} 
              className={`h-2 ${usagePercentage > 80 ? 'bg-yellow-100' : ''}`}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.round(usagePercentage)}% used</span>
              <span>{subscription.usageLimit - subscription.usageCount} remaining</span>
            </div>
          </div>

          {/* Deployment Count */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Active Deployments</span>
            </div>
            <span className="text-lg font-bold">{subscription.deploymentCount}</span>
          </div>

          {/* Upgrade Prompt */}
          {(isExpiringSoon || isUsageHigh) && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                {isExpiringSoon && (
                  <>Your subscription expires in {subscription.daysRemaining} days. </>
                )}
                {isUsageHigh && (
                  <>You've used {Math.round(usagePercentage)}% of your monthly limit. </>
                )}
                <Link href="/subscription" className="underline font-medium">
                  Upgrade now
                </Link> to avoid service interruption.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button asChild variant="default" size="sm" className="flex-1">
              <Link href="/subscription">
                <Crown className="mr-2 h-4 w-4" />
                Upgrade Plan
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href="/deployments">
                View Deployments
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Deployment Activity */}
      {recentDeployments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Deployment Activity</CardTitle>
            <CardDescription className="text-xs">
              Activity from your deployed agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentDeployments.map((deployment) => (
                <div key={deployment.deploymentId} className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs">
                  <div className="flex-1">
                    <p className="font-medium">{deployment.agentName}</p>
                    <p className="text-muted-foreground">{deployment.platform}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{deployment.messageCount} msgs</p>
                    <p className="text-muted-foreground">
                      {new Date(deployment.lastActivity).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trial Activation Success */}
      {subscription.isTrialActive && (
        <Alert className="border-green-200 bg-green-50">
          <Zap className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            🎉 Congratulations! Your 30-day trial has started. You now have access to all features.
            <Link href="/subscription" className="underline ml-1">
              Learn about our plans
            </Link>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
