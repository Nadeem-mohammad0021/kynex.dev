import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;
    const priority = formData.get('priority') as string;
    const attachment = formData.get('attachment') as File | null;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Priority emoji mapping
    const priorityEmojis = {
      low: '🟢',
      medium: '🟡', 
      high: '🔴'
    };

    const priorityEmoji = priorityEmojis[priority as keyof typeof priorityEmojis] || '🟡';
    const priorityLabel = priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'Medium';

    // Handle attachment if present
    let attachmentData = null;
    if (attachment && attachment.size > 0) {
      // Check file size (5MB limit)
      if (attachment.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: 'Attachment size must be less than 5MB' },
          { status: 400 }
        );
      }

      // Check file type (images only)
      if (!attachment.type.startsWith('image/')) {
        return NextResponse.json(
          { success: false, error: 'Only image attachments are allowed' },
          { status: 400 }
        );
      }

      // Convert file to base64 for email attachment
      const bytes = await attachment.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      attachmentData = {
        filename: attachment.name,
        content: buffer,
        content_type: attachment.type,
      };
    }

    // Create HTML email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1f2937; margin-bottom: 10px;">New Message from ${name}</h1>
            <div style="width: 50px; height: 3px; background-color: #3b82f6; margin: 0 auto;"></div>
          </div>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #374151; margin: 0 0 15px 0; display: flex; align-items: center;">
              ${priorityEmoji} Priority: ${priorityLabel}
            </h2>
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              Received on ${new Date().toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short'
              })}
            </p>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="color: #374151; margin-bottom: 15px; font-size: 18px;">Contact Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 15px; background-color: #f9fafb; border: 1px solid #e5e7eb; font-weight: bold; color: #374151; width: 120px;">Name:</td>
                <td style="padding: 10px 15px; background-color: white; border: 1px solid #e5e7eb; color: #6b7280;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 15px; background-color: #f9fafb; border: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Email:</td>
                <td style="padding: 10px 15px; background-color: white; border: 1px solid #e5e7eb; color: #6b7280;">
                  <a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 15px; background-color: #f9fafb; border: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Subject:</td>
                <td style="padding: 10px 15px; background-color: white; border: 1px solid #e5e7eb; color: #6b7280;">${subject}</td>
              </tr>
            </table>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="color: #374151; margin-bottom: 15px; font-size: 18px;">Message</h3>
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <p style="color: #374151; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
          </div>

          ${attachment ? `
            <div style="margin-bottom: 25px;">
              <h3 style="color: #374151; margin-bottom: 15px; font-size: 18px;">📎 Attachment</h3>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; color: #6b7280;">
                <p style="margin: 0;"><strong>Filename:</strong> ${attachment.name}</p>
                <p style="margin: 5px 0 0 0;"><strong>Size:</strong> ${(attachment.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          ` : ''}

          <div style="text-align: center; padding-top: 25px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 14px; margin: 0;">
              This message was sent via the KYNEX.dev contact form
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
              <strong>Reply to this email</strong> to respond directly to ${name} (${email})
            </p>
          </div>
        </div>
      </div>
    `;

    // Create plain text version
    const textContent = `
New Message from ${name} - ${priorityLabel} Priority

Contact Information:
- Name: ${name}
- Email: ${email}
- Subject: ${subject}
- Priority: ${priorityLabel}
- Date: ${new Date().toLocaleString()}

Message:
${message}

${attachment ? `Attachment: ${attachment.name} (${(attachment.size / 1024).toFixed(1)} KB)` : 'No attachment'}

