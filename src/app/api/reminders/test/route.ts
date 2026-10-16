import { NextRequest, NextResponse } from 'next/server';
import { getResendClient, generateReminderEmailHtml } from '@/lib/email/resend';
import { isResendConfigured } from '@/lib/supabase/env';
import { formatDate } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { toEmail, recipientName } = body;

    if (!toEmail || typeof toEmail !== 'string') {
      return NextResponse.json({ error: 'Recipient email is required' }, { status: 400 });
    }

    if (!isResendConfigured()) {
      return NextResponse.json(
        {
          error:
            'Resend API key is not configured in .env.local. Please add RESEND_API_KEY to test email delivery.',
          unconfigured: true,
        },
        { status: 503 }
      );
    }

    const resend = getResendClient();
    if (!resend) {
      return NextResponse.json(
        { error: 'Failed to initialize Resend client' },
        { status: 500 }
      );
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'ApplyPilot <onboarding@resend.dev>';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const testHtml = generateReminderEmailHtml({
      toEmail,
      recipientName: recipientName || 'Fellow Applicant',
      opportunityTitle: 'Sample Tech Fellowship (Test)',
      organisation: 'ApplyPilot System Test',
      category: 'Fellowship',
      deadlineDate: formatDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString()),
      daysRemaining: 3,
      opportunityUrl: 'https://example.com',
      appUrl,
    });

    const result = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: '✅ [ApplyPilot Test] Your Deadline Reminder Flow is Connected!',
      html: testHtml,
    });

    if (result.error) {
      return NextResponse.json(
        {
          error: `Resend API error: ${result.error.message}`,
          details: result.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Test email successfully sent to ${toEmail}! Message ID: ${result.data?.id}`,
      id: result.data?.id,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Test reminder error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to dispatch test reminder' },
      { status: 500 }
    );
  }
}
