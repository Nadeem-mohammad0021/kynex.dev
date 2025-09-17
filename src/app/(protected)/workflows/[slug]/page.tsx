
'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

// This page is no longer needed. A workflow is now viewed
// inside the agent detail page. We redirect to the corresponding
// agent detail page.
function WorkflowDetailRedirect() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  useEffect(() => {
    if (slug) {
      router.replace(`/agents/${slug}`);
    } else {
      router.replace('/agents');
    }
  }, [router, slug]);

  return null;
}

export default WorkflowDetailRedirect;
