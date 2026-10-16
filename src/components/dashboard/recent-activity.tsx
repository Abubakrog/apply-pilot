'use client';

import React from 'react';
import { useApp } from '@/lib/store/app-context';
import { formatDate } from '@/lib/utils';
import { History, Activity, Sparkles, CheckCircle, PlusCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function RecentActivity() {
  const { activities } = useApp();

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'created':
        return <PlusCircle className="h-3.5 w-3.5 text-blue-600" />;
      case 'status_changed':
        return <Activity className="h-3.5 w-3.5 text-amber-500" />;
      case 'draft_saved':
        return <Sparkles className="h-3.5 w-3.5 text-purple-500" />;
      default:
        return <History className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <History className="h-4 w-4 text-slate-500" />
            Recent Activity
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Track status updates, additions, and generated drafts.
          </p>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center text-slate-400 text-xs">
          No activity recorded yet.
        </div>
      ) : (
        <div className="space-y-3 flex-1 overflow-y-auto max-h-[360px]">
          {activities.map((act) => (
            <div key={act.id} className="flex items-start gap-2.5 text-xs">
              <div className="mt-0.5 p-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shrink-0">
                {getActionIcon(act.action_type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-800 dark:text-slate-200 leading-snug break-words">
                  {act.description}
                </p>
                <span className="text-[10px] text-slate-400">
                  {formatDate(act.created_at)}
                </span>
              </div>
              {act.opportunity_id && (
                <Link
                  href={`/opportunities/${act.opportunity_id}`}
                  className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 shrink-0"
                  title="View opportunity"
                >
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