---
This message was sent via the KYNEX.dev contact form.
Reply to this email to respond directly to ${name} (${email}).
    `;

    // Get email addresses from environment variables
    const supportEmail = process.env.SUPPORT_EMAIL || 'support@kynex.dev';
    const emailRecipients = [supportEmail];
    
    console.log('📧 Email configuration:', {
      from: `KYNEX Support <support@kynex.dev>`,
      replyTo: email,
      to: supportEmail,
      userEmail: email
    });

    // Prepare email options - using verified domain but user as reply-to
    const emailOptions: any = {
      from: `${name} via KYNEX <support@kynex.dev>`,
      replyTo: `${name} <${email}>`,
      to: emailRecipients,
      subject: `${priorityEmoji} [${priorityLabel} Priority] ${subject}`,
      html: htmlContent,
      text: textContent,
    };

    // Add attachment if present
    if (attachmentData) {
      emailOptions.attachments = [attachmentData];
    }

    // Send email using Resend
    const emailResponse = await resend.emails.send(emailOptions);

    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error);
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 500 }
      );
    }

    // Send confirmation email to the user
    const confirmationEmailOptions = {
      from: `KYNEX Support <${supportEmail}>`,
      to: email,
      subject: `Thanks for contacting KYNEX.dev - We've received your message`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1f2937; margin-bottom: 10px;">Thank You for Contacting Us!</h1>
              <div style="width: 50px; height: 3px; background-color: #10b981; margin: 0 auto;"></div>
            </div>

            <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              We've received your message about "<strong>${subject}</strong>" and wanted to confirm it reached us successfully.
            </p>

            <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 25px 0;">
              <p style="color: #065f46; margin: 0; font-weight: 500;">✅ Message Status: Received</p>
              <p style="color: #047857; margin: 10px 0 0 0; font-size: 14px;">Priority Level: ${priorityLabel}</p>
            </div>

            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Our support team will review your message and respond within <strong>24 hours</strong> during business hours (Monday-Friday, 9 AM - 6 PM EST).
            </p>

            ${priority === 'high' ? `
              <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 20px 0;">
                <p style="color: #dc2626; margin: 0; font-size: 14px;">
                  🔴 <strong>High Priority:</strong> We'll prioritize your request and aim to respond within 4 hours during business hours.
                </p>
              </div>
            ` : ''}

            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
                <h3 style="color: #374151; margin: 0 0 15px 0;">Need immediate assistance?</h3>
                <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px;">
                  For urgent technical issues, you can also reach us at:
                </p>
                <p style="color: #3b82f6; margin: 0; font-weight: 500;">
                  <a href="mailto:support@kynex.dev" style="color: #3b82f6; text-decoration: none;">support@kynex.dev</a>
                </p>
              </div>
            </div>

            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Thank you for choosing KYNEX.dev!
            </p>

            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Best regards,<br>
              <strong>The KYNEX Support Team</strong>
            </p>

            <div style="text-align: center; padding-top: 25px; border-top: 1px solid #e5e7eb; margin-top: 30px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                This is an automated confirmation email. Please do not reply to this message.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
Hi ${name},

Thank you for contacting KYNEX.dev!

We've received your message about "${subject}" and wanted to confirm it reached us successfully.

✅ Message Status: Received
Priority Level: ${priorityLabel}

Our support team will review your message and respond within 24 hours during business hours (Monday-Friday, 9 AM - 6 PM EST).

${priority === 'high' ? '🔴 High Priority: We\'ll prioritize your request and aim to respond within 4 hours during business hours.' : ''}

Need immediate assistance?
For urgent technical issues, you can also reach us at: support@kynex.dev

Thank you for choosing KYNEX.dev!

Best regards,
The KYNEX Support Team

---
This is an automated confirmation email.
      `
    };

    // Send confirmation email (don't fail if this fails)
    try {
      await resend.emails.send(confirmationEmailOptions);
    } catch (confirmationError) {
      console.warn('Failed to send confirmation email:', confirmationError);
      // Continue - the main email was sent successfully
    }

    console.log('Contact form submission successful:', {
      name,
      email,
      subject,
      priority,
      hasAttachment: !!attachment,
      emailId: emailResponse.data?.id
    });

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully! We\'ll get back to you soon.',
      emailId: emailResponse.data?.id
    });

  } catch (error) {
    console.error('Contact form API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error. Please try again later.' 
      },
      { status: 500 }
    );
  }
}
