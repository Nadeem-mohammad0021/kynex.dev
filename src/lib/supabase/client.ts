
'use client';

// Note: This is a client-side-only Supabase client.
// It is used to interact with Supabase from browser components.

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key is not defined in environment variables.');
}

// It's safe to use a singleton instance of the client here.
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Use implicit flow as fallback since PKCE has issues with Next.js SSR
    flowType: 'implicit',
    debug: process.env.NODE_ENV === 'development'
  }
});

/**
 * A helper function to get the Supabase client instance.
 * @returns The Supabase client.
 */
export function getSupabaseBrowserClient(): SupabaseClient {
    return supabase;
}
