
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is no longer needed as Workflows are merged with Agents.
// We redirect to the agents page as the new primary location.
function WorkflowsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/agents');
  }, [router]);

  // Render nothing as the user will be redirected.
  return null; 
}

export default WorkflowsRedirect;
