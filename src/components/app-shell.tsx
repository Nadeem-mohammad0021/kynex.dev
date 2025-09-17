
"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Bot, Settings, LifeBuoy, CreditCard, LogOut, LayoutDashboard, Rocket, Folders, User, LogIn, Plus, Compass, BookOpen, MessageCircle } from 'lucide-react';
import { KynexLogo } from '@/components/icons/kynex-logo';
import { KynexDevLogo } from '@/components/kynex-dev-logo';
import { FloatingChatbot } from '@/components/floating-chatbot';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Loader } from './ui/loader';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { TutorialButton } from './tutorial/tutorial-button';

// Helper function to determine tutorial name based on current path
function getTutorialNameForPath(pathname: string): string {
  if (pathname.startsWith('/agents/editor')) {
    return 'editor';
  }
  if (pathname.startsWith('/deployments')) {
    return 'deployments';
  }
  if (pathname.startsWith('/dashboard')) {
    return 'complete';
  }
  return 'complete'; // Default tutorial
}

const pageTitles: { [key: string]: string } = {
    '/dashboard': 'Dashboard',
    '/agents': 'Explore Agents',
    '/my-agents': 'My Agents',
    '/my-account': 'My Account',
    '/deployments': 'Deployments',
    '/docs': 'Documentation',
    '/subscription': 'Subscription',
    '/settings': 'Settings',
    '/help': 'Help & Support',
    '/contact-us': 'Contact Us',
};

const getPageTitle = (path: string) => {
  if (path.startsWith('/agents/editor')) return 'Agent Editor';
  const base_path = '/' + path.split('/')[1];
  return pageTitles[base_path] || 'KYNEX.dev';
}

// Separate component that uses the sidebar hook
function AppShellContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState('KYNEX.dev');
  const { setOpenMobile, isMobile } = useSidebar();
  const isMobileDevice = useIsMobile();

  useEffect(() => {
    setPageTitle(getPageTitle(pathname));
  }, [pathname]);

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (isMobileDevice) {
      setOpenMobile(false);
    }
  }, [pathname, isMobileDevice, setOpenMobile]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session ? 'Session exists' : 'No session');
        
        if (event === 'TOKEN_REFRESHED') {
          console.log('✅ Token refreshed successfully');
        }
        
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          router.push('/sign-in');
        } else {
          setUser(session?.user ?? null);
        }
        setIsLoading(false);
      }
    );

    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          // If it's a refresh token error, clear auth and redirect
          if (error.message?.includes('refresh_token_not_found') || 
              error.message?.includes('Invalid Refresh Token')) {
            console.log('🔄 Clearing invalid session...');
            await supabase.auth.signOut();
            localStorage.clear();
            sessionStorage.clear();
            router.push('/sign-in');
            return;
          }
        }
        
        if (!session) {
          router.push('/sign-in');
        } else {
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        router.push('/sign-in');
      }
      setIsLoading(false);
    };
    
    getSession();

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase.auth, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
  };

  const handleLogoClick = () => {
    router.push('/dashboard');
    // Close mobile sidebar when navigating via logo
    if (isMobileDevice) {
      setOpenMobile(false);
    }
  };
  
  const sidebarMenu = (
    <>
       <SidebarMenuItem>
        <Link href="/dashboard" passHref>
          <SidebarMenuButton isActive={pathname.startsWith('/dashboard')}>
            <LayoutDashboard />
            Dashboard
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
      <SidebarMenuItem id="tutorial-explore">
        <Link href="/agents" passHref>
          <SidebarMenuButton isActive={pathname === ('/agents')} data-tutorial-target="explore">
            <Compass />
            Explore
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
      <SidebarMenuItem id="tutorial-my-agents">
        <Link href="/my-agents" passHref>
          <SidebarMenuButton isActive={pathname.startsWith('/my-agents') || pathname.startsWith('/agents/editor')} data-tutorial-target="my-agents">
            <Folders />
            My Agents
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
      <SidebarMenuItem id="tutorial-deployments">
        <Link href="/deployments" passHref>
          <SidebarMenuButton isActive={pathname.startsWith('/deployments')} data-tutorial-target="deployments">
            <Rocket />
            Deployments
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <Link href="/docs" passHref>
          <SidebarMenuButton isActive={pathname.startsWith('/docs')}>
            <BookOpen />
            Docs
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <Link href="/subscription" passHref>
          <SidebarMenuButton isActive={pathname.startsWith('/subscription')}>
            <CreditCard />
            Subscription
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    </>
  );
  
  if (isLoading || !user) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <Loader />
        </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar>
        <SidebarHeader>
           <KynexDevLogo logoSize="lg" className="px-0" onClick={handleLogoClick} />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {sidebarMenu}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
             <SidebarMenuItem>
              <Link href="/help" passHref>
                <SidebarMenuButton isActive={pathname.startsWith('/help')}>
                  <LifeBuoy />
                  Help
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/contact-us" passHref>
                <SidebarMenuButton isActive={pathname.startsWith('/contact-us')}>
                  <MessageCircle />
                  Contact Us
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
          <div className="flex flex-col h-full">
              <header className="flex items-center justify-between border-b p-4 flex-shrink-0">
                  <div className="flex items-center gap-4">
                  <SidebarTrigger className="md:hidden" />
                  <h1 className="text-2xl font-bold font-headline">{pageTitle}</h1>
                  </div>
                  <div className="flex items-center gap-4">
                      <TutorialButton 
                        variant="outline" 
                        size="sm" 
                        tutorialName={getTutorialNameForPath(pathname)} 
                      />
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                  <Avatar>
                                      {user.user_metadata?.avatar_url && <AvatarImage src={user.user_metadata.avatar_url} alt={user.email} />}
                                      <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56" align="end" forceMount>
                              <DropdownMenuLabel className="font-normal">
                              <div className="flex flex-col space-y-1">
                                  <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name ?? 'My Account'}</p>
                                  <p className="text-xs leading-none text-muted-foreground">
                                      {user.email}
                                  </p>
                              </div>
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuGroup>
                              <DropdownMenuItem asChild>
                                  <Link href="/my-account">
                                      <User className="mr-2 h-4 w-4" />
                                      <span>My Account</span>
                                  </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                  <Link href="/settings">
                                      <Settings className="mr-2 h-4 w-4" />
                                      <span>Settings</span>
                                  </Link>
                              </DropdownMenuItem>
                              </DropdownMenuGroup>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={handleLogout}>
                                  <LogOut className="mr-2 h-4 w-4" />
                                  <span>Log out</span>
                              </DropdownMenuItem>
                          </DropdownMenuContent>
                      </DropdownMenu>
                  </div>
              </header>
              <main className="flex-1 overflow-auto">
                  {children}
              </main>
          </div>
      </SidebarInset>
      <FloatingChatbot />
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppShellContent>{children}</AppShellContent>
    </SidebarProvider>
  );
}
