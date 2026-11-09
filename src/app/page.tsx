'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Link as LinkIcon, PenLine, Mail, Columns, IdCard, Lock } from 'lucide-react';
import { CategoryBadge } from '@/components/opportunities/category-badge';
import { StatusBadge } from '@/components/opportunities/status-badge';
import { ClosingBoard, type BoardRow } from '@/components/deadlines/closing-board';
import { FlapCounter } from '@/components/deadlines/flap-counter';

const sampleBoard: BoardRow[] = [
  { id: 'hackmit', title: 'HackMIT 2026 hacker application', organisation: 'MIT TechX', category: 'Hackathon', status: 'Applied', deadlineLabel: '11 Nov 2026', daysLeft: 2 },
  { id: 'kp', title: 'Software engineering fellow', organisation: 'KP Fellows', category: 'Fellowship', status: 'Preparing', deadlineLabel: '14 Nov 2026', daysLeft: 5 },
  { id: 'cf', title: 'Systems and infrastructure intern', organisation: 'Cloudflare', category: 'Internship', status: 'Interested', deadlineLabel: '21 Nov 2026', daysLeft: 12 },
  { id: 'merit', title: 'Undergraduate merit scholarship', organisation: 'State University Foundation', category: 'Scholarship', status: 'Interested', deadlineLabel: '28 Nov 2026', daysLeft: 19 },
];

const steps = [
  {
    title: 'Save it from the link',
    body: 'Paste the posting URL. ApplyPilot pulls out the title, organisation, required documents and closing date, and you check them before saving.',
  },
  {
    title: 'Prepare from your profile',
    body: 'Your profile holds your projects, coursework and awards. Drafts for answers and recruiter emails are written from that, and you edit them.',
  },
  {
    title: 'Get reminded before it closes',
    body: 'Emails arrive 7, 3 and 1 day before the deadline and on the day itself. Track the status until you hear back.',
  },
];

const features = [
  { icon: LinkIcon, title: 'Postings from a link', body: 'Title, organisation, documents and deadline extracted from the page, without running its scripts.' },
  { icon: PenLine, title: 'Drafts from your own profile', body: 'Outreach emails, follow-ups and application answers built from the skills and projects you saved.' },
  { icon: Mail, title: 'Reminders that stop on time', body: 'Each reminder is sent once, and none are sent after you mark an opportunity as applied.' },
  { icon: Columns, title: 'Table or board', body: 'Sort everything in a dense table, or move cards across a board as applications progress.' },
  { icon: IdCard, title: 'One profile, reused', body: 'Skills, achievements, course projects and preferences kept in one place for every draft.' },
  { icon: Lock, title: 'Only you can see it', body: 'Row-level security in the database limits your opportunities, drafts and profile to your account.' },
];

