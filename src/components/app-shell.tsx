
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
} from '@/components/ui/sidebar';
import { Bot, Settings, LifeBuoy, CreditCard, LogOut, LayoutDashboard, Rocket, Folders, User, LogIn, Plus, Compass } from 'lucide-react';
import { KynexLogo } from '@/components/icons/kynex-logo';
import { KynexDevLogo } from '@/components/kynex-dev-logo';
import { FloatingChatbot } from '@/components/floating-chatbot';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Loader } from './ui/loader';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';

const pageTitles: { [key: string]: string } = {
    '/dashboard': 'Dashboard',
    '/agents': 'Explore Agents',
    '/my-agents': 'My Agents',
    '/my-account': 'My Account',
    '/deployments': 'Deployments',
    '/subscription': 'Subscription',
    '/settings': 'Settings',
    '/help': 'Help & Support',
};

  const getPageTitle = (path: string) => {
    if (path.startsWith('/agents/editor')) return 'Agent Editor';
    const base_path = '/' + path.split('/')[1];
    return pageTitles[base_path] || 'KYNEX.dev';
  }

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState('KYNEX.dev');

  useEffect(() => {
    setPageTitle(getPageTitle(pathname));
  }, [pathname]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          router.push('/sign-in');
        } else {
          setUser(session?.user ?? null);
        }
        setIsLoading(false);
      }
    );

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
       if (!session) {
          router.push('/sign-in');
        } else {
          setUser(session?.user ?? null);
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
      <SidebarMenuItem>
        <Link href="/agents" passHref>
          <SidebarMenuButton isActive={pathname === ('/agents')}>
            <Compass />
            Explore
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
       <SidebarMenuItem>
        <Link href="/my-agents" passHref>
          <SidebarMenuButton isActive={pathname.startsWith('/my-agents') || pathname.startsWith('/agents/editor')}>
            <Folders />
            My Agents
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <Link href="/deployments" passHref>
          <SidebarMenuButton isActive={pathname.startsWith('/deployments')}>
            <Rocket />
            Deployments
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
    <SidebarProvider>
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
      </div>
      <FloatingChatbot />
    </SidebarProvider>
  );
}
