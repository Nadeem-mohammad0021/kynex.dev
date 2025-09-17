import { nanoid } from 'nanoid';

export interface DeploymentConfig {
  platform: string;
  agentId: string;
  agentName: string;
  credentials?: Record<string, string>;
  deploymentId?: string;
}

export interface DeploymentResult {
  webhook_url?: string;
  embed_code?: string;
  api_endpoint?: string;
  setup_instructions: string;
  integration_code?: string;
  webhook_verification?: string;
  platform_specific_config?: Record<string, any>;
  testing_guide?: string;
}

export class DeploymentGenerator {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || 'https://kynex.ai') {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  generateDeployment(config: DeploymentConfig): DeploymentResult {
    const deploymentId = config.deploymentId || nanoid();
    
    switch (config.platform) {
      case 'Website Widget':
        return this.generateWebsiteWidget(config, deploymentId);
      case 'API Webhook':
        return this.generateAPIWebhook(config, deploymentId);
      case 'WhatsApp':
        return this.generateWhatsAppDeployment(config, deploymentId);
      case 'Telegram':
        return this.generateTelegramDeployment(config, deploymentId);
      case 'X (Twitter)':
        return this.generateTwitterDeployment(config, deploymentId);
      case 'Instagram':
        return this.generateInstagramDeployment(config, deploymentId);
      default:
        throw new Error(`Unsupported platform: ${config.platform}`);
    }
  }

  private generateWebsiteWidget(config: DeploymentConfig, deploymentId: string): DeploymentResult {
    const embedCode = `<!-- KYNEX AI Agent Widget -->
<div id="kynex-agent-${deploymentId}"></div>
<script>
  (function() {
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = '${this.baseUrl}/widget/embed.js';
    s.onload = function() {
      KynexAgent.init({
        deploymentId: '${deploymentId}',
        agentName: '${config.agentName}',
        containerId: 'kynex-agent-${deploymentId}',
        theme: 'auto',
        position: 'bottom-right',
        primaryColor: '#0891b2',
        greeting: 'Hi! How can I help you today?'
      });
    };
    document.head.appendChild(s);
  })();
</script>`;

    const integrationCode = `// React Integration Example
import { KynexWidget } from '@kynex/react-widget';

function App() {
  return (
    <div>
      <KynexWidget 
        deploymentId="${deploymentId}"
        agentName="${config.agentName}"
        theme="auto"
      />
    </div>
  );
}

// Vue Integration Example
<template>
  <KynexWidget 
    deployment-id="${deploymentId}"
    agent-name="${config.agentName}"
  />
</template>

// WordPress Shortcode
[kynex_agent id="${deploymentId}" name="${config.agentName}"]`;

    return {
      webhook_url: `${this.baseUrl}/api/webhook/widget/${deploymentId}`,
      embed_code: embedCode,
      integration_code: integrationCode,
      setup_instructions: `
1. Copy the embed code above and paste it into your website's HTML
2. The widget will appear in the bottom-right corner of your page
3. Customize the appearance by modifying the configuration options
4. Test the integration using the testing guide below
      `,
      testing_guide: `
To test your widget:
1. Open your website in a private/incognito browser window
2. Look for the chat widget in the bottom-right corner
3. Click on it and send a test message
4. The widget should respond with your agent's configured behavior
5. Check your deployment dashboard for conversation logs
      `
    };
  }

