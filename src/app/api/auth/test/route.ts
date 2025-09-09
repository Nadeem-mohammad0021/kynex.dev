import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Create server client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // Ignore cookie setting errors in API routes
            }
          },
          remove(name: string, options) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch (error) {
              // Ignore cookie removal errors in API routes
            }
          },
        },
      }
    );
    
    // Check for Authorization header first
    const authHeader = request.headers.get('authorization');
    let accessToken = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.replace('Bearer ', '');
      console.log('Found access token in header');
      
      // Set session with token
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: '',
      });
    }
    
    // Get session and user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // Get all cookies for debugging
    const allCookies = Array.from(cookieStore.getAll()).map(cookie => ({
      name: cookie.name,
      value: cookie.value.substring(0, 20) + (cookie.value.length > 20 ? '...' : '')
    }));
    
    const supabaseCookies = allCookies.filter(cookie => 
      cookie.name.includes('supabase') || cookie.name.includes('sb-')
    );
    
    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      auth: {
        hasAuthHeader: !!authHeader,
        accessTokenFromHeader: accessToken ? accessToken.substring(0, 20) + '...' : null,
        session: {
          exists: !!session,
          user_id: session?.user?.id || null,
          email: session?.user?.email || null,
          expires_at: session?.expires_at || null,
          error: sessionError?.message || null
        },
        user: {
          exists: !!user,
          user_id: user?.id || null,
          email: user?.email || null,
          error: userError?.message || null
        }
      },
      cookies: {
        total: allCookies.length,
        supabase: supabaseCookies,
        all: allCookies
      }
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Auth test error:', error);
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
