import { NextRequest, NextResponse } from 'next/server';
import { generateWorkflowFromPrompt } from '@/ai/flows/generate-workflow-from-prompt';
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Get Authorization header
    const authHeader = request.headers.get('authorization');
    console.log('Authorization header:', authHeader ? authHeader.substring(0, 20) + '...' : 'None');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.replace('Bearer ', '');
    
    // Create Supabase server client with access token
    const cookieStore = await cookies();
    
    // First, create a client with the access token to set the session
    const supabase = createSupabaseServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
        auth: {
          persistSession: false,
        },
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
    
    // Set the session manually to make auth.uid() work
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: '', // We don't need refresh token for this API call
    });
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // Debug: Log authentication results
    console.log('Auth result:', { user: user ? { id: user.id, email: user.email } : null, error: userError });

    if (userError || !user) {
      console.log('Authentication failed:', userError?.message || 'No user found');
      return NextResponse.json(
        { error: 'Authentication required. Please sign in and try again.' },
        { status: 401 }
      );
    }
    
    console.log('User authenticated successfully:', user.id);

    // Verify user exists in public.users table (should be created by trigger)
    // Try multiple times in case of timing issues with the trigger
    let userData = null;
    let userCheckError = null;
    
    for (let attempt = 0; attempt < 3; attempt++) {
      const result = await supabase
        .from('users')
        .select('user_id')
        .eq('user_id', user.id)
        .single();
      
      if (result.data) {
        userData = result.data;
        userCheckError = null;
        break;
      } else if (result.error?.code === 'PGRST116' && attempt < 2) {
        // User doesn't exist yet, wait a moment for trigger to complete
        console.log(`User not found, attempt ${attempt + 1}/3, waiting...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        continue;
      } else {
        userCheckError = result.error;
        break;
      }
    }

    if (userCheckError) {
      console.error('Error checking user after retries:', userCheckError);
      if (userCheckError.code === 'PGRST116') {
        // Create user manually as fallback
        console.log('Creating user manually as fallback...');
        const { error: createError } = await supabase
          .from('users')
          .insert({
            user_id: user.id,
            email: user.email || '',
            name: user.user_metadata?.full_name || user.user_metadata?.name || user.email || '',
            avatar_url: user.user_metadata?.avatar_url || null,
          });
        
        if (createError) {
          console.error('Error creating user manually:', createError);
          return NextResponse.json(
            { error: 'Error creating user profile' },
            { status: 500 }
          );
        }
        console.log('User created manually successfully');
      } else {
        return NextResponse.json(
          { error: 'Error loading user profile' },
          { status: 500 }
        );
      }
    }

    // Call the workflow generation function with authenticated user
    const result = await generateWorkflowFromPrompt({
      prompt,
      userId: user.id
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Workflow generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