  private generateAPIWebhook(config: DeploymentConfig, deploymentId: string): DeploymentResult {
    const webhookUrl = `${this.baseUrl}/api/webhook/generic/${deploymentId}`;
    const apiEndpoint = `${this.baseUrl}/api/agents/${deploymentId}/message`;

    const integrationCode = `// Node.js / Express Example
const axios = require('axios');

async function sendMessageToAgent(message, userId = 'anonymous') {
  try {
    const response = await axios.post('${apiEndpoint}', {
      message: message,
      userId: userId,
      timestamp: new Date().toISOString(),
      metadata: {
        source: 'api',
        version: '1.0'
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'YOUR_API_KEY' // Get this from your dashboard
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error calling agent:', error);
  }
}

// Python Example
import requests
import json

def send_message_to_agent(message, user_id='anonymous'):
    url = '${apiEndpoint}'
    headers = {
        'Content-Type': 'application/json',
        'X-API-Key': 'YOUR_API_KEY'
    }
    
    payload = {
        'message': message,
        'userId': user_id,
        'timestamp': datetime.now().isoformat(),
        'metadata': {
            'source': 'api',
            'version': '1.0'
        }
    }
    
    response = requests.post(url, headers=headers, json=payload)
    return response.json()

// cURL Example
curl -X POST '${apiEndpoint}' \\
  -H 'Content-Type: application/json' \\
  -H 'X-API-Key: YOUR_API_KEY' \\
  -d '{
    "message": "Hello, can you help me?",
    "userId": "user123",
    "timestamp": "2024-01-01T00:00:00Z"
  }'`;

    return {
      webhook_url: webhookUrl,
      api_endpoint: apiEndpoint,
      integration_code: integrationCode,
      setup_instructions: `
1. Use the API endpoint above to send messages to your agent
2. Include your API key in the X-API-Key header (get from dashboard)
3. Send POST requests with message, userId, and timestamp
4. The agent will respond with processed message and actions
5. Webhook URL can receive incoming data from external services
      `,
      webhook_verification: `
To verify webhook delivery, include this signature validation:

// Node.js signature verification
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === \`sha256=\${expectedSignature}\`;
}
      `,
      testing_guide: `
Test your API integration:

1. Get your API key from the deployment dashboard
2. Send a test message using one of the code examples
3. Check the response format and handling
4. Monitor webhook deliveries in your dashboard
5. Verify error handling and retry logic
      `
    };
  }

  private generateWhatsAppDeployment(config: DeploymentConfig, deploymentId: string): DeploymentResult {
    const webhookUrl = `${this.baseUrl}/api/webhook/whatsapp/${deploymentId}`;
    
    const setupCode = `// WhatsApp Business API Setup
// 1. Add this webhook URL in your WhatsApp Business API settings
const webhookUrl = '${webhookUrl}';

// 2. Verify webhook endpoint (required by WhatsApp)
app.get('/webhook/whatsapp/${deploymentId}', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode === 'subscribe' && token === 'YOUR_VERIFY_TOKEN') {
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Verification failed');
  }
});

// 3. Handle incoming messages
app.post('/webhook/whatsapp/${deploymentId}', (req, res) => {
  const { entry } = req.body;
  
  entry.forEach(item => {
    const changes = item.changes;
    changes.forEach(change => {
      if (change.field === 'messages') {
        const messages = change.value.messages;
        messages.forEach(message => {
          // Forward to KYNEX agent
          processWhatsAppMessage(message);
        });
      }
    });
  });
  
  res.status(200).send('EVENT_RECEIVED');
});`;

    return {
      webhook_url: webhookUrl,
      integration_code: setupCode,
      platform_specific_config: {
        verify_token: `kynex_${deploymentId}`,
        webhook_events: ['messages', 'message_deliveries', 'message_reads'],
        api_version: 'v18.0'
      },
      setup_instructions: `
🟢 WhatsApp Business API Integration:

1. Go to your Facebook App Dashboard
2. Add WhatsApp Business API product
3. Set webhook URL: ${webhookUrl}
4. Set verify token: kynex_${deploymentId}
5. Subscribe to webhook events: messages, message_deliveries
6. Add your phone number to the app
7. Test with the verification steps below

📝 Required Credentials:
- WhatsApp Business API Key: ${config.credentials?.business_api_key ? '✓ Provided' : '❌ Missing'}
- Webhook Verify Token: kynex_${deploymentId}
      `,
      testing_guide: `
🧪 Testing Your WhatsApp Integration:

1. Send a test message to your WhatsApp Business number
2. Check your webhook receives the message payload
3. Verify the agent processes and responds correctly
4. Monitor message delivery status
5. Test different message types (text, media, buttons)

💡 Pro Tips:
- Use WhatsApp's test phone numbers during development  
- Monitor webhook logs in your Facebook App Dashboard
- Set up message templates for faster responses
      `
    };
  }

