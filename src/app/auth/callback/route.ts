
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  console.log('Auth callback - URL:', requestUrl.toString());
  console.log('Auth callback - Code received:', code ? 'Yes' : 'No');

  if (code) {
    const cookieStore = await cookies();
    
    // Get all cookies for debugging
    const allCookies = Array.from(cookieStore.getAll());
    const supabaseCookies = allCookies.filter(cookie => 
      cookie.name.includes('supabase') || cookie.name.includes('sb-')
    );
    
    console.log('Auth callback - Available cookies:', supabaseCookies.map(c => c.name));
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const value = cookieStore.get(name)?.value;
            console.log(`Auth callback - Get cookie ${name}:`, value ? 'Found' : 'Not found');
            return value;
          },
          set(name: string, value: string, options) {
            console.log(`Auth callback - Set cookie ${name}`);
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options) {
            console.log(`Auth callback - Remove cookie ${name}`);
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    console.log('Auth callback - Attempting code exchange...');
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Auth callback - Code exchange failed:', error.message);
      console.error('Auth callback - Error details:', error);
      
      // If PKCE flow fails, try alternative approaches
      if (error.message.includes('code verifier')) {
        console.log('Auth callback - PKCE flow failed, redirecting to client-side handler');
        // Redirect to client-side handler with the code
        return NextResponse.redirect(`${origin}/auth/token-handler?code=${code}`);
      }
    } else {
      console.log('Auth callback - Code exchange successful, user:', data.user?.email);
      console.log('Auth callback - Session created:', !!data.session);
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  } else {
    console.log('Auth callback - No code parameter received');
  }

  // Handle direct token response (when tokens are in URL fragment)
  // Since fragments are not available server-side, redirect to a client-side handler
  if (requestUrl.searchParams.size === 0) {
    console.log('Auth callback - No parameters, redirecting to token handler');
    return NextResponse.redirect(`${origin}/auth/token-handler`);
  }

  // return the user to the sign-in page with an error message
  console.log('Auth callback - Final fallback, redirecting to sign-in with error');
  return NextResponse.redirect(`${origin}/sign-in?error=Authentication%20failed`);
}
