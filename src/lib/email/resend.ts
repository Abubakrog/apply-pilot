import { Resend } from 'resend';
import { isResendConfigured } from '@/lib/supabase/env';

export function getResendClient(): Resend | null {
  if (!isResendConfigured()) {
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY!);
}

export interface SendReminderEmailParams {
  toEmail: string;
  recipientName: string;
  opportunityTitle: string;
  organisation: string;
  category: string;
  deadlineDate: string;
  daysRemaining: number;
  opportunityUrl?: string | null;
  appUrl?: string;
}

export function generateReminderEmailHtml(params: SendReminderEmailParams): string {
  const urgencyColor =
    params.daysRemaining <= 1
      ? '#dc2626'
      : params.daysRemaining <= 3
      ? '#ea580c'
      : '#2563eb';

  const urgencyText =
    params.daysRemaining === 0
      ? 'Deadline is TODAY!'
      : params.daysRemaining === 1
      ? 'Deadline is TOMORROW (1 day left)'
      : `${params.daysRemaining} days remaining`;

  const dashboardLink = params.appUrl
    ? `${params.appUrl}/opportunities`
    : 'https://applypilot.vercel.app/opportunities';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Application Deadline Reminder</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 32px 16px; color: #0f172a;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);">
    <div style="display: flex; align-items: center; margin-bottom: 24px;">
      <span style="font-weight: 700; font-size: 18px; color: #0f172a; letter-spacing: -0.02em;">Apply<span style="color: #2563eb;">Pilot</span></span>
    </div>

    <div style="display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; background-color: ${urgencyColor}15; color: ${urgencyColor}; margin-bottom: 16px;">
      ${urgencyText}
    </div>

    <h1 style="font-size: 22px; font-weight: 600; line-height: 1.3; margin: 0 0 8px 0; color: #0f172a;">
      Upcoming Deadline for ${params.opportunityTitle}
    </h1>
    
    <p style="font-size: 15px; color: #475569; margin: 0 0 24px 0;">
      Hi ${params.recipientName || 'there'}, your saved <strong>${params.category}</strong> opportunity with <strong>${params.organisation}</strong> is due soon.
    </p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="color: #64748b; padding: 4px 0; width: 120px;">Organisation:</td>
          <td style="font-weight: 500; color: #0f172a; padding: 4px 0;">${params.organisation}</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 4px 0;">Deadline:</td>
          <td style="font-weight: 600; color: ${urgencyColor}; padding: 4px 0;">${params.deadlineDate}</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 4px 0;">Category:</td>
          <td style="font-weight: 500; color: #0f172a; padding: 4px 0;">${params.category}</td>
        </tr>
      </table>
    </div>

    <div style="margin-bottom: 32px;">
      <a href="${dashboardLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 500; padding: 10px 20px; border-radius: 6px;">
        View in ApplyPilot
      </a>
      ${
        params.opportunityUrl
          ? `<a href="${params.opportunityUrl}" style="display: inline-block; margin-left: 12px; color: #475569; text-decoration: underline; font-size: 14px;">Original Posting →</a>`
          : ''
      }
    </div>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

    <p style="font-size: 12px; color: #94a3b8; margin: 0; line-height: 1.5;">
      You received this email because you enabled deadline reminders in ApplyPilot.<br />
      To manage reminder intervals or time zones, visit your ApplyPilot Settings.
    </p>
  </div>
</body>
</html>
  `.trim();
}