  private generateTelegramDeployment(config: DeploymentConfig, deploymentId: string): DeploymentResult {
    const webhookUrl = `${this.baseUrl}/api/webhook/telegram/${deploymentId}`;
    const botToken = config.credentials?.bot_token || 'YOUR_BOT_TOKEN';
    
    const setupCode = `// Telegram Bot Setup with KYNEX Integration
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Initialize bot
const bot = new TelegramBot('${botToken}', { polling: false });

// Set webhook
bot.setWebHook('${webhookUrl}');

// Handle incoming updates
app.post('/webhook/telegram/${deploymentId}', async (req, res) => {
  const update = req.body;
  
  if (update.message) {
    const chatId = update.message.chat.id;
    const messageText = update.message.text;
    const userId = update.message.from.id;
    
    try {
      // Send to KYNEX agent for processing
      const response = await axios.post('${this.baseUrl}/api/agents/${deploymentId}/message', {
        message: messageText,
        userId: userId.toString(),
        platform: 'telegram',
        chatId: chatId,
        metadata: update.message
      });
      
      // Send agent's response back to Telegram
      if (response.data.reply) {
        await bot.sendMessage(chatId, response.data.reply);
      }
      
    } catch (error) {
      console.error('Error processing message:', error);
      await bot.sendMessage(chatId, 'Sorry, I encountered an error. Please try again.');
    }
  }
  
  res.status(200).send('OK');
});

// Bot commands setup
const setupCommands = async () => {
  await bot.setMyCommands([
    { command: 'start', description: 'Start conversation with ${config.agentName}' },
    { command: 'help', description: 'Get help and information' },
    { command: 'reset', description: 'Reset conversation context' }
  ]);
};

setupCommands();`;

    return {
      webhook_url: webhookUrl,
      integration_code: setupCode,
      platform_specific_config: {
        bot_token: botToken,
        webhook_secret: `telegram_${deploymentId}`,
        allowed_updates: ['message', 'callback_query'],
        commands: [
          { command: 'start', description: `Start conversation with ${config.agentName}` },
          { command: 'help', description: 'Get help and information' },
          { command: 'reset', description: 'Reset conversation context' }
        ]
      },
      setup_instructions: `
🤖 Telegram Bot Integration Setup:

1. Your bot token: ${botToken ? '✓ Configured' : '❌ Missing'}
2. Webhook URL has been set automatically
3. Bot commands configured for better UX
4. Ready to receive messages!

🔧 Manual Setup (if needed):
- Set webhook: POST to https://api.telegram.org/bot${botToken}/setWebhook
- Webhook URL: ${webhookUrl}
- Test with /start command

📱 Bot Features:
- Automatic message processing through ${config.agentName}
- Context-aware conversations
- Command support (/start, /help, /reset)
- Media and file handling
      `,
      testing_guide: `
🧪 Testing Your Telegram Bot:

1. Search for your bot on Telegram: @YourBotUsername
2. Send /start command to begin
3. Send a test message to verify agent response
4. Try different message types (text, media, stickers)
5. Test commands: /help, /reset

🔍 Debug Steps:
- Check webhook status: https://api.telegram.org/bot${botToken}/getWebhookInfo
- Monitor webhook calls in your server logs
- Use Telegram's Bot API testing tools
- Verify bot token and permissions
      `
    };
  }

