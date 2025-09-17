'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export default function AuthRedirectPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    const handleAuth = async () => {
      // Check if there's a hash with tokens
      if (window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          try {
            // Set the session
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });

            if (!error) {
              // Clear the hash and redirect
              window.location.hash = '';
              router.push('/dashboard');
              return;
            }
          } catch (err) {
            console.error('Auth error:', err);
          }
        }
      }

      // If no tokens or error, redirect to sign-in
      router.push('/sign-in');
    };

    handleAuth();
  }, [router, supabase]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Completing authentication...</p>
      </div>
    </div>
  );
}
