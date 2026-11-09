import React from 'react';
import { ApplicationStatus } from '@/types/database';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ApplicationStatus | string;
  className?: string;
}

// The dot carries the meaning; the pill itself stays neutral.
const dot: Record<string, string> = {
  Interested: 'bg-slate-400',
  Preparing: 'bg-amber-500',
  Applied: 'bg-blue-600',
  Interview: 'bg-blue-600',
  Accepted: 'bg-emerald-600',
  Rejected: 'bg-red-500',
  Withdrawn: 'bg-slate-300',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 h-6 rounded-md border border-slate-900/10 bg-white px-2 text-xs text-slate-700 whitespace-nowrap',
        'dark:border-white/10 dark:bg-slate-900 dark:text-slate-300',
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dot[status] || 'bg-slate-400')} />
      {status}
    </span>
  );
}
