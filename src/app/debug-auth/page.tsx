'use client';

import { useState, useEffect } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugAuthPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    setIsLoading(true);
    const supabase = getSupabaseBrowserClient();
    
    try {
      // Check session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      // Check user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      // Check cookies manually
      const cookies = document.cookie.split(';').map(c => c.trim());
      
      setSessionInfo({
        session: {
          exists: !!session,
          user_id: session?.user?.id || 'None',
          email: session?.user?.email || 'None',
          access_token: session?.access_token ? session.access_token.substring(0, 20) + '...' : 'None',
          error: sessionError?.message || 'None'
        },
        user: {
          exists: !!user,
          user_id: user?.id || 'None',
          email: user?.email || 'None',
          error: userError?.message || 'None'
        },
        cookies: cookies.filter(c => c.includes('supabase') || c.includes('sb-')),
        allCookies: cookies.length,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      setSessionInfo({ error: error.message });
    }
    
    setIsLoading(false);
  };

  const testApiCall = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        alert('No session found. Please sign in first.');
        return;
      }

      const response = await fetch('/api/workflows/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ prompt: 'Test prompt' }),
      });
      
      const result = await response.text();
      alert(`API Response (${response.status}): ${result}`);
    } catch (error: any) {
      alert(`API Error: ${error.message}`);
    }
  };

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = '/sign-in';
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>🔍 Authentication Debug</CardTitle>
          <div className="flex gap-2">
            <Button onClick={checkSession} disabled={isLoading}>
              {isLoading ? 'Checking...' : 'Check Session'}
            </Button>
            <Button onClick={testApiCall} variant="outline">
              Test API Call
            </Button>
            <Button onClick={signOut} variant="destructive">
              Sign Out
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sessionInfo && (
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-auto whitespace-pre-wrap">
              {JSON.stringify(sessionInfo, null, 2)}
            </pre>
          )}
          
          <div className="mt-6 space-y-2 text-sm text-gray-600">
            <h3 className="font-semibold">What to look for:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>session.exists:</strong> Should be <code>true</code> if signed in</li>
              <li><strong>cookies:</strong> Should contain Supabase session cookies (sb-*)</li>
              <li><strong>access_token:</strong> Should exist if session is valid</li>
              <li><strong>API test:</strong> Should work if everything is configured correctly</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
