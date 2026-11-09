'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store/app-context';
import { formatDate, getDaysRemaining, useCurrentDate } from '@/lib/utils';
import { ClosingBoard } from '@/components/deadlines/closing-board';
import { ArrowRight } from 'lucide-react';

interface UpcomingDeadlinesProps {
  onOpenAddModal?: () => void;
}

export function UpcomingDeadlines({ onOpenAddModal }: UpcomingDeadlinesProps) {
  const { opportunities } = useApp();
  const currentDate = useCurrentDate();

  // Future deadlines that still need an application
  const upcoming = (!currentDate
    ? []
    : opportunities.filter((o) => {
        if (!o.deadline) return false;
        const d = new Date(o.deadline);
        return d >= currentDate && !['Applied', 'Accepted', 'Rejected', 'Withdrawn'].includes(o.status);
      })
  )
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 5);

  return (
    <section className="rounded-xl border border-slate-900/8 bg-white px-5 pt-4 pb-2 dark:border-white/8 dark:bg-slate-900 h-full flex flex-col">
      <div className="flex items-baseline justify-between pb-4">
        <h2 className="text-sm font-medium text-slate-900 dark:text-slate-100">Closing soon</h2>
        <Link
          href="/opportunities"
          className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 inline-flex items-center gap-1 transition-colors"
        >
          All opportunities <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <div className="flex-1 flex flex-col items-start justify-center py-8">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Nothing closing soon</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
            Everything open is applied for, or nothing tracked has a closing date yet.
          </p>
          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
            >
              Track an opportunity
            </button>
          )}
        </div>
      ) : (
        <ClosingBoard
          rows={upcoming.map((opp) => ({
            id: opp.id,
            title: opp.title,
            organisation: opp.organisation,
            category: opp.category,
            status: opp.status,
            deadlineLabel: formatDate(opp.deadline),
            daysLeft: getDaysRemaining(opp.deadline, currentDate),
            href: `/opportunities/${opp.id}`,
          }))}
        />
      )}
    </section>
  );
}
