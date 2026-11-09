'use client';

import React, { useState, useMemo } from 'react';
import { Header } from '@/components/navigation/header';
import { useApp } from '@/lib/store/app-context';
import { OpportunityTable } from '@/components/opportunities/opportunity-table';
import { KanbanBoard } from '@/components/opportunities/kanban-board';
import { Button } from '@/components/ui/button';
import { OpportunityCategory, ApplicationStatus } from '@/types/database';
import {
  List,
  Columns,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  PenLine,
} from 'lucide-react';

interface OpportunitiesPageProps {
  onOpenAddModal?: () => void;
  onOpenMobileNav?: () => void;
}

const CATEGORIES: (OpportunityCategory | 'All')[] = [
  'All',
  'Internship',
  'Scholarship',
  'Hackathon',
  'Fellowship',
  'Job',
  'Other',
];

const STATUSES: (ApplicationStatus | 'All')[] = [
  'All',
  'Interested',
  'Preparing',
  'Applied',
  'Interview',
  'Accepted',
  'Rejected',
  'Withdrawn',
];

export default function OpportunitiesPage({
  onOpenAddModal,
  onOpenMobileNav,
}: OpportunitiesPageProps) {
  const { opportunities } = useApp();

  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<OpportunityCategory | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | 'All'>('All');
  const [sortBy, setSortBy] = useState<'deadline_asc' | 'deadline_desc' | 'created_desc'>('deadline_asc');

  // Filtering & Sorting
  const filteredOpportunities = useMemo(() => {
    return opportunities
      .filter((opp) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = opp.title.toLowerCase().includes(q);
          const matchOrg = opp.organisation.toLowerCase().includes(q);
          const matchLoc = opp.location?.toLowerCase().includes(q) || false;
          if (!matchTitle && !matchOrg && !matchLoc) return false;
        }

        // Category filter
        if (selectedCategory !== 'All' && opp.category !== selectedCategory) {
          return false;
        }

        // Status filter
        if (selectedStatus !== 'All' && opp.status !== selectedStatus) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'deadline_asc') {
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        if (sortBy === 'deadline_desc') {
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [opportunities, searchQuery, selectedCategory, selectedStatus, sortBy]);

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Opportunities"
        description="Track internships, fellowships, hackathons, and scholarships."
        onOpenAddModal={onOpenAddModal}
        onOpenMobileNav={onOpenMobileNav}
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-4 max-w-7xl w-full mx-auto">
        {/* Controls Bar: Search, Category, Status, View Switcher */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-1">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search opportunities, orgs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as OpportunityCategory | 'All')}
              className="px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ApplicationStatus | 'All')}
              className="px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st === 'All' ? 'All Statuses' : st}
                </option>
              ))}
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="deadline_asc">Deadline: Soonest first</option>
              <option value="deadline_desc">Deadline: Latest first</option>
              <option value="created_desc">Recently added</option>
            </select>
          </div>

          {/* View Mode Toggle & Add Button */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${
                  viewMode === 'table'
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 font-semibold'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
                title="List / Table View"
              >
                <List className="h-4 w-4" />
                <span className="text-[11px] hidden sm:inline">Table</span>
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 font-semibold'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
                title="Status Kanban Board"
              >
                <Columns className="h-4 w-4" />
                <span className="text-[11px] hidden sm:inline">Board</span>
              </button>
            </div>

            <Button
              onClick={onOpenAddModal}
              size="sm"
              className="text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white gap-1"
            >
              <Plus className="h-4 w-4" />
              Add opportunity
            </Button>
          </div>
        </div>

        {/* Total Count Badge */}
        <div className="text-[11px] text-slate-500">
          Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredOpportunities.length}</span> of {opportunities.length} opportunities
        </div>

        {/* View Component */}
        {viewMode === 'table' ? (
          <OpportunityTable opportunities={filteredOpportunities} />
        ) : (
          <KanbanBoard opportunities={filteredOpportunities} />
        )}
      </div>
    </div>
  );
}
