import { AgentTemplate } from '@/types/agent';

// This will now represent data from the public 'templates' collection
export const templates: AgentTemplate[] = [
  {
    templateId: 'whatsapp-order-bot',
    behavior: 'You are an expert sales agent who can manage orders and check inventory via a document.',
    spec: {
        name: "WhatsApp Order Bot",
        description: "Manages sales orders and inventory questions via WhatsApp.",
        trigger: {
            label: "New WhatsApp Message",
            description: "Triggers when a new message is received via WhatsApp."
        },
        steps: [
            { label: "Analyze User Intent", description: "Determines if the user wants to place an order or ask about inventory." },
            { label: "Conditional Branch", description: "Routes the flow based on user intent (Order or Inventory)." },
            { label: "Process Order", description: "If intent is 'order', collects details like item and quantity." },
            { label: "Check Inventory", description: "If intent is 'inventory', checks a knowledge base for stock levels." },
            { label: "Send WhatsApp Reply", description: "Sends a formatted response to the user via WhatsApp." }
        ]
    }
  },
  {
    templateId: 'sales-lead-qualifier',
    behavior: 'You are a sales lead qualification expert. Analyze provided information and score the lead.',
    spec: {
        name: "Sales Lead Qualifier",
        description: "Analyzes incoming leads and scores them based on potential value.",
        trigger: {
            label: "New Lead from CRM",
            description: "Triggers when a new lead is created in the CRM."
        },
        steps: [
            { label: "Extract Lead Data", description: "Pulls key information from the new lead record (e.g., company size, role)." },
            { label: "Enrich Lead Data", description: "Uses external APIs to gather more context about the lead or company." },
            { label: "Score Lead", description: "Applies a scoring model to rate the lead's potential value." },
            { label: "Update CRM", description: "Updates the lead record in the CRM with the new score and qualification status." },
            { label: "Notify Sales Team", description: "Sends a notification to the appropriate sales channel if the lead is highly qualified." }
        ]
    }
  },
  {
    templateId: 'social-media-manager',
    behavior: 'You are a creative social media manager. Generate engaging posts.',
    spec: {
        name: "Social Media Manager",
        description: "Generates and schedules posts for various social media platforms.",
        trigger: {
            label: "On a Schedule",
            description: "Triggers every day at a specified time (e.g., 9:00 AM)."
        },
        steps: [
            { label: "Get Daily Topic", description: "Reads from a content calendar or document to get the day's topic." },
            { label: "Generate Post Content", description: "Uses an AI model to write engaging copy for the social media post." },
            { label: "Generate Image", description: "Uses an AI image generation model to create a relevant visual." },
            { label: "Human Approval", description: "Sends the draft post for a human to review and approve." },
            { label: "Schedule Post", description: "Schedules the approved post on the target social media platform." }
        ]
    }
  },
  {
    templateId: 'hr-policy-bot',
    behavior: 'You are an HR assistant. Answer questions based on the provided HR policy document.',
    spec: {
        name: "HR Policy Bot",
        description: "Answers employee questions about company policies and procedures.",
        trigger: {
            label: "New Chat Message",
            description: "Triggers when an employee sends a message in a chat interface."
        },
        steps: [
            { label: "Receive Question", description: "Captures the employee's question from the chat." },
            { label: "Search Knowledge Base", description: "Searches the HR policy documents for relevant information." },
            { label: "Generate Answer", description: "Uses an AI model to synthesize an answer from the retrieved documents." },
            { label: "Send Response", description: "Delivers the answer back to the employee in the chat." }
        ]
    }
  },
];
