import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { FlapCounter, urgencyFor } from './flap-counter';

export interface BoardRow {
  id: string;
  title: string;
  organisation: string;
  category: string;
  status: string;
  deadlineLabel: string;
  daysLeft: number | null;
  href?: string;
}

const remark = (days: number | null, status: string) => {
  const u = urgencyFor(days);
  if (u === 'closing') return days === 0 ? 'Closes today' : 'Closing';
  if (u === 'soon') return status === 'Preparing' ? 'Preparing' : 'This week';
  return status;
};

/**
 * Upcoming deadlines laid out like a departures board: days left on the flaps,
 * then the opportunity, its category and closing date.
 */
export function ClosingBoard({ rows, compact = false }: { rows: BoardRow[]; compact?: boolean }) {
  return (
    <div className="divide-y divide-slate-900/6 dark:divide-white/6">
      <div
        className={cn(
          'grid items-center gap-4 pb-2 text-[11px] text-slate-500 dark:text-slate-400',
          compact ? 'grid-cols-[56px_1fr_auto]' : 'grid-cols-[56px_1fr_auto] sm:grid-cols-[56px_1fr_120px_96px]'
        )}
      >
        <span>Days</span>
        <span>Opportunity</span>
        {!compact && <span className="hidden sm:block">Closes</span>}
        <span className="text-right">Remark</span>
      </div>

      {rows.map((row) => {
        const u = urgencyFor(row.daysLeft);
        const title = (
          <span className="block truncate text-sm font-medium text-slate-900 dark:text-slate-100">{row.title}</span>
        );
        return (
          <div
            key={row.id}
            className={cn(
              'grid items-center gap-4 py-3',
              compact ? 'grid-cols-[56px_1fr_auto]' : 'grid-cols-[56px_1fr_auto] sm:grid-cols-[56px_1fr_120px_96px]'
            )}
          >
            <FlapCounter daysLeft={row.daysLeft} size="sm" />
            <span className="min-w-0">
              {row.href ? (
                <Link href={row.href} className="block hover:text-blue-600 transition-colors">
                  {title}
                </Link>
              ) : (
                title
              )}
              <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                {row.organisation} · {row.category}
              </span>
            </span>
            {!compact && (
              <span className="hidden sm:block font-mono text-xs tabular-nums text-slate-600 dark:text-slate-300">
                {row.deadlineLabel}
              </span>
            )}
            <span
              className={cn(
                'text-right text-xs whitespace-nowrap',
                u === 'closing'
                  ? 'text-red-600 dark:text-red-400'
                  : u === 'soon'
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-slate-500 dark:text-slate-400'
              )}
            >
              {remark(row.daysLeft, row.status)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
