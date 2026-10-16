'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store/app-context';
import { formatDate, getDaysRemaining, useCurrentDate } from '@/lib/utils';
import { CategoryBadge } from '@/components/opportunities/category-badge';
import { Calendar, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface UpcomingDeadlinesProps {
  onOpenAddModal?: () => void;
}

export function UpcomingDeadlines({ onOpenAddModal }: UpcomingDeadlinesProps) {
  const { opportunities } = useApp();
  const currentDate = useCurrentDate();

  // Filter opportunities with future deadlines, not already closed
  const upcoming = (!currentDate
    ? []
    : opportunities
        .filter((o) => {
          if (!o.deadline) return false;
          const d = new Date(o.deadline);
          return (
            d >= currentDate &&
            !['Applied', 'Accepted', 'Rejected', 'Withdrawn'].includes(o.status)
          );
        })
  )
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 5);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-blue-600" />
            Urgent Deadlines
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Opportunities due soonest, ordered chronologically.
          </p>
        </div>
        <Link
          href="/opportunities"
          className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            No impending deadlines!
          </h4>
          <p className="text-[11px] text-slate-500 max-w-xs mt-1">
            You&apos;re all caught up, or haven&apos;t added opportunities with closing dates yet.
          </p>
          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="mt-3 text-xs text-blue-600 hover:underline font-medium"
            >
              + Track a new opportunity
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5 flex-1">
          {upcoming.map((opp) => {
            const daysLeft = getDaysRemaining(opp.deadline, currentDate);

            return (
              <div
                key={opp.id}
                className="group flex items-center justify-between rounded-md border border-slate-100 bg-slate-50/50 p-3 hover:border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Link
                      href={`/opportunities/${opp.id}`}
                      className="text-xs font-medium text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 truncate"
                    >
                      {opp.title}
                    </Link>
                    <CategoryBadge category={opp.category} />
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{opp.organisation}</div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-xs font-semibold ${
                        daysLeft !== null && daysLeft <= 2
                          ? 'text-red-600 dark:text-red-400'
                          : daysLeft !== null && daysLeft <= 7
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {daysLeft === 0
                        ? 'Due Today'
                        : daysLeft === 1
                        ? 'Due Tomorrow'
                        : `${daysLeft} days left`}
                    </div>
                    <div className="text-[10px] text-slate-400">{formatDate(opp.deadline)}</div>
                  </div>

                  <Link
                    href={`/opportunities/${opp.id}?tab=ai`}
                    className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded hover:bg-white dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-colors"
                    title="Draft application with AI"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
