'use client';

import React from 'react';
import { useApp } from '@/lib/store/app-context';
import { Briefcase, Send, Clock, AlertTriangle } from 'lucide-react';

export function StatsRow() {
  const { stats } = useApp();

  const statCards = [
    {
      label: 'Opportunities Saved',
      value: stats.totalOpportunities,
      icon: <Briefcase className="h-4 w-4 text-slate-500" />,
      sub: 'All tracked roles & programs',
    },
    {
      label: 'Applications Submitted',
      value: stats.submittedApplications,
      icon: <Send className="h-4 w-4 text-blue-600" />,
      sub: 'Applied, Interview, or Accepted',
    },
    {
      label: 'Upcoming Deadlines',
      value: stats.upcomingDeadlines,
      icon: <Clock className="h-4 w-4 text-amber-500" />,
      sub: 'Action required before cutoff',
    },
    {
      label: 'Awaiting Follow-Up',
      value: stats.awaitingFollowUp,
      icon: <AlertTriangle className="h-4 w-4 text-purple-500" />,
      sub: 'Past scheduled follow-up date',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, idx) => (
        <div
          key={idx}
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {stat.label}
            </span>
            <div className="p-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
              {stat.icon}
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
              {stat.value}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">{stat.sub}</p>
        </div>
      ))}
    </div>
  );
}
