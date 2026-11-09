'use client';

import React from 'react';
import { Header } from '@/components/navigation/header';
import { StatsRow } from '@/components/dashboard/stats-row';
import { UpcomingDeadlines } from '@/components/dashboard/upcoming-deadlines';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { useApp } from '@/lib/store/app-context';
import { Button } from '@/components/ui/button';
import { Plus, ListChecks, BookOpen, Clock } from 'lucide-react';
import Link from 'next/link';
import { useCurrentDate } from '@/lib/utils';

interface DashboardPageProps {
  onOpenAddModal?: () => void;
  onOpenMobileNav?: () => void;
}

export default function DashboardPage({
  onOpenAddModal,
  onOpenMobileNav,
}: DashboardPageProps) {
  const { user, opportunities, loading } = useApp();
  const now = useCurrentDate();
  const today = now
    ? now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
    : 'Dashboard';

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Dashboard"
        description="Deadlines, statuses and follow-ups"
        onOpenAddModal={onOpenAddModal}
        onOpenMobileNav={onOpenMobileNav}
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Welcome greeting banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-slate-900 dark:text-slate-100">
              {today}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              <span className="font-mono tabular-nums text-slate-800 dark:text-slate-200">{opportunities.length}</span> opportunities tracked{user?.name ? ` by ${user.name}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/profile">
              <Button variant="outline" size="sm" className="text-xs">
                Edit profile
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={onOpenAddModal}
              className="text-xs"
            >
              <Plus className="h-4 w-4" />
              Add opportunity
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
        <div className="rounded-xl border border-slate-900/8 bg-white p-5 dark:border-white/8 dark:bg-slate-900">
          <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-slate-500" />
            Getting the most from ApplyPilot
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="border-t border-slate-900/8 pt-3 dark:border-white/8">
              <span className="font-medium text-slate-800 dark:text-slate-200 block mb-1 text-sm">
                1. Save from a link
              </span>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-5">
                Paste an opportunity link and check the requirements and deadline it pulls out.
              </p>
            </div>
            <div className="border-t border-slate-900/8 pt-3 dark:border-white/8">
              <span className="font-medium text-slate-800 dark:text-slate-200 block mb-1 text-sm">
                2. Fill in your profile
              </span>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-5">
                Add your projects, skills and coursework once. Drafts are written from them.
              </p>
            </div>
            <div className="border-t border-slate-900/8 pt-3 dark:border-white/8">
              <span className="font-medium text-slate-800 dark:text-slate-200 block mb-1 text-sm">
                3. Watch for reminders
              </span>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-5">
                Emails arrive 7, 3 and 1 day before each deadline, with a link back to finish applying.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
