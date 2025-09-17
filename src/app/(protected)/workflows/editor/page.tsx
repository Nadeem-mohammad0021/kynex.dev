
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// The standalone workflow editor is no longer needed.
// We redirect to the new unified agent editor.
function WorkflowEditorRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/agents/editor/new');
  }, [router]);

  return null; 
}

export default WorkflowEditorRedirect;
