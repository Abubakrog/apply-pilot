'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  ArrowRight,
  Clock,
  Briefcase,
  Mail,
  CheckCircle2,
  Shield,
  Columns,
  Link as LinkIcon,
  UserCheck,
  ChevronDown,
} from 'lucide-react';
import { CategoryBadge } from '@/components/opportunities/category-badge';
import { StatusBadge } from '@/components/opportunities/status-badge';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-slate-900 flex items-center justify-center text-white text-xs font-bold tracking-wider">
              AP
            </div>
            <span className="font-semibold text-sm tracking-tight text-slate-900">
              Apply<span className="text-blue-600">Pilot</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-slate-900 transition-colors">
              Features
            </a>
            <a href="#preview" className="hover:text-slate-900 transition-colors">
              Dashboard
            </a>
            <a href="#faq" className="hover:text-slate-900 transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Sign In
            </Link>
            <Link href="/signup">
              <Button size="sm" className="text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 sm:pt-28 sm:pb-24 border-b border-slate-100 bg-linear-to-b from-slate-50/50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-white text-slate-700 text-xs font-medium shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            <span>ApplyPilot 1.0 — Free for Students</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-950 leading-[1.15] max-w-3xl mx-auto">
            Stop missing opportunities. Start applying smarter.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Keep internships, scholarships, and hackathons organised. Track every deadline, create personalised applications, and get reminders before it&apos;s too late.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-sm h-10 px-6 bg-slate-900 hover:bg-slate-800 text-white gap-2 shadow-sm">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm h-10 px-6 text-slate-700 hover:text-slate-900 border-slate-200">
                See How It Works
              </Button>
            </a>
          </div>

          <div className="pt-4 flex items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /> Free to use
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /> SSRF-protected URL parser
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /> Resend email reminders
            </span>
          </div>
        </div>
      </section>

      {/* Realistic Dashboard Preview Section */}
      <section id="preview" className="py-16 sm:py-20 border-b border-slate-200/80 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              A productivity system built for high-stakes deadlines
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Clear statuses, real deadline urgency badges, and quick AI drafting right where you need it.
            </p>
          </div>

          {/* Interactive/Realistic Mockup Window */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
            {/* Window chrome header */}
            <div className="h-10 border-b border-slate-200 bg-slate-50 px-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              </div>
              <span className="text-[11px] font-mono text-slate-400">app.applypilot.dev/dashboard</span>
              <div className="w-12" />
            </div>

            {/* Dashboard Mockup Content */}
            <div className="p-6 space-y-6">
              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-lg border border-slate-200 bg-white">
                  <span className="text-[11px] text-slate-500 font-medium">Opportunities Saved</span>
                  <p className="text-xl font-bold font-mono text-slate-900 mt-1">5</p>
                </div>
                <div className="p-3.5 rounded-lg border border-slate-200 bg-white">
                  <span className="text-[11px] text-slate-500 font-medium">Applications Submitted</span>
                  <p className="text-xl font-bold font-mono text-blue-600 mt-1">2</p>
                </div>
                <div className="p-3.5 rounded-lg border border-slate-200 bg-white">
                  <span className="text-[11px] text-slate-500 font-medium">Upcoming Deadlines</span>
                  <p className="text-xl font-bold font-mono text-amber-500 mt-1">2</p>
                </div>
                <div className="p-3.5 rounded-lg border border-slate-200 bg-white">
                  <span className="text-[11px] text-slate-500 font-medium">Awaiting Follow-Up</span>
                  <p className="text-xl font-bold font-mono text-purple-600 mt-1">1</p>
                </div>
              </div>

              {/* Sample Opportunities Table */}
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="py-2.5 px-4 font-medium">Opportunity</th>
                      <th className="py-2.5 px-4 font-medium">Category</th>
                      <th className="py-2.5 px-4 font-medium">Status</th>
                      <th className="py-2.5 px-4 font-medium">Deadline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block">
                          HackMIT 2026 Hacker Application
                        </span>
                        <span className="text-slate-400 text-[11px]">MIT TechX</span>
                      </td>
                      <td className="py-3 px-4">
                        <CategoryBadge category="Hackathon" />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status="Applied" />
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-red-600 font-semibold bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[11px]">
                          2 days left
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block">
                          Software Engineering Fellow
                        </span>
                        <span className="text-slate-400 text-[11px]">Kleiner Perkins (KP Fellows)</span>
                      </td>
                      <td className="py-3 px-4">
                        <CategoryBadge category="Fellowship" />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status="Preparing" />
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-amber-600 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px]">
                          5 days left
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block">
                          Systems & Infrastructure Intern
                        </span>
                        <span className="text-slate-400 text-[11px]">Cloudflare</span>
                      </td>
                      <td className="py-3 px-4">
                        <CategoryBadge category="Internship" />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status="Interested" />
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-600 text-[11px]">12 days left</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Explanation Section */}
      <section id="how-it-works" className="py-16 sm:py-24 border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              The ApplyPilot Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Save → Prepare → Never Miss a Deadline
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Designed around how students actually apply for competitive programs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="rounded-lg border border-slate-200 p-6 bg-white space-y-3">
              <div className="h-8 w-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                01
              </div>
              <h3 className="text-base font-semibold text-slate-900">1. Save Instantly</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Paste any job posting or fellowship URL. Our server securely extracts eligibility rules, required documents, and cutoff dates into clean fields for your review.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-lg border border-slate-200 p-6 bg-white space-y-3">
              <div className="h-8 w-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                02
              </div>
              <h3 className="text-base font-semibold text-slate-900">2. Prepare with AI</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your saved Profile Vault holds your real projects, coursework, and awards. ApplyPilot uses that exact background to generate tailored answers and recruiter cold emails.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-lg border border-slate-200 p-6 bg-white space-y-3">
              <div className="h-8 w-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                03
              </div>
              <h3 className="text-base font-semibold text-slate-900">3. Never Miss Cutoffs</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Get automated transactional reminder emails via Resend at 7 days, 3 days, and 1 day before closing. Track statuses until you receive decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-16 sm:py-24 border-b border-slate-200/80 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Engineered for reliability and authentic applications
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Everything you need to stay organised across recruiting seasons.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-2">
              <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center text-slate-700 mb-3">
                <LinkIcon className="h-4 w-4 text-blue-600" />
              </div>
              <h4 className="text-sm font-semibold text-slate-900">SSRF-Protected URL Extraction</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Blocks private and loopback IPs. Extracts title, organization, documents, and deadlines without executing untrusted script tags.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-2">
              <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center text-slate-700 mb-3">
                <Sparkles className="h-4 w-4 text-blue-600" />
              </div>
              <h4 className="text-sm font-semibold text-slate-900">Grounded AI Writing Assistant</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generates recruiter outreach, follow-ups, and application answers strictly grounded in your verified technical projects and skills.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-2">
              <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center text-slate-700 mb-3">
                <Mail className="h-4 w-4 text-emerald-600" />
              </div>
              <h4 className="text-sm font-semibold text-slate-900">Database-Backed Resend Alerts</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Idempotency key enforcement ensures you never receive duplicate reminders. Skips opportunities once marked as submitted.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-2">
              <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center text-slate-700 mb-3">
                <Columns className="h-4 w-4 text-purple-600" />
              </div>
              <h4 className="text-sm font-semibold text-slate-900">Dual Table & Kanban Views</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Switch seamlessly between an information-dense sortable table and a Linear-style pipeline board.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-2">
              <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center text-slate-700 mb-3">
                <UserCheck className="h-4 w-4 text-slate-700" />
              </div>
              <h4 className="text-sm font-semibold text-slate-900">Personal Profile Vault</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Centralize your skills, achievements, course projects, and preferences in one protected place guarded by PostgreSQL RLS.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-2">
              <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center text-slate-700 mb-3">
                <Shield className="h-4 w-4 text-slate-700" />
              </div>
              <h4 className="text-sm font-semibold text-slate-900">Strict Data Isolation</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Supabase Row Level Security ensures users can only read and write their own applications, drafts, and profile data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 sm:py-24 border-b border-slate-200/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-500">
              Honest answers about ApplyPilot and how your data is handled.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 p-4 bg-white">
              <h4 className="text-xs font-semibold text-slate-900">
                Does ApplyPilot submit applications or send cold emails automatically?
              </h4>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                No. In our MVP, all drafting and sending actions are completely separate. ApplyPilot helps you generate and edit high-quality drafts, but you retain full control over reviewing, editing, and submitting everything yourself.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-4 bg-white">
              <h4 className="text-xs font-semibold text-slate-900">
                How does the AI writing assistant know my background?
              </h4>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                You save your projects, work experience, graduation year, and technical skills once in your Profile Vault. When you ask the AI to draft an email or answer, it retrieves your profile context and directly weaves your real accomplishments into the response.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-4 bg-white">
              <h4 className="text-xs font-semibold text-slate-900">
                How do deadline email reminders work?
              </h4>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                When you save an opportunity with a closing date, ApplyPilot schedules alerts according to your preferences (by default: 7 days, 3 days, and 1 day prior). Emails are sent through Resend with direct links to your tracked opportunity.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-4 bg-white">
              <h4 className="text-xs font-semibold text-slate-900">
                Can other users see my applications or profile?
              </h4>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Never. PostgreSQL Row Level Security (RLS) is strictly enforced on all tables, isolating each user&apos;s opportunities, drafts, and profile data to their authenticated Supabase user ID.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-slate-900 flex items-center justify-center text-white text-[10px] font-bold">
              AP
            </div>
            <span className="font-medium text-slate-800">ApplyPilot</span>
            <span>— Your opportunities. Organised. Never missed.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-slate-900">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-slate-900">
              Get Started
            </Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
