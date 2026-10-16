'use client';

import React from 'react';
import { Header } from '@/components/navigation/header';
import { StatsRow } from '@/components/dashboard/stats-row';
import { UpcomingDeadlines } from '@/components/dashboard/upcoming-deadlines';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { useApp } from '@/lib/store/app-context';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles, BookOpen, Clock } from 'lucide-react';
import Link from 'next/link';

interface DashboardPageProps {
  onOpenAddModal?: () => void;
  onOpenMobileNav?: () => void;
}

export default function DashboardPage({
  onOpenAddModal,
  onOpenMobileNav,
}: DashboardPageProps) {
  const { user, opportunities, loading } = useApp();

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Dashboard"
        description="Your opportunities. Organised. Never missed."
        onOpenAddModal={onOpenAddModal}
        onOpenMobileNav={onOpenMobileNav}
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Welcome greeting banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Welcome back, {user?.name || 'Applicant'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              You are tracking <span className="font-semibold text-slate-800 dark:text-slate-200">{opportunities.length}</span> opportunities across internships, fellowships, and scholarships.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/profile">
              <Button variant="outline" size="sm" className="text-xs">
                Edit Profile Vault
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={onOpenAddModal}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Opportunity
            </Button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <StatsRow />

        {/* Deadlines & Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <UpcomingDeadlines onOpenAddModal={onOpenAddModal} />
          </div>

          <div className="lg:col-span-1">
            <RecentActivity />
          </div>
        </div>

        {/* Quick Tips / Workflow Guide Card */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            ApplyPilot Workflow Checklist
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="rounded-md border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-950">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                1. Save via URL
              </span>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Paste any opportunity link. ApplyPilot extracts the requirements and deadline automatically.
              </p>
            </div>
            <div className="rounded-md border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-950">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                2. Fill Your Vault
              </span>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Add your projects, skills, and coursework once in Profile Vault so the AI writes hyper-personalised drafts.
              </p>
            </div>
            <div className="rounded-md border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-950">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                3. Never Miss Cutoffs
              </span>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Resend email alerts notify you 7d, 3d, and 1d prior to deadline with direct links to finish applying.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