const faqs = [
  {
    q: 'Does ApplyPilot submit applications or send emails for me?',
    a: 'No. It drafts text for you to review and edit. Submitting applications and sending emails stays with you.',
  },
  {
    q: 'How does the writing assistant know my background?',
    a: 'You save your projects, experience, graduation year and skills once in your profile. Each draft is written from that profile and the opportunity you are applying to.',
  },
  {
    q: 'When do reminder emails arrive?',
    a: 'By default 7 days, 3 days and 1 day before a deadline, and on the day. You can change the intervals in settings. Each email links straight to the opportunity.',
  },
  {
    q: 'Can other people see my applications or profile?',
    a: 'No. Every table is protected by row-level security, so your opportunities, drafts and profile are only readable by your own account.',
  },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="h-6 w-6 rounded-md bg-slate-900 flex items-center justify-center text-white text-[11px] font-semibold">
        AP
      </span>
      <span className="text-sm font-semibold text-slate-900">ApplyPilot</span>
    </Link>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 antialiased">
      {/* Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-900/8 bg-white/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Logo />

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How it works</a>
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#preview" className="hover:text-slate-900 transition-colors">Dashboard</a>
            <a href="#faq" className="hover:text-slate-900 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Sign in
            </Link>
            <Link href="/signup">
              <Button size="sm">Create account</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-slate-900/8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <h1 className="text-4xl sm:text-5xl font-medium tracking-tight leading-[1.06] text-slate-950">
              Every application deadline, counted down in one place
            </h1>
            <p className="mt-5 text-lg leading-7 text-slate-600 max-w-md">
              Save internships, scholarships, fellowships and hackathons from a link. ApplyPilot tracks each
              closing date, reminds you by email and drafts answers from the profile you saved.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto h-11 px-5">
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-11 px-5">
                  See how it works
                </Button>
              </a>
            </div>
          </div>

          {/* The moment: a departures board of deadlines */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-900/10 bg-slate-50 p-2 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
              <div className="rounded-xl border border-slate-900/8 bg-white px-5 pt-4 pb-2">
                <div className="flex items-baseline justify-between pb-4">
                  <h2 className="text-sm font-medium text-slate-900">Closing soon</h2>
                  <span className="font-mono text-xs tabular-nums text-slate-500">Mon 9 Nov 2026</span>
                </div>
                <ClosingBoard rows={sampleBoard} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard preview */}
      <section id="preview" className="py-16 sm:py-24 border-b border-slate-900/8 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-xl mb-10">
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-slate-900">
              Status, deadline and next step for every application
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              The dashboard keeps what you have applied to apart from what still needs work.
            </p>
          </div>

          <div className="rounded-xl border border-slate-900/10 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="h-10 border-b border-slate-900/8 bg-slate-50 px-4 flex items-center">
              <span className="font-mono text-[11px] text-slate-500">app.applypilot.dev/dashboard</span>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  ['Saved', '5'],
                  ['Applied', '2'],
                  ['Closing this week', '2'],
                  ['Follow-up due', '1'],
                ].map(([label, value]) => (
                  <div key={label} className="p-4 rounded-lg border border-slate-900/8">
                    <span className="text-xs text-slate-500">{label}</span>
                    <p className="mt-1 text-2xl font-medium font-mono tabular-nums text-slate-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-slate-900/8 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-900/8 text-xs text-slate-500">
                    <tr>
                      <th className="h-9 px-4 font-normal">Opportunity</th>
                      <th className="h-9 px-4 font-normal">Category</th>
                      <th className="h-9 px-4 font-normal">Status</th>
                      <th className="h-9 px-4 font-normal text-right">Days left</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/6">
                    {sampleBoard.slice(0, 3).map((row) => (
                      <tr key={row.id}>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-900 block">{row.title}</span>
                          <span className="text-slate-500 text-xs">{row.organisation}</span>
                        </td>
                        <td className="py-3 px-4"><CategoryBadge category={row.category} /></td>
                        <td className="py-3 px-4"><StatusBadge status={row.status} /></td>
                        <td className="py-3 px-4 text-right"><FlapCounter daysLeft={row.daysLeft} size="sm" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 sm:py-24 border-b border-slate-900/8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-slate-900 max-w-xl">
            Save, prepare, apply before it closes
          </h2>
          <ol className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((s, i) => (
              <li key={s.title} className="border-t border-slate-900/10 pt-5">
                <span className="font-mono text-sm tabular-nums text-blue-600">0{i + 1}</span>
                <h3 className="mt-2 text-base font-medium text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 sm:py-24 border-b border-slate-900/8 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-slate-900 max-w-xl">
            Built for a season of applications
          </h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
            {features.map(({ icon: Icon, title, body }) => (
              <div key={title}>
                <Icon className="h-5 w-5 text-slate-500" />
                <h3 className="mt-3 text-sm font-medium text-slate-900">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 sm:py-24 border-b border-slate-900/8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-medium tracking-tight text-slate-900">Questions</h2>
          <dl className="mt-8 divide-y divide-slate-900/8 border-y border-slate-900/8">
            {faqs.map((f) => (
              <div key={f.q} className="py-5">
                <dt className="text-sm font-medium text-slate-900">{f.q}</dt>
                <dd className="mt-2 text-sm leading-6 text-slate-600">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <Logo />
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-slate-900 transition-colors">Sign in</Link>
            <Link href="/signup" className="hover:text-slate-900 transition-colors">Create account</Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