  private generateTwitterDeployment(config: DeploymentConfig, deploymentId: string): DeploymentResult {
    const webhookUrl = `${this.baseUrl}/api/webhook/twitter/${deploymentId}`;
    
    const setupCode = `// Twitter API v2 Integration with KYNEX
const { TwitterApi } = require('twitter-api-v2');
const express = require('express');

// Initialize Twitter client
const twitterClient = new TwitterApi({
  appKey: '${config.credentials?.api_key || 'YOUR_API_KEY'}',
  appSecret: '${config.credentials?.api_secret || 'YOUR_API_SECRET'}',
  accessToken: 'YOUR_ACCESS_TOKEN',
  accessSecret: 'YOUR_ACCESS_TOKEN_SECRET',
});

// Set up webhook for Account Activity API
const setupTwitterWebhook = async () => {
  try {
    // Register webhook
    const webhook = await twitterClient.v1.post('account_activity/all/webhooks.json', {
      url: '${webhookUrl}'
    });
    
    console.log('Webhook registered:', webhook);
    
    // Subscribe to events
    await twitterClient.v1.post('account_activity/all/subscriptions.json');
    
  } catch (error) {
    console.error('Webhook setup error:', error);
  }
};

// Handle incoming tweets and DMs
app.post('/webhook/twitter/${deploymentId}', async (req, res) => {
  const event = req.body;
  
  // Handle direct messages
  if (event.direct_message_events) {
    for (const dm of event.direct_message_events) {
      if (dm.type === 'MessageCreate') {
        await handleDirectMessage(dm);
      }
    }
  }
  
  // Handle mentions
  if (event.tweet_create_events) {
    for (const tweet of event.tweet_create_events) {
      if (tweet.in_reply_to_status_id || tweet.text.includes('@YourHandle')) {
        await handleMention(tweet);
      }
    }
  }
  
  res.status(200).send('OK');
});

const handleDirectMessage = async (dm) => {
  const message = dm.message_create;
  const senderId = message.sender_id;
  const text = message.message_data.text;
  
  try {
    // Send to KYNEX agent
    const response = await fetch('${this.baseUrl}/api/agents/${deploymentId}/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        userId: senderId,
        platform: 'twitter_dm',
        metadata: dm
      })
    });
    
    const agentReply = await response.json();
    
    // Send reply via Twitter DM
    if (agentReply.reply) {
      await twitterClient.v1.post('direct_messages/events/new.json', {
        event: {
          type: 'MessageCreate',
          message_create: {
            target: { recipient_id: senderId },
            message_data: { text: agentReply.reply }
          }
        }
      });
    }
    
  } catch (error) {
    console.error('Error handling DM:', error);
  }
};

const handleMention = async (tweet) => {
  // Similar handling for mentions/replies
  // Process through KYNEX agent and reply to tweet
};

// Initialize
setupTwitterWebhook();`;

    return {
      webhook_url: webhookUrl,
      integration_code: setupCode,
      platform_specific_config: {
        api_version: 'v2',
        webhook_environments: 'production',
        subscriptions: ['direct_messages', 'tweets'],
        rate_limits: {
          dm_rate_limit: '300/15min',
          tweet_rate_limit: '300/15min'
        }
      },
      setup_instructions: `
🐦 Twitter Integration Setup:

⚠️  Prerequisites:
- Twitter Developer Account with Elevated Access
- Account Activity API subscription ($99+/month)
- Approved app with read/write permissions

🔧 Setup Steps:
1. API Key: ${config.credentials?.api_key ? '✓ Configured' : '❌ Required'}
2. API Secret: ${config.credentials?.api_secret ? '✓ Configured' : '❌ Required'}
3. Bearer Token: ${config.credentials?.bearer_token ? '✓ Configured' : '❌ Required'}
4. Webhook registered at: ${webhookUrl}
5. Subscribed to: Direct Messages, Mentions

📋 Capabilities:
- Respond to direct messages automatically
- Reply to mentions and tweets
- Monitor brand mentions
- Engage with followers using ${config.agentName}
      `,
      testing_guide: `
🧪 Testing Twitter Integration:

1. Send a DM to your connected Twitter account
2. Mention your account in a tweet
3. Check that ${config.agentName} responds appropriately
4. Monitor rate limits and API usage
5. Test different message types and media

⚡ Pro Tips:
- Use Twitter's sandbox environment for testing
- Monitor webhook delivery in Twitter Developer Dashboard  
- Set up retry logic for failed API calls
- Consider implementing tweet threading for long responses

🔍 Troubleshooting:
- Verify webhook endpoint is publicly accessible
- Check Twitter Developer App permissions
- Ensure Account Activity API is enabled
- Monitor API rate limits and quotas
      `
    };
  }

