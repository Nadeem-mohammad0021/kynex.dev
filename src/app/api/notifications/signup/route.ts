import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, userId, metadata } = body;

    // Basic validation
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Send notification email to admin
    const emailResult = await resend.emails.send({
      from: 'KYNEX Notifications <notifications@resend.dev>', // Free Resend domain
      to: [process.env.ADMIN_EMAIL!],
      subject: '🎉 New User Signup - KYNEX Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb; margin-bottom: 24px;">🎉 New User Signed Up!</h2>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin-top: 0; color: #334155;">User Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin-bottom: 8px;"><strong>Name:</strong> ${name || 'Not provided'}</li>
              <li style="margin-bottom: 8px;"><strong>Email:</strong> ${email}</li>
              <li style="margin-bottom: 8px;"><strong>User ID:</strong> ${userId}</li>
              <li style="margin-bottom: 8px;"><strong>Signup Time:</strong> ${new Date().toLocaleString()}</li>
            </ul>
          </div>

          <div style="background-color: #ecfdf5; border: 1px solid #d1fae5; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <h4 style="margin-top: 0; color: #065f46;">📊 Quick Stats:</h4>
            <p style="margin: 0; color: #047857;">This user has been automatically enrolled in a 30-day trial with full access to all features.</p>
          </div>

          <div style="background-color: #f1f5f9; border-radius: 8px; padding: 16px;">
            <h4 style="margin-top: 0; color: #475569;">🎯 Next Steps:</h4>
            <ul style="color: #64748b;">
              <li>User can create unlimited AI agents during trial</li>
              <li>Monitor usage in the admin dashboard</li>
              <li>Consider reaching out with onboarding tips</li>
            </ul>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
          
          <p style="color: #64748b; font-size: 14px; text-align: center;">
            This notification was sent from your KYNEX platform.<br>
            Time: ${new Date().toISOString()}
          </p>
        </div>
      `,
      text: `
        🎉 New User Signed Up!
        
        User Details:
        - Name: ${name || 'Not provided'}
        - Email: ${email}
        - User ID: ${userId}
        - Signup Time: ${new Date().toLocaleString()}
        
        This user has been automatically enrolled in a 30-day trial.
        
        Time: ${new Date().toISOString()}
      `
    });

    if (emailResult.error) {
      console.error('Failed to send notification email:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send notification email' },
        { status: 500 }
      );
    }

    console.log('✅ Signup notification sent successfully:', {
      email,
      name,
      userId,
      emailId: emailResult.data?.id
    });

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
      emailId: emailResult.data?.id
    });

  } catch (error: any) {
    console.error('Signup notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to test the notification system
export async function GET() {
  return NextResponse.json({
    message: 'Signup notification endpoint is working',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
}
