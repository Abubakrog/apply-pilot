'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { success, error } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    if (!isSupabaseConfigured()) {
      setSent(true);
      success('Reset instructions ready');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/dashboard`,
      });

      if (resetError) throw resetError;

      setSent(true);
      success('Reset email sent');
    } catch (err: unknown) {
      const e = err as Error;
      setAuthError(e.message || 'Failed to send password reset email');
      error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-slate-50 dark:bg-slate-950 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="h-7 w-7 rounded bg-slate-900 dark:bg-slate-50 flex items-center justify-center text-white dark:text-slate-950 text-xs font-semibold">
              AP
            </div>
            <span className="font-semibold text-lg text-slate-900 dark:text-slate-100">
              ApplyPilot
            </span>
          </Link>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Reset your password
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enter your email and we&apos;ll send you a recovery link.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          {authError && (
            <div className="p-3 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-800 dark:text-red-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {sent ? (
            <div className="text-center space-y-3 py-2">
              <div className="mx-auto h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
                <CheckCircle className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Recovery email sent
              </h3>
              <p className="text-[11px] text-slate-500">
                If an account exists for <strong>{email}</strong>, check your inbox for instructions to reset your password.
              </p>
              <div className="pt-2">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Return to sign in
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="alex@stanford.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <Button type="submit" loading={loading} className="w-full text-xs h-9">
                Send reset link
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-slate-500">
          <Link
            href="/login"
            className="font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 flex items-center justify-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
