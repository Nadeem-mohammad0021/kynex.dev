# **App Name**: AIAgentFlow

## Core Features:

- Dashboard: Display a list of created agents and usage statistics with placeholder data, and a placeholder upgrade button.
- Drag-and-Drop Editor: Provide a canvas-style editor with prebuilt blocks for input, output, API calls, conditions, memory/context, and actions.
- Prompt-Based Workflow Generation: Generate workflow nodes automatically from natural language instructions. Uses an LLM tool for converting user prompts into visual workflows.
- Live Preview: Show mock AI responses using a Gemini API placeholder.
- Deployment Options Placeholder: Provide one-click deployment buttons (placeholders) for various platforms.
- Shareable Web Widget Preview: Allow users to preview agents as a shareable web widget.
- Authentication: Implement email/password and Google OAuth (via Firebase) authentication with session management and role-based access. Frontend collects phone number → calls OTP provider to send OTP. User enters OTP → verify via provider. On success → create user record in DB, assign role = free, set free_deployment_expires_at = signup_date + 30 days.
- Payments: Integrate Stripe for credit card checkout and subscription model with dummy plans (Free, Pro, Enterprise).
- Deployments: Provide channel placeholders (WhatsApp, Telegram, Instagram, X, Website Widget) with connect buttons, deployment logs UI, and embed code for the web widget.
- Admin Panel: Develop an admin panel with super admin access for user management, agent management, payments & plans, deployments monitor, and settings (branding, feature toggles, system status).
- AI Agent Generation: Generate AI Agents, Blocks or workflow with the AI.
- API Integrations: Add some API integrations with the suitable providers.
- Database Configuration: Configure with database.

## Style Guidelines:

- Primary color: Electric blue (#7DF9FF) for a tech-inspired and vibrant feel.
- Background color: Dark grey (#28282B) for a modern, tech-focused look, remaining easy on the eyes while using the app.
- Accent color: Cyan (#00FFFF) to highlight interactive elements and calls to action, giving users a more satisfying experience.
- Headline font: 'Space Grotesk' (sans-serif) for headlines and short amounts of body text; if longer text is anticipated, use this for headlines and 'Inter' for body
- Code font: 'Source Code Pro' (monospace) for displaying code snippets and API calls.
- Use modern, line-style icons that are relevant to each block and action.
- Implement smooth animations and transitions using Framer Motion for a dynamic user experience.
- Design a clean, minimal SaaS dashboard layout with a sidebar for navigation.