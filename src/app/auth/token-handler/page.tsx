'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Loader } from '@/components/ui/loader';

export default function TokenHandlerPage() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    const handleTokenFromFragment = async () => {
      try {
        // First check if we have a code parameter (from PKCE fallback)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
          console.log('Token handler - Received code for PKCE exchange:', code);
          
          // Try to exchange the code for session on client side
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('Client-side code exchange failed:', error);
            setError(error.message);
            setStatus('error');
            return;
          }
          
          if (data.session) {
            setStatus('success');
            // Clear the URL params and redirect to dashboard
            window.history.replaceState({}, document.title, window.location.pathname);
            router.push('/dashboard');
            return;
          }
        }
        
        // Check if we have token data in the URL fragment
        if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const expiresIn = hashParams.get('expires_in');

          if (accessToken && refreshToken) {
            // Set the session using the tokens
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });

            if (error) {
              console.error('Error setting session:', error);
              setError(error.message);
              setStatus('error');
              return;
            }

            if (data.session) {
              setStatus('success');
              // Clear the URL hash and redirect to dashboard
              window.history.replaceState({}, document.title, window.location.pathname);
              router.push('/dashboard');
              return;
            }
          }
        }

        // Try to get existing session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError(sessionError.message);
          setStatus('error');
          return;
        }

        if (session) {
          setStatus('success');
          router.push('/dashboard');
        } else {
          setError('No valid session found');
          setStatus('error');
        }

      } catch (err: any) {
        console.error('Token handling error:', err);
        setError(err.message || 'An unknown error occurred');
        setStatus('error');
      }
    };

    handleTokenFromFragment();
  }, [router, supabase]);

  // Redirect to sign-in if there's an error after a delay
  useEffect(() => {
    if (status === 'error') {
      const timer = setTimeout(() => {
        router.push('/sign-in?error=Authentication failed');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  return (
    <div className="flex justify-center items-center h-screen bg-muted/40">
      <div className="text-center space-y-4">
        {status === 'processing' && (
          <>
            <Loader />
            <p className="text-muted-foreground">Processing authentication...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-12 h-12 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-600 font-medium">Authentication successful!</p>
            <p className="text-muted-foreground">Redirecting to dashboard...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-600 font-medium">Authentication failed</p>
            <p className="text-muted-foreground text-sm">{error}</p>
            <p className="text-muted-foreground text-sm">Redirecting to sign in...</p>
          </>
        )}
      </div>
    </div>
  );
}
