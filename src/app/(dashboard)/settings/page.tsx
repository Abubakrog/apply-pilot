'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/navigation/header';
import { useApp } from '@/lib/store/app-context';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { DataService } from '@/lib/store/data-service';
import {
  Bell,
  Mail,
  Shield,
  Key,
  Globe,
  Clock,
  Send,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';

const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
];

export default function SettingsPage() {
  const { user, profile, isSupabaseReady, resetToSeedData, signOut } = useApp();
  const { success, error, info } = useToast();

  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [intervals, setIntervals] = useState<number[]>([7, 3, 1, 0]);
  const [timezone, setTimezone] = useState('America/Los_Angeles');
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  // Test Reminder Email state
  const [testEmail, setTestEmail] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    async function loadPrefs() {
      if (user?.id) {
        try {
          const prefs = await DataService.getReminderPreferences(user.id);
          setRemindersEnabled(prefs.enabled);
          setIntervals(prefs.reminder_intervals || [7, 3, 1, 0]);
          setTimezone(prefs.timezone || profile?.timezone || 'America/Los_Angeles');
        } catch (e) {
          console.error(e);
        }
      }
      if (user?.email) {
        setTestEmail(user.email);
      }
    }
    loadPrefs();
  }, [user, profile]);

  const toggleInterval = (day: number) => {
    if (intervals.includes(day)) {
      if (intervals.length === 1) {
        error('At least one reminder interval must remain selected');
        return;
      }
      setIntervals(intervals.filter((i) => i !== day));
    } else {
      setIntervals([...intervals, day].sort((a, b) => b - a));
    }
  };

  const handleSaveReminderSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingPrefs(true);

    try {
      await DataService.updateReminderPreferences(user.id, {
        enabled: remindersEnabled,
        reminder_intervals: intervals,
        timezone,
      });
      success('Reminder preferences saved successfully');
    } catch {
      error('Failed to save reminder preferences');
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail.trim()) {
      error('Please enter an email address to receive the test reminder');
      return;
    }

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/reminders/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: testEmail.trim(),
          recipientName: user?.name || profile?.full_name || 'Applicant',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.unconfigured) {
          throw new Error(
            'RESEND_API_KEY is not configured in .env.local. Add your key from resend.com to test email delivery.'
          );
        }
        throw new Error(data.error || 'Failed to dispatch email');
      }

      setTestResult(data.message || 'Test email sent');
      success(`Email sent to ${testEmail}! Check your inbox.`);
    } catch (err: unknown) {
      const e = err as Error;
      error(e.message);
      setTestResult(`Error: ${e.message}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Settings & Alerts"
        description="Manage deadline notification schedules, email delivery preferences, and integrations."
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto space-y-6">
        {/* Section 1: Email Deadline Reminders */}
        <form onSubmit={handleSaveReminderSettings}>
          <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Bell className="h-4 w-4 text-blue-600" />
                  Automated deadline reminders
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Scheduled notifications delivered to your inbox before opportunity deadlines close.
                </p>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={remindersEnabled}
                  onChange={(e) => setRemindersEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition peer-checked:bg-blue-600" />
              </label>
            </div>

            {/* Reminder Intervals */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Reminder schedules
              </label>
              <p className="text-[11px] text-slate-400 mb-2">
                Choose when you want reminder alerts sent relative to the opportunity deadline.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { days: 7, label: '7 days before' },
                  { days: 3, label: '3 days before' },
                  { days: 1, label: '1 day before' },
                  { days: 0, label: 'Day of deadline' },
                ].map(({ days, label }) => {
                  const isChecked = intervals.includes(days);
                  return (
                    <label
                      key={days}
                      className={`flex items-center gap-2 p-3 rounded-md border text-xs cursor-pointer select-none transition-colors ${
                        isChecked
                          ? 'border-blue-600 bg-blue-50/50 text-blue-900 dark:border-blue-500 dark:bg-blue-950/30 dark:text-blue-100 font-medium'
                          : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleInterval(days)}
                        disabled={!remindersEnabled}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* User Timezone */}
            <div className="pt-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Preferred timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                disabled={!remindersEnabled}
                className="w-full sm:max-w-xs px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Ensures reminders are sent at your preferred local morning hour.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button type="submit" loading={isSavingPrefs} size="sm" className="text-xs">
                Save reminder preferences
              </Button>
            </div>
          </div>
        </form>

        {/* Section 2: Interactive Resend Delivery Test */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-emerald-600" />
              Test Email Delivery (Resend Integration)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Dispatch a real test reminder to verify your Resend API key and template rendering.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 max-w-lg">
            <input
              type="email"
              placeholder="your.email@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
            <Button
              type="button"
              onClick={handleSendTestEmail}
              loading={isSendingTest}
              size="sm"
              variant="outline"
              className="text-xs gap-1.5 shrink-0"
            >
              <Send className="h-4 w-4" />
              Send test email
            </Button>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-md text-xs border ${
                testResult.startsWith('Error')
                  ? 'border-red-200 bg-red-50 text-red-800 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300'
              }`}
            >
              {testResult}
            </div>
          )}
        </div>

        {/* Section 3: Integrations & API Key Diagnostics */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Key className="h-4 w-4 text-slate-500" />
            Integration diagnostics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Supabase status */}
            <div className="p-3 rounded-md border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Supabase
                </span>
                <span
                  className={`h-2 w-2 rounded-full ${
                    isSupabaseReady ? 'bg-emerald-500' : 'bg-amber-400'
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                {isSupabaseReady
                  ? 'Connected with PostgreSQL RLS'
                  : 'Running in Local Store Mode'}
              </p>
            </div>

            {/* Gemini API status */}
            <div className="p-3 rounded-md border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Gemini API (3.8 Flash)
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                URL extraction & tailored AI drafting
              </p>
            </div>

            {/* Resend status */}
            <div className="p-3 rounded-md border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Resend
                </span>
                <span className="h-2 w-2 rounded-full bg-blue-500" />
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Transactional reminder delivery
              </p>
            </div>
          </div>

          <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1 leading-relaxed">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
              Automated Cron Scheduling:
            </span>
            <p>
              To run automated daily deadline checks in production, point your Supabase Cron or Vercel Cron to:
              <code className="mx-1 px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono">
                GET /api/cron/reminders
              </code>
              with header
              <code className="mx-1 px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono">
                Authorization: Bearer &lt;CRON_SECRET&gt;
              </code>.
            </p>
          </div>
        </div>

        {/* Section 4: Demo Data & Account Reset */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">
            Account and demo options
          </h2>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                Reset demo opportunities
              </p>
              <p className="text-[11px] text-slate-500">
                Reload the initial 5 opportunities (KP Fellows, Cloudflare, HackMIT, etc.)
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetToSeedData();
                success('Demo opportunities reloaded');
              }}
              className="text-xs gap-1.5"
            >
              <RotateCcw className="h-4 w-4" />
              Reset demo data
            </Button>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <span className="text-xs text-slate-500">
              Signed in as: <strong>{user?.email || 'Demo User'}</strong>
            </span>
            <Button variant="ghost" size="sm" onClick={() => signOut()} className="text-xs text-red-600 hover:text-red-700">
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
