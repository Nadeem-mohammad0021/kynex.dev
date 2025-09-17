
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is no longer used.
// We redirect to the sign-in page.
function AuthErrorRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/sign-in');
  }, [router]);

  return null; 
}

export default AuthErrorRedirect;
