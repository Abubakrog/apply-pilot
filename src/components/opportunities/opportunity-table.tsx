'use client';

import React from 'react';
import Link from 'next/link';
import { Opportunity, ApplicationStatus } from '@/types/database';
import { CategoryBadge } from './category-badge';
import { StatusBadge } from './status-badge';
import { formatDate, getDaysRemaining, useCurrentDate } from '@/lib/utils';
import { ExternalLink, Sparkles, Trash2, Calendar, MapPin } from 'lucide-react';
import { useApp } from '@/lib/store/app-context';
import { useToast } from '@/components/ui/toast';

interface OpportunityTableProps {
  opportunities: Opportunity[];
}

export function OpportunityTable({ opportunities }: OpportunityTableProps) {
  const { updateOpportunity, deleteOpportunity } = useApp();
  const { success, error } = useToast();
  const currentDate = useCurrentDate();

  const handleStatusChange = async (id: string, newStatus: ApplicationStatus) => {
    try {
      await updateOpportunity(id, {
        status: newStatus,
        applied_date: newStatus === 'Applied' ? new Date().toISOString() : undefined,
      });
      success(`Status updated to ${newStatus}`);
    } catch {
      error('Failed to update status');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteOpportunity(id);
        success('Opportunity deleted');
      } catch {
        error('Failed to delete opportunity');
      }
    }
  };

  if (opportunities.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          No opportunities found matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50/75 dark:border-slate-800 dark:bg-slate-900/75 text-slate-500 font-medium">
            <tr>
              <th className="py-3 px-4">Opportunity</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Deadline</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {opportunities.map((opp) => {
              const daysLeft = getDaysRemaining(opp.deadline, currentDate);
              const isClosed = ['Applied', 'Accepted', 'Rejected', 'Withdrawn'].includes(opp.status);

              return (
                <tr
                  key={opp.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <Link
                        href={`/opportunities/${opp.id}`}
                        className="font-medium text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5"
                      >
                        {opp.title}
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
                          →
                        </span>
                      </Link>
                      <span className="text-slate-500 text-[11px] mt-0.5">{opp.organisation}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <CategoryBadge category={opp.category} />
                  </td>

                  <td className="py-3 px-4">
                    <select
                      value={opp.status}
                      onChange={(e) =>
                        handleStatusChange(opp.id, e.target.value as ApplicationStatus)
                      }
                      className="text-xs bg-transparent border-0 font-medium text-slate-700 dark:text-slate-300 cursor-pointer focus:ring-0 p-0"
                    >
                      <option value="Interested">Interested</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Applied">Applied</option>
                      <option value="Interview">Interview</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Withdrawn">Withdrawn</option>
                    </select>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    {opp.deadline ? (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-slate-700 dark:text-slate-300">
                          {formatDate(opp.deadline)}
                        </span>
                        {daysLeft !== null && !isClosed && (
                          <span
                            className={`ml-1 text-[10px] px-1.5 py-0.2 rounded font-medium ${
                              daysLeft <= 2
                                ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                                : daysLeft <= 7
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {daysLeft === 0
                              ? 'Today'
                              : daysLeft === 1
                              ? '1d left'
                              : `${daysLeft}d left`}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">No deadline</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {opp.location ? (
                      <span className="flex items-center gap-1 text-[11px]">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {opp.location}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">—</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/opportunities/${opp.id}?tab=ai`}
                        title="Open AI Assistant"
                        className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                      </Link>

                      {opp.url && (
                        <a
                          href={opp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open original website"
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}

                      <button
                        onClick={() => handleDelete(opp.id, opp.title)}
                        title="Delete opportunity"
                        className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
