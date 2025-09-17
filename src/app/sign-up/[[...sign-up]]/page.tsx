
'use client';

import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Logo } from '@/components/icons/logo';
import { Loader } from '@/components/ui/loader';
import { Github } from 'lucide-react';


export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = getSupabaseBrowserClient();

  const handleSignUpWithGithub = async () => {
    setIsLoading(true);
    setError(null);
    try {
       const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-muted/40">
        <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
                <Logo width={48} height={48} className="mx-auto mb-4" />
                <CardTitle className="text-2xl font-bold font-headline">Create an Account</CardTitle>
                <CardDescription>Get started with AIAgentFlow by signing up with your GitHub account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 {error && <p className="text-destructive text-sm text-center">{error}</p>}
                 <Button onClick={handleSignUpWithGithub} className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader size="xs" className="text-sm" /> :
                    <>
                        <Github className="mr-2 h-4 w-4" />
                        Continue with GitHub
                    </>
                    }
                </Button>
                 <div className="mt-4 text-center text-sm">
                    Already have an account?{' '}
                    <Link href="/sign-in" className="underline">
                        Sign in
                    </Link>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
