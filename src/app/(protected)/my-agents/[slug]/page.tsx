
'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

// A workflow is now viewed inside the agent detail page. 
// We redirect to the corresponding agent detail page.
function MyAgentDetailRedirect() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  useEffect(() => {
    if (slug) {
      router.replace(`/agents/editor/${slug}`);
    }
  }, [router, slug]);

  return null;
}

export default MyAgentDetailRedirect;
