
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { useToast } from '@/hooks/use-toast';
import { Loader } from '@/components/ui/loader';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  User as UserIcon, 
  Settings, 
  Bell, 
  Shield, 
  CreditCard, 
  Download, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  Mail,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

interface UserProfile {
  user_id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  subscription_plan: string;
  subscription_expires_at?: string;
  trial_started_at?: string;
  created_at: string;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    workflowNotifications: true,
    marketingEmails: false,
    securityAlerts: true
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUser(user);
          
          // Fetch user profile from public.users table
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          if (profile) {
            setUserProfile(profile);
            setFormData({ 
              name: profile.name || '', 
              email: profile.email || user.email || '' 
            });
          } else {
            // Fallback to auth user data
            setFormData({ 
              name: user.user_metadata?.full_name || user.user_metadata?.name || '', 
              email: user.email || '' 
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load user data',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [toast]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const supabase = getSupabaseBrowserClient();
      
      // Update user profile in public.users table
      const { error } = await supabase
        .from('users')
        .upsert({
          user_id: user.id,
          name: formData.name,
          email: formData.email,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      });
      
      // Refresh user data
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (profile) {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      window.location.href = '/sign-in';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getSubscriptionBadgeColor = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'pro':
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'starter':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'free':
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Loader showText />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Manage your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar and Basic Info */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage 
                    src={userProfile?.avatar_url || user?.user_metadata?.avatar_url} 
                    alt={formData.name || 'User avatar'} 
                  />
                  <AvatarFallback className="text-lg font-semibold">
                    {(formData.name || formData.email || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {formData.name || 'Anonymous User'}
                  </h3>
                  <p className="text-muted-foreground">{formData.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getSubscriptionBadgeColor(userProfile?.subscription_plan || 'free')}>
                      {(userProfile?.subscription_plan || 'free').toUpperCase()}
                    </Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      Joined {new Date(userProfile?.created_at || '').toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email address"
                    disabled
                  />
                  <p className="text-sm text-muted-foreground">
                    Email changes must be made through your authentication provider
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader size="xs" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Control how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries({
                emailUpdates: { label: 'Email Updates', description: 'Receive important updates via email' },
                workflowNotifications: { label: 'Workflow Notifications', description: 'Get notified when workflows complete or fail' },
                marketingEmails: { label: 'Marketing Emails', description: 'Receive promotional content and feature announcements' },
                securityAlerts: { label: 'Security Alerts', description: 'Important security notifications and login alerts' }
              }).map(([key, { label, description }]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>{label}</Label>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                  <Switch
                    checked={notifications[key as keyof typeof notifications]}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, [key]: checked }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription & Billing
              </CardTitle>
              <CardDescription>
                Manage your subscription plan and billing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {userProfile && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Current Plan</h3>
                      <Badge className={getSubscriptionBadgeColor(userProfile.subscription_plan)}>
                        {userProfile.subscription_plan.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  {userProfile.subscription_expires_at && (
                    <p className="text-sm text-muted-foreground">
                      {userProfile.trial_started_at ? 'Trial expires' : 'Subscription renews'} on{' '}
                      {new Date(userProfile.subscription_expires_at).toLocaleDateString()}
                    </p>
                  )}
                  
                  <div className="mt-4">
                    <Link href="/subscription">
                      <Button className="w-full sm:w-auto">
                        Manage Subscription
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
              
              {userProfile?.subscription_plan === 'free' && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    You're currently on the free plan. Upgrade to access premium features like unlimited workflows and priority support.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Application Preferences
              </CardTitle>
              <CardDescription>
                Customize your KYNEX experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium">Theme</h3>
                  <p className="text-sm text-muted-foreground">Choose between light and dark themes</p>
                </div>
                <ThemeToggle />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Data & Privacy</h3>
                <div className="grid gap-4">
                  <Button variant="outline" className="flex items-center gap-2 justify-start">
                    <Download className="h-4 w-4" />
                    Export My Data
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 justify-start text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Account deletion is permanent and cannot be undone. All your workflows, agents, and data will be permanently deleted.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