  private generateInstagramDeployment(config: DeploymentConfig, deploymentId: string): DeploymentResult {
    const webhookUrl = `${this.baseUrl}/api/webhook/instagram/${deploymentId}`;
    
    const setupCode = `// Instagram Messaging API Integration
const express = require('express');
const axios = require('axios');

const PAGE_ACCESS_TOKEN = '${config.credentials?.access_token || 'YOUR_PAGE_ACCESS_TOKEN'}';
const VERIFY_TOKEN = 'instagram_${deploymentId}';

// Webhook verification (required by Instagram)
app.get('/webhook/instagram/${deploymentId}', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Instagram webhook verified');
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Verification failed');
  }
});

// Handle incoming messages
app.post('/webhook/instagram/${deploymentId}', async (req, res) => {
  const body = req.body;

  if (body.object === 'instagram') {
    body.entry.forEach(entry => {
      if (entry.messaging) {
        entry.messaging.forEach(messagingEvent => {
          handleInstagramMessage(messagingEvent);
        });
      }
      
      if (entry.changes) {
        entry.changes.forEach(change => {
          if (change.field === 'comments') {
            handleInstagramComment(change.value);
          }
        });
      }
    });
  }

  res.status(200).send('EVENT_RECEIVED');
});

const handleInstagramMessage = async (messagingEvent) => {
  const senderId = messagingEvent.sender.id;
  const message = messagingEvent.message;
  
  if (message && message.text) {
    try {
      // Send to KYNEX agent for processing
      const response = await axios.post('${this.baseUrl}/api/agents/${deploymentId}/message', {
        message: message.text,
        userId: senderId,
        platform: 'instagram_dm',
        metadata: messagingEvent
      });

      // Send response back to Instagram
      if (response.data.reply) {
        await sendInstagramMessage(senderId, response.data.reply);
      }
      
    } catch (error) {
      console.error('Error processing Instagram message:', error);
    }
  }
};

const sendInstagramMessage = async (recipientId, messageText) => {
  try {
    await axios.post(\`https://graph.facebook.com/v18.0/me/messages\`, {
      recipient: { id: recipientId },
      message: { text: messageText }
    }, {
      params: { access_token: PAGE_ACCESS_TOKEN }
    });
  } catch (error) {
    console.error('Error sending Instagram message:', error);
  }
};

const handleInstagramComment = async (commentData) => {
  // Handle comments on posts
  const commentText = commentData.text;
  const commentId = commentData.id;
  
  try {
    // Process comment through KYNEX agent
    const response = await axios.post('${this.baseUrl}/api/agents/${deploymentId}/message', {
      message: commentText,
      userId: commentData.from.id,
      platform: 'instagram_comment',
      metadata: commentData
    });

    // Reply to comment if appropriate
    if (response.data.reply) {
      await replyToInstagramComment(commentId, response.data.reply);
    }
    
  } catch (error) {
    console.error('Error handling Instagram comment:', error);
  }
};`;

    return {
      webhook_url: webhookUrl,
      integration_code: setupCode,
      platform_specific_config: {
        app_id: config.credentials?.app_id || 'YOUR_APP_ID',
        verify_token: `instagram_${deploymentId}`,
        webhook_fields: ['messages', 'messaging_postbacks', 'comments'],
        api_version: 'v18.0'
      },
      setup_instructions: `
📸 Instagram Messaging API Setup:

🔧 Prerequisites:
- Instagram Business/Creator Account
- Facebook Page connected to Instagram
- Facebook App with Instagram Basic Display + Instagram Messaging

📋 Configuration Steps:
1. App ID: ${config.credentials?.app_id ? '✓ Configured' : '❌ Required'}  
2. Page Access Token: ${config.credentials?.access_token ? '✓ Configured' : '❌ Required'}
3. Webhook URL: ${webhookUrl}
4. Verify Token: instagram_${deploymentId}
5. Webhook Fields: messages, messaging_postbacks, comments

🎯 Features Enabled:
- Auto-respond to Instagram DMs
- Reply to comments on posts  
- Handle story mentions
- Process media messages
- Powered by ${config.agentName}

⚙️ Facebook App Settings:
- Add Instagram Messaging product
- Configure webhook subscription
- Request necessary permissions
- Test with Instagram Test Users
      `,
      testing_guide: `
🧪 Testing Instagram Integration:

1. Send a DM to your connected Instagram Business account
2. Comment on one of your Instagram posts
3. Verify ${config.agentName} responds appropriately
4. Test different content types (text, media, emojis)
5. Check message delivery and read receipts

🔍 Debugging Checklist:
- Webhook URL is publicly accessible (HTTPS required)
- Instagram Business account is connected to Facebook Page
- Page Access Token has required permissions
- Webhook subscription is active in Facebook App
- Test using Instagram's testing tools

📊 Monitoring:
- Check Facebook App Dashboard for webhook delivery
- Monitor API usage and rate limits
- Review message delivery success rates
- Track user engagement metrics

💡 Best Practices:
- Respond within 24 hours to avoid restrictions
- Use Instagram message templates for common responses
- Handle media messages gracefully  
- Implement proper error handling and retries
      `
    };
  }
}

export const deploymentGenerator = new DeploymentGenerator();
