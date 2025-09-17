
import { config } from 'dotenv';
config({ path: '.env' });

import '@/ai/flows/generate-workflow-from-prompt';
import '@/ai/flows/edit-workflow-from-prompt';
import '@/ai/flows/generate-ai-agent-from-prompt';
import '@/ai/open-router';
