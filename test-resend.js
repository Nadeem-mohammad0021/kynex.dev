// Test script for Resend API integration
// Run with: node test-resend.js (requires API key in environment)

const { Resend } = require('resend');

async function testResend() {
  // Uncomment and set your Resend API key for testing
  // const resend = new Resend('YOUR_RESEND_API_KEY_HERE');
  
  console.log('🧪 Testing Resend API Integration...');
  
  // Example test email (commented to prevent accidental sends)
  /*
  try {
    const result = await resend.emails.send({
      from: 'KYNEX Test <test@kynex.dev>',
      to: 'your-test-email@example.com',
      subject: 'KYNEX Contact Form - Test Email',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>🎉 Resend Integration Test</h2>
          <p>This is a test email to verify the Resend API integration is working correctly.</p>
          <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>Test Details:</strong>
            <ul>
              <li>✅ Email sending: Working</li>
              <li>✅ HTML formatting: Working</li>
              <li>✅ API integration: Working</li>
            </ul>
          </div>
          <p>If you receive this email, the integration is successful!</p>
        </div>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('📧 Email ID:', result.data.id);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  */
  
  console.log('📝 To test the Resend integration:');
  console.log('1. Uncomment the code in this file');
  console.log('2. Set your RESEND_API_KEY in the environment');
  console.log('3. Replace test@kynex.dev with your verified domain');
  console.log('4. Run: node test-resend.js');
  console.log('');
  console.log('🔧 Environment check:');
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Set' : '❌ Not set');
}

if (require.main === module) {
  testResend();
}

module.exports = { testResend };
