import { createServerClient } from '@/lib/supabase/server-client';

export class DeploymentSuspensionService {
  private static instance: DeploymentSuspensionService;
  private intervalId: NodeJS.Timeout | null = null;
  
  public static getInstance(): DeploymentSuspensionService {
    if (!DeploymentSuspensionService.instance) {
      DeploymentSuspensionService.instance = new DeploymentSuspensionService();
    }
    return DeploymentSuspensionService.instance;
  }

  // Check for expired subscriptions and suspend deployments
  async suspendExpiredDeployments(): Promise<{ suspended: number; errors: string[] }> {
    try {
      const supabase = await createServerClient();
      
      // Get all users with expired subscriptions who have active deployments
      const { data: expiredUsers, error: usersError } = await supabase
        .from('users')
        .select('user_id, subscription_expires_at')
        .not('subscription_expires_at', 'is', null)
        .lt('subscription_expires_at', new Date().toISOString());

      if (usersError) {
        console.error('Error fetching expired users:', usersError);
        return { suspended: 0, errors: [usersError.message] };
      }

      if (!expiredUsers || expiredUsers.length === 0) {
        return { suspended: 0, errors: [] };
      }

      let totalSuspended = 0;
      const errors: string[] = [];

      // Process each expired user
      for (const user of expiredUsers) {
        try {
          // Get user's workflows
          const { data: workflows } = await supabase
            .from('workflows')
            .select('workflow_id')
            .eq('user_id', user.user_id);

          if (!workflows || workflows.length === 0) continue;

          const workflowIds = workflows.map(w => w.workflow_id);

          // Get user's agents
          const { data: agents } = await supabase
            .from('agents')
            .select('agent_id')
            .in('workflow_id', workflowIds);

          if (!agents || agents.length === 0) continue;

          const agentIds = agents.map(a => a.agent_id);

          // Suspend all active deployments for this user
          const { data: updatedDeployments, error: deploymentError } = await supabase
            .from('deployments')
            .update({
              status: 'suspended',
              stopped_at: new Date().toISOString()
            })
            .in('agent_id', agentIds)
            .eq('status', 'deployed')
            .select();

          if (deploymentError) {
            errors.push(`Error suspending deployments for user ${user.user_id}: ${deploymentError.message}`);
            continue;
          }

          const suspendedCount = updatedDeployments?.length || 0;
          totalSuspended += suspendedCount;

          if (suspendedCount > 0) {
            console.log(`Suspended ${suspendedCount} deployments for user ${user.user_id} (subscription expired: ${user.subscription_expires_at})`);
            
            // Log the suspension for audit purposes
            await supabase
              .from('webhook_events')
              .insert({
                platform: 'system',
                event_type: 'deployment_suspended',
                payload: {
                  user_id: user.user_id,
                  suspended_count: suspendedCount,
                  reason: 'subscription_expired',
                  expired_at: user.subscription_expires_at
                },
                status: 'processed'
              });
          }

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Error processing user ${user.user_id}: ${errorMessage}`);
        }
      }

      return { suspended: totalSuspended, errors };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error in suspendExpiredDeployments:', error);
      return { suspended: 0, errors: [errorMessage] };
    }
  }

  // Reactivate deployments when subscription is renewed
  async reactivateUserDeployments(userId: string): Promise<{ reactivated: number; errors: string[] }> {
    try {
      const supabase = await createServerClient();
      
      // Get user's workflows
      const { data: workflows } = await supabase
        .from('workflows')
        .select('workflow_id')
        .eq('user_id', userId);

      if (!workflows || workflows.length === 0) {
        return { reactivated: 0, errors: [] };
      }

      const workflowIds = workflows.map(w => w.workflow_id);

      // Get user's agents
      const { data: agents } = await supabase
        .from('agents')
        .select('agent_id')
        .in('workflow_id', workflowIds);

      if (!agents || agents.length === 0) {
        return { reactivated: 0, errors: [] };
      }

      const agentIds = agents.map(a => a.agent_id);

      // Reactivate all suspended deployments
      const { data: updatedDeployments, error: deploymentError } = await supabase
        .from('deployments')
        .update({
          status: 'deployed',
          stopped_at: null
        })
        .in('agent_id', agentIds)
        .eq('status', 'suspended')
        .select();

      if (deploymentError) {
        return { reactivated: 0, errors: [deploymentError.message] };
      }

      const reactivatedCount = updatedDeployments?.length || 0;

      if (reactivatedCount > 0) {
        console.log(`Reactivated ${reactivatedCount} deployments for user ${userId}`);
        
        // Log the reactivation for audit purposes
        await supabase
          .from('webhook_events')
          .insert({
            platform: 'system',
            event_type: 'deployment_reactivated',
            payload: {
              user_id: userId,
              reactivated_count: reactivatedCount,
              reason: 'subscription_renewed'
            },
            status: 'processed'
          });
      }

      return { reactivated: reactivatedCount, errors: [] };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error in reactivateUserDeployments:', error);
      return { reactivated: 0, errors: [errorMessage] };
    }
  }

  // Start the suspension service (run every hour)
  startService(intervalMinutes: number = 60): void {
    if (this.intervalId) {
      console.log('Deployment suspension service is already running');
      return;
    }

    console.log(`Starting deployment suspension service (checking every ${intervalMinutes} minutes)`);
    
    // Run immediately
    this.suspendExpiredDeployments().then(result => {
      console.log(`Initial suspension check: ${result.suspended} deployments suspended, ${result.errors.length} errors`);
    });

    // Set up interval
    this.intervalId = setInterval(async () => {
      try {
        const result = await this.suspendExpiredDeployments();
        if (result.suspended > 0 || result.errors.length > 0) {
          console.log(`Suspension check: ${result.suspended} deployments suspended, ${result.errors.length} errors`);
          if (result.errors.length > 0) {
            console.error('Suspension errors:', result.errors);
          }
        }
      } catch (error) {
        console.error('Error in suspension service interval:', error);
      }
    }, intervalMinutes * 60 * 1000);
  }

  // Stop the suspension service
  stopService(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Deployment suspension service stopped');
    }
  }

  // Check if a user's subscription is active
  async isSubscriptionActive(userId: string): Promise<boolean> {
    try {
      const supabase = await createServerClient();
      
      const { data: user } = await supabase
        .from('users')
        .select('subscription_expires_at')
        .eq('user_id', userId)
        .single();

      if (!user?.subscription_expires_at) {
        return false; // No subscription
      }

      return new Date(user.subscription_expires_at) > new Date();
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  // Get subscription status for a user
  async getSubscriptionStatus(userId: string): Promise<{
    isActive: boolean;
    expiresAt: string | null;
    daysRemaining: number;
    hasDeployments: boolean;
  }> {
    try {
      const supabase = await createServerClient();
      
      const { data: user } = await supabase
        .from('users')
        .select('subscription_expires_at')
        .eq('user_id', userId)
        .single();

      // Check if user has deployments
      const { data: workflows } = await supabase
        .from('workflows')
        .select('workflow_id')
        .eq('user_id', userId);

      let hasDeployments = false;
      if (workflows && workflows.length > 0) {
        const workflowIds = workflows.map(w => w.workflow_id);
        
        const { data: agents } = await supabase
          .from('agents')
          .select('agent_id')
          .in('workflow_id', workflowIds);

        if (agents && agents.length > 0) {
          const agentIds = agents.map(a => a.agent_id);
          
          const { count: deploymentCount } = await supabase
            .from('deployments')
            .select('*', { count: 'exact', head: true })
            .in('agent_id', agentIds);

          hasDeployments = (deploymentCount || 0) > 0;
        }
      }

      const expiresAt = user?.subscription_expires_at || null;
      const isActive = expiresAt ? new Date(expiresAt) > new Date() : false;
      const daysRemaining = expiresAt 
        ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0;

      return {
        isActive,
        expiresAt,
        daysRemaining,
        hasDeployments
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return {
        isActive: false,
        expiresAt: null,
        daysRemaining: 0,
        hasDeployments: false
      };
    }
  }
}

export const deploymentSuspensionService = DeploymentSuspensionService.getInstance();
