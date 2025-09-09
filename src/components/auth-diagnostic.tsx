'use client';

import { useState, useEffect } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AuthDiagnostic() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostics = async () => {
    setIsLoading(true);
    const supabase = getSupabaseBrowserClient();
    const results: any = {};

    try {
      // 1. Check current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      results.session = {
        exists: !!session,
        user_id: session?.user?.id || 'None',
        email: session?.user?.email || 'None',
        error: sessionError?.message || 'None'
      };

      // 2. Check current user via getUser()
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      results.user = {
        exists: !!user,
        user_id: user?.id || 'None',
        email: user?.email || 'None',
        error: userError?.message || 'None'
      };

      if (user) {
        // 3. Check if user exists in public.users table
        const { data: publicUser, error: publicUserError } = await supabase
          .from('users')
          .select('user_id, email, name, subscription_plan')
          .eq('user_id', user.id)
          .single();

        results.publicUser = {
          exists: !!publicUser,
          data: publicUser || 'None',
          error: publicUserError?.message || 'None',
          errorCode: publicUserError?.code || 'None'
        };

        // 4. Test API call to workflow generate endpoint
        try {
          const response = await fetch('/api/workflows/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt: 'Test prompt for diagnostics'
            }),
          });

          results.apiTest = {
            status: response.status,
            statusText: response.statusText,
            response: response.ok ? 'Success' : await response.text()
          };
        } catch (apiError: any) {
          results.apiTest = {
            status: 'Error',
            error: apiError.message
          };
        }

        // 5. Check auth.uid() in database
        try {
          const { data: authUidTest, error: authUidError } = await supabase
            .rpc('get_auth_uid');
          
          results.authUid = {
            value: authUidTest || 'None',
            error: authUidError?.message || 'None'
          };
        } catch (e: any) {
          results.authUid = {
            value: 'RPC not available',
            error: e.message
          };
        }
      }

    } catch (error: any) {
      results.error = error.message;
    }

    setDiagnostics(results);
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🔍 Authentication Diagnostic</CardTitle>
        <Button onClick={runDiagnostics} disabled={isLoading}>
          {isLoading ? 'Running Diagnostics...' : 'Run Diagnostics'}
        </Button>
      </CardHeader>
      <CardContent>
        {diagnostics && (
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(diagnostics, null, 2)}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}
