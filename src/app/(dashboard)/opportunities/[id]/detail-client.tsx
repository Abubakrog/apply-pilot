'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Opportunity, ApplicationStatus } from '@/types/database';
import { useApp } from '@/lib/store/app-context';
import { useToast } from '@/components/ui/toast';
import { CategoryBadge } from '@/components/opportunities/category-badge';
import { StatusBadge } from '@/components/opportunities/status-badge';
import { WritingAssistant } from '@/components/ai/writing-assistant';
import { formatDate, getDaysRemaining, useCurrentDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  ExternalLink,
  PenLine,
  Trash2,
  Save,
  CheckCircle,
  Clock,
  FileText,
  Link as LinkIcon,
  AlertCircle,
} from 'lucide-react';

interface DetailClientProps {
  id: string;
}

const STATUS_OPTIONS: ApplicationStatus[] = [
  'Interested',
  'Preparing',
  'Applied',
  'Interview',
  'Accepted',
  'Rejected',
  'Withdrawn',
];

export default function OpportunityDetailClient({ id }: DetailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { opportunities, updateOpportunity, deleteOpportunity } = useApp();
  const { success, error } = useToast();
  const currentDate = useCurrentDate();

  const opp = opportunities.find((o) => o.id === id);

  const initialTab = searchParams.get('tab') === 'ai' ? 'ai' : 'overview';
  const [activeTab, setActiveTab] = useState<'overview' | 'ai'>(initialTab);

  // Editable fields
  const [status, setStatus] = useState<ApplicationStatus>('Interested');
  const [deadline, setDeadline] = useState('');
  const [appliedDate, setAppliedDate] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [notes, setNotes] = useState('');
  const [description, setDescription] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (opp) {
      setStatus(opp.status);
      setDeadline(opp.deadline ? opp.deadline.split('T')[0] : '');
      setAppliedDate(opp.applied_date ? opp.applied_date.split('T')[0] : '');
      setFollowUpDate(opp.follow_up_date ? opp.follow_up_date.split('T')[0] : '');
      setNotes(opp.notes || '');
      setDescription(opp.description || '');
      setEligibility(opp.eligibility || '');
    }
  }, [opp]);

  if (!opp) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-10 w-10 text-slate-400 mb-3" />
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          Opportunity not found
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          This opportunity may have been removed or you may not have permission to view it.
        </p>
        <Link href="/opportunities" className="mt-4">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Opportunities
          </Button>
        </Link>
      </div>
    );
  }

  const daysLeft = getDaysRemaining(opp.deadline, currentDate);

  const handleSaveDetails = async () => {
    setIsSaving(true);
    try {
      await updateOpportunity(opp.id, {
        status,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        applied_date: appliedDate ? new Date(appliedDate).toISOString() : null,
        follow_up_date: followUpDate ? new Date(followUpDate).toISOString() : null,
        notes: notes.trim() || null,
        description: description.trim() || null,
        eligibility: eligibility.trim() || null,
      });
      success('Opportunity details updated successfully');
    } catch {
      error('Failed to update details');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${opp.title}"?`)) {
      try {
        await deleteOpportunity(opp.id);
        success('Opportunity deleted');
        router.push('/opportunities');
      } catch {
        error('Failed to delete opportunity');
      }
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex items-center justify-between pb-2">
        <Link
          href="/opportunities"
          className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all opportunities
        </Link>

        <div className="flex items-center gap-2">
          {opp.url && (
            <a
              href={opp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
            >
              <ExternalLink className="h-4 w-4 text-slate-400" />
              Original posting
            </a>
          )}
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            className="text-xs h-8 bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Opportunity Header Card */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge category={opp.category} />
              <StatusBadge status={status} />
              {daysLeft !== null && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                    daysLeft <= 2
                      ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                      : daysLeft <= 7
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {daysLeft === 0
                    ? 'Due Today'
                    : daysLeft === 1
                    ? '1 Day Remaining'
                    : `${daysLeft} Days Remaining`}
                </span>
              )}
            </div>

            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {opp.title}
            </h1>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {opp.organisation}
            </p>

            {opp.location && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                <MapPin className="h-4 w-4 text-slate-400" />
                {opp.location}
              </p>
            )}
          </div>

          {/* Status Quick Updater Box */}
          <div className="rounded-md border border-slate-100 bg-slate-50/75 p-4 dark:border-slate-800 dark:bg-slate-950 min-w-[220px]">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
              Application status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
              className="w-full px-3 py-1.5 text-xs rounded border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span>Auto-reminders</span>
              <span className="text-emerald-600 font-medium">Active (7d, 3d, 1d)</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mt-6 -mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="h-4 w-4" />
            Overview and application tracking
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'ai'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <PenLine className="h-4 w-4" />
            AI Writing Assistant
          </button>
        </div>
      </div>

      {/* Tab 1: Overview & Application Tracking Details */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Description, Eligibility, Notes */}
            <div className="lg:col-span-2 space-y-5">
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <div>
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Description and overview
                  </h3>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Opportunity overview and requirements..."
                    className="w-full p-3 text-xs rounded-md border border-slate-200 bg-slate-50/50 dark:bg-slate-950 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600 resize-y leading-relaxed"
                  />
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Eligibility criteria
                  </h3>
                  <textarea
                    rows={3}
                    value={eligibility}
                    onChange={(e) => setEligibility(e.target.value)}
                    placeholder="GPA requirements, student status, graduating classes..."
                    className="w-full p-3 text-xs rounded-md border border-slate-200 bg-slate-50/50 dark:bg-slate-950 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600 resize-y leading-relaxed"
                  />
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Personal notes and next steps
                  </h3>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Discuss with advisor, review essay draft, reach out to Stanford alumni at firm..."
                    className="w-full p-3 text-xs rounded-md border border-slate-200 bg-slate-50/50 dark:bg-slate-950 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600 resize-y leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleSaveDetails}
                    loading={isSaving}
                    className="text-xs gap-1.5"
                  >
                    <Save className="h-4 w-4" />
                    Save changes
                  </Button>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Dates, Required Documents, Relevant Links */}
            <div className="space-y-5">
              {/* Important Timeline Dates Card */}
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
                <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-slate-400" />
                  Key dates and milestones
                </h3>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Application deadline
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Date Submitted (Applied)
                  </label>
                  <input
                    type="date"
                    value={appliedDate}
                    onChange={(e) => setAppliedDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Triggers a follow-up reminder on the dashboard.
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveDetails}
                    loading={isSaving}
                    className="w-full text-xs"
                  >
                    Update dates
                  </Button>
                </div>
              </div>

              {/* Required Documents Card */}
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Required documents
                </h3>
                {opp.required_documents && opp.required_documents.length > 0 ? (
                  <ul className="space-y-1.5 text-xs">
                    {opp.required_documents.map((doc, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-slate-700 dark:text-slate-300"
                      >
                        <CheckCircle className="h-4 w-4 text-blue-600 shrink-0" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 italic">None listed</p>
                )}
              </div>

              {/* Relevant Links Card */}
              {opp.relevant_links && opp.relevant_links.length > 0 && (
                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Saved resources and links
                  </h3>
                  <div className="space-y-1.5">
                    {opp.relevant_links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline dark:text-blue-400 truncate"
                      >
                        <LinkIcon className="h-3 w-3 shrink-0" />
                        {link.title || link.url}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: AI Writing Assistant */}
      {activeTab === 'ai' && (
        <WritingAssistant opportunity={opp} />
      )}
    </div>
  );
}
