import React from 'react';
import { OpportunityCategory } from '@/types/database';
import { cn } from '@/lib/utils';

interface CategoryBadgeProps {
  category: OpportunityCategory | string;
  className?: string;
}

// Categories are labels, not signals, so they stay quiet text.
export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center h-6 rounded-md bg-slate-100 px-2 text-xs text-slate-600 whitespace-nowrap',
        'dark:bg-slate-800 dark:text-slate-300',
        className
      )}
    >
      {category}
    </span>
  );
}
