'use client';

import React from 'react';
import Link from 'next/link';
import { Opportunity, ApplicationStatus } from '@/types/database';
import { CategoryBadge } from './category-badge';
import { formatDate, getDaysRemaining, useCurrentDate } from '@/lib/utils';
import { Calendar, Sparkles, MoreHorizontal, ArrowRight, ArrowLeft } from 'lucide-react';
import { useApp } from '@/lib/store/app-context';
import { useToast } from '@/components/ui/toast';

interface KanbanBoardProps {
  opportunities: Opportunity[];
}

const COLUMNS: { status: ApplicationStatus; label: string; dotColor: string }[] = [
  { status: 'Interested', label: 'Interested', dotColor: 'bg-slate-400' },
  { status: 'Preparing', label: 'Preparing', dotColor: 'bg-blue-500' },
  { status: 'Applied', label: 'Applied', dotColor: 'bg-amber-500' },
  { status: 'Interview', label: 'Interview', dotColor: 'bg-purple-500' },
  { status: 'Accepted', label: 'Accepted', dotColor: 'bg-emerald-500' },
  { status: 'Rejected', label: 'Rejected', dotColor: 'bg-red-400' },
];

export function KanbanBoard({ opportunities }: KanbanBoardProps) {
  const { updateOpportunity } = useApp();
  const { success, error } = useToast();
  const currentDate = useCurrentDate();

  const handleMove = async (
    opp: Opportunity,
    direction: 'next' | 'prev'
  ) => {
    const currentIndex = COLUMNS.findIndex((c) => c.status === opp.status);
    if (currentIndex === -1) return;

    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0 || nextIndex >= COLUMNS.length) return;

    const targetStatus = COLUMNS[nextIndex].status;
    try {
      await updateOpportunity(opp.id, {
        status: targetStatus,
        applied_date: targetStatus === 'Applied' ? new Date().toISOString() : opp.applied_date,
      });
      success(`Moved to ${targetStatus}`);
    } catch {
      error('Failed to update status');
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-1">
      {COLUMNS.map((column) => {
        const columnOpps = opportunities.filter((o) => o.status === column.status);

        return (
          <div
            key={column.status}
            className="w-72 shrink-0 rounded-lg bg-slate-50/75 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 flex flex-col max-h-[calc(100vh-220px)]"
          >
            {/* Column Header */}
            <div className="p-3 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${column.dotColor}`} />
                <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {column.label}
                </h3>
              </div>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                {columnOpps.length}
              </span>
            </div>

            {/* Cards Container */}
            <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1">
              {columnOpps.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs italic">
                  No items
                </div>
              ) : (
                columnOpps.map((opp) => {
                  const daysLeft = getDaysRemaining(opp.deadline, currentDate);
                  const isClosed = ['Applied', 'Accepted', 'Rejected', 'Withdrawn'].includes(
                    opp.status
                  );

                  return (
                    <div
                      key={opp.id}
                      className="group rounded-md border border-slate-200 bg-white p-3 shadow-xs hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 transition-all flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <Link
                          href={`/opportunities/${opp.id}`}
                          className="font-medium text-xs text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2"
                        >
                          {opp.title}
                        </Link>
                        <Link
                          href={`/opportunities/${opp.id}?tab=ai`}
                          title="Generate AI Draft"
                          className="text-slate-400 hover:text-blue-600 shrink-0"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                        </Link>
                      </div>

                      <div className="text-[11px] text-slate-500 truncate">
                        {opp.organisation}
                      </div>

                      <div className="flex items-center justify-between pt-1 mt-auto">
                        <CategoryBadge category={opp.category} />

                        {opp.deadline ? (
                          <div className="flex items-center gap-1 text-[10px] text-slate-500">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            <span
                              className={
                                daysLeft !== null && daysLeft <= 2 && !isClosed
                                  ? 'text-red-600 font-semibold dark:text-red-400'
                                  : ''
                              }
                            >
                              {formatDate(opp.deadline)}
                            </span>
                          </div>
                        ) : null}
                      </div>

                      {/* Quick Move Bar */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleMove(opp, 'prev')}
                          disabled={COLUMNS[0].status === opp.status}
                          className="text-[10px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 flex items-center gap-0.5"
                          title="Move left"
                        >
                          <ArrowLeft className="h-3 w-3" /> Prev
                        </button>
                        <button
                          onClick={() => handleMove(opp, 'next')}
                          disabled={COLUMNS[COLUMNS.length - 1].status === opp.status}
                          className="text-[10px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 flex items-center gap-0.5"
                          title="Move right"
                        >
                          Next <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
