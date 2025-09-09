
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Bot, AlertCircle, Timer, Plus, Rocket, Users, MessageSquare, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { RealTimePerformance } from '@/components/real-time-performance';
import { SubscriptionTimer } from '@/components/subscription-timer';
import { Loader } from '@/components/ui/loader';
import { OnboardingWelcome } from '@/components/onboarding-welcome';

interface DashboardStats {
  totalAgents: number;
  deployedAgents: number;
  totalDeployments: number;
  activeConversations: number;
  totalMessages: number;
  subscriptionDaysLeft: number;
  subscriptionUsage: number;
  subscriptionLimit: number;
}

interface RecentActivity {
  id: string;
  type: 'deployment' | 'conversation' | 'agent_created';
  agentName: string;
  platform?: string;
  status: 'success' | 'error' | 'pending';
  timestamp: string;
  details?: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAgents: 0,
    deployedAgents: 0,
    totalDeployments: 0,
    activeConversations: 0,
    totalMessages: 0,
    subscriptionDaysLeft: 30,
    subscriptionUsage: 0,
    subscriptionLimit: 1000
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [usageData, setUsageData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setError('Please sign in to view dashboard data');
        setIsLoading(false);
        return;
      }

      const userId = session.user.id;

      // Get user data (user should be created automatically by trigger)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_id, subscription_plan, subscription_expires_at, created_at')
        .eq('user_id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user:', userError);
        // If user doesn't exist, the trigger should have created them
        // This might happen if they just signed up and trigger hasn't run yet
        if (userError.code === 'PGRST116') {
          setError('User profile is being created. Please refresh the page in a moment.');
        } else {
          setError('Error loading user data');
        }
        setIsLoading(false);
        return;
      }

      // Fetch workflows
      const { data: workflows } = await supabase
        .from('workflows')
        .select('workflow_id, name, created_at')
        .eq('user_id', userId);

      const workflowIds = workflows?.map(w => w.workflow_id) || [];
      
      // Fetch agents
      let agents: any[] = [];
      if (workflowIds.length > 0) {
        const { data: agentsData } = await supabase
          .from('agents')
          .select('agent_id, workflow_id, name, platform, status, created_at')
          .in('workflow_id', workflowIds);
        agents = agentsData || [];
      }

      const agentIds = agents.map(a => a.agent_id);
      
      // Fetch deployments
      let deployments: any[] = [];
      if (agentIds.length > 0) {
        const { data: deploymentsData } = await supabase
          .from('deployments')
          .select('deployment_id, agent_id, status, created_at')
          .in('agent_id', agentIds);
        deployments = deploymentsData || [];
      }

      // Fetch logs for activity
      let logs: any[] = [];
      if (agentIds.length > 0) {
        const { data: logsData } = await supabase
          .from('logs')
          .select('log_id, agent_id, status, created_at, message')
          .in('agent_id', agentIds)
          .order('created_at', { ascending: false })
          .limit(50);
        logs = logsData || [];
      }

      // Calculate subscription days left
      const subscriptionExpiresAt = userData?.subscription_expires_at;
      const subscriptionDaysLeft = subscriptionExpiresAt 
        ? Math.max(0, Math.ceil((new Date(subscriptionExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 30;

      // Calculate usage data for the last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const dailyUsage = last7Days.map(date => {
        const dayLogs = logs.filter(log => log.created_at.startsWith(date));
        return {
          date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          messages: dayLogs.length,
          conversations: Math.ceil(dayLogs.length / 3) // Rough estimate
        };
      });

      // Generate recent activity
      const activities: RecentActivity[] = [];
      
      // Add deployment activities
      deployments.slice(0, 3).forEach(deployment => {
        const agent = agents.find(a => a.agent_id === deployment.agent_id);
        activities.push({
          id: deployment.deployment_id,
          type: 'deployment',
          agentName: agent?.name || 'Unknown Agent',
          platform: agent?.platform || 'Unknown',
          status: deployment.status === 'deployed' ? 'success' : deployment.status === 'failed' ? 'error' : 'pending',
          timestamp: deployment.created_at,
          details: `Deployed to ${agent?.platform || 'platform'}`
        });
      });

      // Add recent agent creation activities
      agents.slice(0, 2).forEach(agent => {
        activities.push({
          id: agent.agent_id,
          type: 'agent_created',
          agentName: agent.name,
          platform: agent.platform,
          status: 'success',
          timestamp: agent.created_at,
          details: 'Agent created successfully'
        });
      });

      // Add conversation activities
      logs.slice(0, 5).forEach(log => {
        const agent = agents.find(a => a.agent_id === log.agent_id);
        activities.push({
          id: log.log_id,
          type: 'conversation',
          agentName: agent?.name || 'Unknown Agent',
          status: log.status === 'success' ? 'success' : 'error',
          timestamp: log.created_at,
          details: log.message || 'Conversation activity'
        });
      });

      // Sort by timestamp and take latest
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setStats({
        totalAgents: agents.length,
        deployedAgents: agents.filter(a => deployments.some(d => d.agent_id === a.agent_id && d.status === 'deployed')).length,
        totalDeployments: deployments.length,
        activeConversations: logs.filter(log => 
          new Date(log.created_at).getTime() > Date.now() - (24 * 60 * 60 * 1000)
        ).length,
        totalMessages: logs.length,
        subscriptionDaysLeft,
        subscriptionUsage: logs.length,
        subscriptionLimit: userData?.subscription_plan === 'pro' ? 10000 : userData?.subscription_plan === 'starter' ? 1000 : 100
      });
      
      setUsageData(dailyUsage);
      setRecentActivity(activities.slice(0, 10));
      
      // Check if user is new (no workflows created and account less than 7 days old)
      const isNewAccount = userData && new Date(userData.created_at).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000);
      const hasNoWorkflows = !workflows || workflows.length === 0;
      const shouldShowOnboarding = isNewAccount && hasNoWorkflows;
      
      setIsNewUser(isNewAccount);
      setShowOnboarding(shouldShowOnboarding);
      setIsLoading(false);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Error loading dashboard data');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);
  
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) {
        return Math.floor(interval) + " years ago";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return Math.floor(interval) + " months ago";
    }
    interval = seconds / 86400;
    if (interval > 1) {
        return Math.floor(interval) + " days ago";
    }
    interval = seconds / 3600;
    if (interval > 1) {
        return Math.floor(interval) + " hours ago";
    }
    interval = seconds / 60;
    if (interval > 1) {
        return Math.floor(interval) + " minutes ago";
    }
    return Math.floor(seconds) + " seconds ago";
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Loader />
        <p className="mt-2 text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const subscriptionProgress = Math.min((stats.subscriptionUsage / stats.subscriptionLimit) * 100, 100);
  const isSubscriptionExpiringSoon = stats.subscriptionDaysLeft <= 7;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-lg text-muted-foreground">
                {isNewUser ? 'Welcome to KYNEX! Let\'s get you started.' : 'Welcome back! Here\'s an overview of your KYNEX agents.'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href="/deployments">
                  <Rocket className="mr-2 h-4 w-4" />
                  View Deployments
                </Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                <Link href="/agents/editor/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Agent
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Onboarding for New Users */}
        {showOnboarding && (
          <div className="mb-8">
            <OnboardingWelcome 
              onDismiss={() => setShowOnboarding(false)}
              completedSteps={[]}
            />
          </div>
        )}

        {/* Subscription Alert */}
        {isSubscriptionExpiringSoon && (
          <Alert className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 mb-6 shadow-sm">
            <Timer className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Your subscription expires in {stats.subscriptionDaysLeft} days. 
              <Link href="/subscription" className="underline ml-1 font-medium hover:text-amber-900">
                Upgrade now
              </Link> to continue using your agents.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Agents</CardTitle>
              <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.totalAgents}</div>
              <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                {stats.deployedAgents} deployed
              </p>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Active Deployments</CardTitle>
              <Rocket className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.totalDeployments}</div>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                Across {stats.deployedAgents} agents
              </p>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Active Conversations</CardTitle>
              <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{stats.activeConversations}</div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Last 24 hours
              </p>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Total Messages</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">{stats.totalMessages}</div>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                All time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 xl:grid-cols-12">
          
          {/* Left Column - Main Content */}
          <div className="xl:col-span-8 space-y-8">
            
            {/* Subscription Usage */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5 text-primary" />
                  Subscription Usage
                </CardTitle>
                <CardDescription>
                  {stats.subscriptionUsage} of {stats.subscriptionLimit} messages used this month
                  • {stats.subscriptionDaysLeft} days remaining
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Current Usage</span>
                    <span className={subscriptionProgress > 80 ? 'text-orange-600' : 'text-primary'}>
                      {Math.round(subscriptionProgress)}%
                    </span>
                  </div>
                  <Progress 
                    value={subscriptionProgress} 
                    className="h-3 bg-slate-200 dark:bg-slate-700" 
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{stats.subscriptionUsage} messages</span>
                    <span>{stats.subscriptionLimit - stats.subscriptionUsage} remaining</span>
                  </div>
                  {subscriptionProgress > 80 && (
                    <Alert className="border-orange-200 bg-orange-50/50">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-700">
                        You're approaching your monthly limit. 
                        <Link href="/subscription" className="underline ml-1 font-medium">
                          Consider upgrading your plan
                        </Link>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Performance Overview */}
            <RealTimePerformance />
            
          </div>

          {/* Right Column - Subscription Timer */}
          <div className="xl:col-span-4">
            <div className="sticky top-6">
              <SubscriptionTimer />
            </div>
          </div>
          
        </div>

        {/* Bottom Section - Charts and Activity */}
        <div className="grid gap-8 lg:grid-cols-2 mt-12">
          {/* Activity Overview Chart */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                Activity Overview
              </CardTitle>
              <CardDescription className="text-indigo-700 dark:text-indigo-300">
                Messages and conversations in the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="date" 
                    tickLine={false} 
                    axisLine={false} 
                    className="text-xs fill-muted-foreground"
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    className="text-xs fill-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="messages" 
                    stroke="#6366f1" 
                    fill="#6366f1" 
                    fillOpacity={0.3} 
                    strokeWidth={3}
                    name="Messages"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="conversations" 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.2} 
                    strokeWidth={2}
                    name="Conversations"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* Recent Activity */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-rose-50/50 to-pink-50/50 dark:from-rose-950/30 dark:to-pink-950/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-rose-900 dark:text-rose-100">
                <Activity className="h-5 w-5 text-rose-600" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-rose-700 dark:text-rose-300">
                Latest deployments, conversations, and agent updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={activity.id} className={`flex items-start space-x-3 pb-3 ${
                      index < recentActivity.length - 1 ? 'border-b border-border/50' : ''
                    }`}>
                      <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-2 shadow-sm ${
                        activity.status === 'success' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 
                        activity.status === 'error' ? 'bg-gradient-to-r from-red-400 to-red-500' : 'bg-gradient-to-r from-amber-400 to-amber-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {activity.agentName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.details}
                          {activity.platform && (
                            <span className="ml-1 text-xs bg-secondary/50 px-1.5 py-0.5 rounded">
                              {activity.platform}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground/80 mt-1">
                          {formatRelativeTime(activity.timestamp)}
                        </p>
                      </div>
                      <Badge 
                        variant={activity.type === 'deployment' ? 'default' : 
                                activity.type === 'conversation' ? 'secondary' : 'outline'}
                        className="text-xs font-medium"
                      >
                        {activity.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center mb-4">
                      <Activity className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">No recent activity</p>
                    <p className="text-xs text-muted-foreground">
                      Deploy your first agent to see activity here
                    </p>
                    <Button variant="outline" size="sm" asChild className="mt-4">
                      <Link href="/agents/editor/new">
                        <Plus className="mr-2 h-3 w-3" />
                        Create Agent
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
              
              {recentActivity.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href="/deployments">
                      <Activity className="mr-2 h-4 w-4" />
                      View All Activity
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
      </div>
    </div>
  );
}
