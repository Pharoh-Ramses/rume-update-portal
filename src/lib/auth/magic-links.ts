import { createId } from '@paralleldrive/cuid2';
import { createMagicLink } from '@/lib/db/queries';

export interface MagicLinkData {
  patientId: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export async function generateMagicLink(patientData: MagicLinkData): Promise<{
  token: string;
  url: string;
  expiresAt: Date;
}> {
  const token = createId();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
  
  // Store magic link in database
  await createMagicLink({
    token,
    patientId: patientData.patientId,
    expiresAt,
    used: false,
  });

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const url = `${baseUrl}/auth/magic?token=${token}`;

  return {
    token,
    url,
    expiresAt,
  };
}

export function createMagicLinkEmail(
  patientData: MagicLinkData,
  magicLinkUrl: string,
  expiresAt: Date
): {
  subject: string;
  html: string;
  text: string;
} {
  const patientName = patientData.firstName && patientData.lastName 
    ? `${patientData.firstName} ${patientData.lastName}`
    : patientData.email;

  const expirationTime = expiresAt.toLocaleString();

  const subject = 'Update Your Insurance Information or Pay for Services';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .button { 
          display: inline-block; 
          background-color: #007bff; 
          color: white; 
          padding: 12px 24px; 
          text-decoration: none; 
          border-radius: 6px; 
          margin: 20px 0;
        }
        .footer { font-size: 12px; color: #666; margin-top: 30px; }
        .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Insurance Update Required</h1>
        </div>
        
        <p>Dear ${patientName},</p>
        
        <p>We need your help to resolve a billing issue with your recent medical services. Your insurance company has not processed payment for one or more services, and we need you to either:</p>
        
        <ul>
          <li><strong>Update your insurance information</strong> if it has changed</li>
          <li><strong>Pay for the services yourself</strong> at a significantly discounted rate</li>
        </ul>
        
        <p>Click the button below to securely access your account and choose the best option for you:</p>
        
        <a href="${magicLinkUrl}" class="button">Access Your Account</a>
        
        <div class="warning">
          <strong>Important:</strong> This link will expire on ${expirationTime} and can only be used once. If you need a new link, please contact our billing department.
        </div>
        
        <p>If you have any questions, please don't hesitate to contact us.</p>
        
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>If you cannot click the link above, copy and paste this URL into your browser:<br>
          ${magicLinkUrl}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Dear ${patientName},

We need your help to resolve a billing issue with your recent medical services. Your insurance company has not processed payment for one or more services.

Please visit the following link to either update your insurance information or pay for services at a discounted rate:

${magicLinkUrl}

This link will expire on ${expirationTime} and can only be used once.

If you have any questions, please contact our billing department.

---
This is an automated message. Please do not reply to this email.
  `;

  return { subject, html, text };
}

export async function sendMagicLinkEmail(
  patientData: MagicLinkData,
  magicLinkUrl: string,
  expiresAt: Date
): Promise<boolean> {
  // This would integrate with your email service (SendGrid, AWS SES, etc.)
  // For now, we'll just log the email content
  
  const emailContent = createMagicLinkEmail(patientData, magicLinkUrl, expiresAt);
  
  console.log('📧 Magic Link Email Generated:');
  console.log('To:', patientData.email);
  console.log('Subject:', emailContent.subject);
  console.log('Magic Link URL:', magicLinkUrl);
  console.log('Expires:', expiresAt.toISOString());
  
  // TODO: Implement actual email sending
  // Example with a hypothetical email service:
  /*
  try {
    await emailService.send({
      to: patientData.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });
    return true;
  } catch (error) {
    console.error('Failed to send magic link email:', error);
    return false;
  }
  */
  
  return true; // Return true for development
}