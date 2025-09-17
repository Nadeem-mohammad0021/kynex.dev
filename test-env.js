// Test script to verify environment configuration
// Run with: node test-env.js

require('dotenv').config({ path: '.env.local' });

function testEnvironment() {
  console.log('🔧 Environment Configuration Test\n');
  
  console.log('📧 Email Configuration:');
  console.log('├─ ADMIN_EMAIL:', process.env.ADMIN_EMAIL || '❌ Not set');
  console.log('├─ SUPPORT_EMAIL:', process.env.SUPPORT_EMAIL || '❌ Not set');
  console.log('└─ RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Set (hidden)' : '❌ Not set');
  console.log('');
  
  console.log('🌐 Site Configuration:');
  console.log('└─ NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL || '❌ Not set');
  console.log('');
  
  console.log('🔐 API Keys:');
  console.log('├─ OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? '✅ Set (hidden)' : '❌ Not set');
  console.log('├─ STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY?.includes('your_') ? '⚠️ Placeholder' : (process.env.STRIPE_SECRET_KEY ? '✅ Set (hidden)' : '❌ Not set'));
  console.log('└─ RESEND_API_KEY:', process.env.RESEND_API_KEY?.startsWith('re_') ? '✅ Valid format' : '❌ Invalid format');
  console.log('');
  
  // Test email recipients logic
  const supportEmail = process.env.SUPPORT_EMAIL || 'support@kynex.dev';
  const emailRecipients = [supportEmail];
  
  console.log('📬 Contact Form Recipients:');
  console.log(`└─ ${supportEmail} (Support team)`);
  console.log('');
  
  console.log('📧 Email Flow:');
  console.log('├─ From: User\'s email address');
  console.log('├─ To: Support team only');
  console.log('└─ Reply: Direct to user');
  console.log('');
  
  // Summary
  const isConfigured = !!(
    process.env.SUPPORT_EMAIL && 
    process.env.RESEND_API_KEY?.startsWith('re_')
  );
  
  console.log('🎯 Configuration Status:');
  console.log(isConfigured ? '✅ Contact form is ready to use!' : '❌ Configuration incomplete');
  
  if (!isConfigured) {
    console.log('');
    console.log('📝 To fix:');
    if (!process.env.SUPPORT_EMAIL) console.log('• Set SUPPORT_EMAIL in .env.local');
    if (!process.env.RESEND_API_KEY?.startsWith('re_')) console.log('• Set valid RESEND_API_KEY in .env.local');
  }
}

if (require.main === module) {
  testEnvironment();
}

module.exports = { testEnvironment };
