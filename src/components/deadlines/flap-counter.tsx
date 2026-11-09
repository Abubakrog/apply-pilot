import React from 'react';
import { cn } from '@/lib/utils';

export type Urgency = 'closing' | 'soon' | 'later' | 'none';

export function urgencyFor(daysLeft: number | null): Urgency {
  if (daysLeft === null) return 'none';
  if (daysLeft <= 2) return 'closing';
  if (daysLeft <= 7) return 'soon';
  return 'later';
}

const digitTone: Record<Urgency, string> = {
  closing: 'text-red-300',
  soon: 'text-amber-200',
  later: 'text-slate-50',
  none: 'text-slate-500',
};

/**
 * Days left shown as split-flap cells, like a departures board.
 * Two cells (00–99); anything further out shows "99". Null shows dashes.
 */
export function FlapCounter({
  daysLeft,
  size = 'md',
  className,
}: {
  daysLeft: number | null;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const urgency = urgencyFor(daysLeft);
  const chars =
    daysLeft === null ? ['–', '–'] : String(Math.max(0, Math.min(99, daysLeft))).padStart(2, '0').split('');
  const cell = size === 'sm' ? 'w-5 h-7 text-sm' : 'w-6 h-8 text-base';

  return (
    <span
      className={cn('inline-flex items-center gap-0.5', className)}
      aria-label={
        daysLeft === null
          ? 'No deadline'
          : daysLeft === 0
          ? 'Closes today'
          : `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`
      }
    >
      {chars.map((c, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={cn(
            'relative inline-flex items-center justify-center rounded-[4px] bg-slate-900 font-mono font-medium tabular-nums leading-none',
            'shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_1px_1px_rgba(0,0,0,0.2)] dark:bg-black',
            cell,
            digitTone[urgency]
          )}
        >
          {c}
          {/* the flap hinge */}
          <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-black/60" />
          <span className="pointer-events-none absolute inset-x-0 top-1/2 mt-px h-px bg-white/5" />
        </span>
      ))}
    </span>
  );
}
