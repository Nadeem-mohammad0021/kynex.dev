

import { z } from 'zod';

// Zod schemas matching the `generate-workflow-from-prompt` flow.
// This provides strong typing for the `spec` object.
const WorkflowStepSchema = z.object({
  label: z.string(),
  description: z.string(),
});

const WorkflowTriggerSchema = z.object({
  label: z.string(),
  description: z.string(),
});

const WorkflowSpecSchema = z.object({
  name: z.string(),
  description: z.string(),
  trigger: WorkflowTriggerSchema,
  steps: z.array(WorkflowStepSchema),
});

// This is the type for the `spec` column in the `workflows` table.
export type WorkflowSpec = z.infer<typeof WorkflowSpecSchema>;

// User interface matching database schema
export interface User {
  user_id: string;
  email: string;
  name?: string;
  clerk_id?: string;
  created_at: string;
}

// Subscription interface matching database schema
export interface Subscription {
  subscription_id: string;
  user_id: string;
  plan: 'free_trial' | 'basic' | 'pro';
  status: 'active' | 'canceled' | 'expired';
  start_date: string;
  end_date?: string;
}

// Workflow interface matching database schema
export interface Workflow {
  workflow_id: string;
  user_id: string;
  name?: string;
  description?: string;
  status: 'draft' | 'confirmed';
  spec: WorkflowSpec;
  created_at: string;
  updated_at: string;
}

// Agent interface matching database schema
export interface Agent {
  agent_id: string;
  workflow_id: string;
  name?: string;
  description?: string;
  model?: string;
  config?: {
    platform?: 'telegram' | 'whatsapp' | 'x' | 'website_widget' | 'api_webhook' | 'instagram';
    credentials?: Record<string, any>;
    status?: 'inactive' | 'active' | 'deploying' | 'error';
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
  // Optional fields for template usage
  templateId?: string;
  behavior?: string;
  spec?: WorkflowSpec;
}

// Template interface for agent templates (used in the templates page)
export interface AgentTemplate {
  templateId: string;
  behavior: string;
  spec: WorkflowSpec;
}

// Deployment interface matching database schema
export interface Deployment {
  deployment_id: string;
  agent_id: string;
  environment: 'dev' | 'prod';
  status: 'active' | 'inactive';
  url?: string;
  deployed_at: string;
  created_at: string;
  updated_at: string;
  // For joined queries
  agent?: {
    name?: string;
    config?: {
      platform?: string;
      status?: string;
    };
    workflows?: {
      user_id: string;
      name?: string;
      config?: {
        name?: string;
      }
    }
  };
  agents?: {
    name?: string;
    config?: {
      platform?: string;
      status?: string;
    };
    workflows?: {
      user_id: string;
      name?: string;
      config?: {
        name?: string;
      }
    }
  };
}

// Log interface for performance tracking
export interface Log {
  log_id: string;
  agent_id: string;
  platform_message: Record<string, any>;
  workflow_run: Record<string, any>;
  response_time_ms?: number;
  status: 'success' | 'error';
  created_at: string;
}

// Performance metrics interface
export interface PerformanceMetric {
  metric_id: string;
  agent_id: string;
  date_recorded: string;
  total_runs: number;
  successful_runs: number;
  avg_response_time_ms: number;
  created_at: string;
}

// Dashboard view interface
export interface AgentDashboard {
  agent_id: string;
  agent_name?: string;
  platform: string;
  status: string;
  workflow_name?: string;
  user_name?: string;
  user_email: string;
  webhook_url?: string;
  deployed_at?: string;
  total_runs: number;
  successful_runs: number;
  avg_response_time?: number;
}
