'use client';

import { useEffect } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function ClearAuthPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    const clearAuth = async () => {
      try {
        // Sign out from Supabase
        await supabase.auth.signOut();
        
        // Clear all storage
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear cookies
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        
        console.log('✅ Auth cleared successfully');
        
        // Redirect to home page
        setTimeout(() => {
          router.push('/');
        }, 1000);
        
      } catch (error) {
        console.error('Error clearing auth:', error);
        // Still redirect even if there's an error
        router.push('/');
      }
    };

    clearAuth();
  }, [router, supabase]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center p-8 max-w-md">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold mb-2">Clearing Authentication</h1>
        <p className="text-muted-foreground">
          Cleaning up expired tokens and redirecting you...
        </p>
      </div>
    </div>
  );
}
