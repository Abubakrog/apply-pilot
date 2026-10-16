'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { useApp } from '@/lib/store/app-context';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Sparkles, Mail, Lock, User, GraduationCap, AlertCircle, CheckCircle } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const { enterDemoMode } = useApp();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [university, setUniversity] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const isSupabaseReady = isSupabaseConfigured();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);

    if (!isSupabaseReady) {
      enterDemoMode();
      success('Created local demo account!');
      router.push('/dashboard');
      return;
    }

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            university: university.trim(),
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.session) {
        success('Account created successfully!');
        router.push('/dashboard');
      } else {
        setConfirmationSent(true);
        success('Registration successful! Please check your email to verify your account.');
      }
    } catch (err: unknown) {
      const e = err as Error;
      setAuthError(e.message || 'Failed to sign up');
      error(e.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    enterDemoMode();
    success('Logged into demo account!');
    router.push('/dashboard');
  };

  if (confirmationSent) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-slate-50 dark:bg-slate-950 py-12">
        <div className="w-full max-w-sm space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 mb-2">
            <CheckCircle className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Check Your Email
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            We sent a verification link to <strong>{email}</strong>. Once confirmed, you can sign in to your ApplyPilot dashboard.
          </p>
          <div className="pt-2">
            <Link href="/login">
              <Button size="sm" variant="outline" className="w-full text-xs">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-slate-50 dark:bg-slate-950 py-12">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="h-7 w-7 rounded bg-slate-900 dark:bg-slate-50 flex items-center justify-center text-white dark:text-slate-950 text-xs font-bold tracking-wider">
              AP
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-slate-100">
              Apply<span className="text-blue-600">Pilot</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Create your free account
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organise opportunities, deadlines, and tailored application drafts.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          {authError && (
            <div className="p-3 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-800 dark:text-red-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Alex Rivera"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                College or University
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Stanford University"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email Address
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

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Minimum 6 characters.</p>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full text-xs h-9 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 mt-1"
            >
              Create Account
            </Button>
          </form>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white px-2 text-slate-400 dark:bg-slate-900">
                Or explore instantly
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleDemoAccess}
            className="w-full text-xs h-9 gap-1.5 text-slate-700 dark:text-slate-300"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            Launch Instant Demo
          </Button>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
