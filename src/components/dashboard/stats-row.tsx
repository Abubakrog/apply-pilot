'use client';

import React from 'react';
import { useApp } from '@/lib/store/app-context';

export function StatsRow() {
  const { stats } = useApp();

  const statCards = [
    { label: 'Saved', value: stats.totalOpportunities, sub: 'roles and programmes tracked' },
    { label: 'Applied', value: stats.submittedApplications, sub: 'applied, interviewing or accepted' },
    { label: 'Upcoming deadlines', value: stats.upcomingDeadlines, sub: 'still to submit' },
    { label: 'Follow-up due', value: stats.awaitingFollowUp, sub: 'past the follow-up date' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-slate-900/8 bg-white p-4 dark:border-white/8 dark:bg-slate-900"
        >
          <span className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</span>
          <p className="mt-1 text-[28px] leading-9 font-medium font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {stat.value}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{stat.sub}</p>
        </div>
      ))}
    </div>
  );
}
