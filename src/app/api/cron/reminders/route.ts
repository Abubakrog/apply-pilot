import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getResendClient, generateReminderEmailHtml } from '@/lib/email/resend';
import { isResendConfigured, isSupabaseConfigured } from '@/lib/supabase/env';
import { formatDate } from '@/lib/utils';

export async function GET(req: NextRequest) {
  // Support GET or POST for flexible cron triggers
  return handleReminderCron(req);
}

export async function POST(req: NextRequest) {
  return handleReminderCron(req);
}

async function handleReminderCron(req: NextRequest) {
  try {
    // 1. Cron Authentication check
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized: Invalid cron secret' }, { status: 401 });
    }

    if (!isResendConfigured()) {
      return NextResponse.json(
        {
          error: 'Resend API key is not configured. Reminders cannot be delivered.',
          unconfigured: true,
        },
        { status: 503 }
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          error: 'Supabase credentials are not configured. Reminders require database connectivity.',
          unconfigured: true,
        },
        { status: 503 }
      );
    }

    const adminClient = createAdminClient();
    if (!adminClient) {
      return NextResponse.json(
        { error: 'Supabase service role client could not be initialized' },
        { status: 500 }
      );
    }

    const resend = getResendClient();
    if (!resend) {
      return NextResponse.json({ error: 'Resend client unavailable' }, { status: 500 });
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'ApplyPilot <onboarding@resend.dev>';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // 2. Fetch all users with enabled reminder preferences
    const { data: preferences, error: prefError } = await adminClient
      .from('reminder_preferences')
      .select('user_id, reminder_intervals, timezone, enabled')
      .eq('enabled', true);

    if (prefError) {
      throw new Error(`Failed to query reminder preferences: ${prefError.message}`);
    }

    if (!preferences || preferences.length === 0) {
      return NextResponse.json({ message: 'No active reminder preferences found', processed: 0 });
    }

    let totalProcessed = 0;
    let totalSent = 0;
    let totalSkipped = 0;
    let totalFailed = 0;
    const errors: string[] = [];

    const now = new Date();

    // 3. Process each user's opportunities
    for (const pref of preferences) {
      const userId = pref.user_id;
      const intervals = pref.reminder_intervals || [7, 3, 1, 0];

      // Fetch user profile for name and email
      const { data: userProfile } = await adminClient
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      if (!userProfile?.email) continue;

      // Fetch opportunities with upcoming deadlines that are not closed/withdrawn/applied
      const { data: opportunities, error: oppError } = await adminClient
        .from('opportunities')
        .select('id, title, organisation, category, deadline, url, status')
        .eq('user_id', userId)
        .not('deadline', 'is', null)
        .not('status', 'in', '("Applied","Accepted","Rejected","Withdrawn")');

      if (oppError || !opportunities) continue;

      for (const opp of opportunities) {
        totalProcessed++;
        if (!opp.deadline) continue;

        const deadlineDate = new Date(opp.deadline);
        const diffMs = deadlineDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        // Skip if already passed
        if (diffDays < 0) {
          totalSkipped++;
          continue;
        }

        // Check if today matches any configured interval
        if (!intervals.includes(diffDays)) {
          totalSkipped++;
          continue;
        }

        const dateSlug = deadlineDate.toISOString().split('T')[0];
        const idempotencyKey = `rem_${userId}_${opp.id}_${diffDays}d_${dateSlug}`;

        // 4. Check idempotency log in database
        const { data: existingLog } = await adminClient
          .from('reminder_logs')
          .select('id, delivery_status')
          .eq('idempotency_key', idempotencyKey)
          .single();

        if (existingLog && ['sent', 'pending'].includes(existingLog.delivery_status)) {
          totalSkipped++;
          continue;
        }

        // 5. Send email via Resend
        const emailHtml = generateReminderEmailHtml({
          toEmail: userProfile.email,
          recipientName: userProfile.full_name || 'there',
          opportunityTitle: opp.title,
          organisation: opp.organisation,
          category: opp.category,
          deadlineDate: formatDate(opp.deadline),
          daysRemaining: diffDays,
          opportunityUrl: opp.url,
          appUrl,
        });

        const subject =
          diffDays === 0
            ? `⚠️ [Urgent] Deadline TODAY: ${opp.title} (${opp.organisation})`
            : diffDays === 1
            ? `⏳ [1 Day Left] Deadline Tomorrow: ${opp.title} (${opp.organisation})`
            : `Reminder: ${opp.title} deadline in ${diffDays} days`;

        try {
          const resendResult = await resend.emails.send({
            from: fromEmail,
            to: userProfile.email,
            subject,
            html: emailHtml,
          });

          if (resendResult.error) {
            throw new Error(resendResult.error.message);
          }

          // Record successful delivery log
          await adminClient.from('reminder_logs').upsert({
            user_id: userId,
            opportunity_id: opp.id,
            scheduled_for: now.toISOString(),
            reminder_type: `${diffDays}_days`,
            sent_at: now.toISOString(),
            delivery_status: 'sent',
            idempotency_key: idempotencyKey,
            error_message: null,
          });

          totalSent++;
        } catch (sendErr: unknown) {
          const err = sendErr as Error;
          totalFailed++;
          errors.push(err.message);

          // Record failure in reminder_logs
          await adminClient.from('reminder_logs').upsert({
            user_id: userId,
            opportunity_id: opp.id,
            scheduled_for: now.toISOString(),
            reminder_type: `${diffDays}_days`,
            sent_at: null,
            delivery_status: 'failed',
            idempotency_key: idempotencyKey,
            error_message: err.message,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalProcessed,
        totalSent,
        totalSkipped,
        totalFailed,
      },
      errors: errors.slice(0, 5),
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Reminder cron error:', err);
    return NextResponse.json({ error: err.message || 'Internal cron error' }, { status: 500 });
  }
}
