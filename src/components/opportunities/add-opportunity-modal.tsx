'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { OpportunityCategory, ApplicationStatus } from '@/types/database';
import { useApp } from '@/lib/store/app-context';
import { useToast } from '@/components/ui/toast';
import { Sparkles, Link as LinkIcon, Plus, AlertCircle, CheckCircle } from 'lucide-react';

interface AddOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: OpportunityCategory[] = [
  'Internship',
  'Scholarship',
  'Hackathon',
  'Fellowship',
  'Job',
  'Other',
];

const STATUSES: ApplicationStatus[] = [
  'Interested',
  'Preparing',
  'Applied',
  'Interview',
  'Accepted',
  'Rejected',
  'Withdrawn',
];

export function AddOpportunityModal({ isOpen, onClose }: AddOpportunityModalProps) {
  const { addOpportunity } = useApp();
  const { success, error } = useToast();

  const [mode, setMode] = useState<'url' | 'manual'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionNotice, setExtractionNotice] = useState<string | null>(null);
  const [hasExtracted, setHasExtracted] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<OpportunityCategory>('Internship');
  const [description, setDescription] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [requiredDocsInput, setRequiredDocsInput] = useState('Resume');
  const [deadline, setDeadline] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('Interested');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setUrlInput('');
    setTitle('');
    setOrganisation('');
    setUrl('');
    setCategory('Internship');
    setDescription('');
    setEligibility('');
    setRequiredDocsInput('Resume');
    setDeadline('');
    setLocation('');
    setNotes('');
    setStatus('Interested');
    setExtractionNotice(null);
    setHasExtracted(false);
    setIsExtracting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsExtracting(true);
    setExtractionNotice(null);

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to extract opportunity details');
      }

      if (data.extracted) {
        const ext = data.extracted;
        setTitle(ext.title || '');
        setOrganisation(ext.organisation || '');
        setUrl(ext.url || urlInput.trim());
        if (ext.category && CATEGORIES.includes(ext.category)) {
          setCategory(ext.category);
        }
        setDescription(ext.description || '');
        setEligibility(ext.eligibility || '');
        if (Array.isArray(ext.required_documents)) {
          setRequiredDocsInput(ext.required_documents.join(', '));
        }
        if (ext.deadline) {
          // Format as YYYY-MM-DD for date input
          try {
            const d = new Date(ext.deadline);
            if (!isNaN(d.getTime())) {
              setDeadline(d.toISOString().split('T')[0]);
            }
          } catch {
            // Keep empty
          }
        }
        setLocation(ext.location || '');
        setHasExtracted(true);
        if (data.notice) {
          setExtractionNotice(data.notice);
        }
      }
    } catch (err: unknown) {
      const e = err as Error;
      error(e.message || 'Extraction failed. You can fill details manually below.');
      setUrl(urlInput.trim());
      setMode('manual');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !organisation.trim()) {
      error('Title and Organisation are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const docList = requiredDocsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await addOpportunity({
        title: title.trim(),
        organisation: organisation.trim(),
        url: url.trim() || null,
        category,
        description: description.trim() || null,
        eligibility: eligibility.trim() || null,
        required_documents: docList,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        location: location.trim() || null,
        notes: notes.trim() || null,
        status,
        applied_date: status === 'Applied' ? new Date().toISOString() : null,
        follow_up_date: null,
        relevant_links: url.trim() ? [{ title: 'Application Link', url: url.trim() }] : [],
      });

      success(`Saved "${title}" to your opportunities!`);
      handleClose();
    } catch (err: unknown) {
      const e = err as Error;
      error(e.message || 'Failed to save opportunity');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Opportunity"
      description="Track an internship, scholarship, hackathon, fellowship, or job."
      maxWidth="2xl"
    >
      {/* Mode Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-5">
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex items-center gap-2 pb-2.5 text-xs font-medium border-b-2 transition-colors ${
            mode === 'url'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Paste URL with AI Extraction
        </button>
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`flex items-center gap-2 pb-2.5 ml-6 text-xs font-medium border-b-2 transition-colors ${
            mode === 'manual'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Plus className="h-3.5 w-3.5" />
          Manual Entry
        </button>
      </div>

      {mode === 'url' && !hasExtracted && (
        <form onSubmit={handleExtract} className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Opportunity Posting URL
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="url"
                  placeholder="https://example.com/careers/internship-2027"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <Button type="submit" loading={isExtracting} size="sm">
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                Extract Details
              </Button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
              Our server-side AI extracts role requirements, deadline, and eligibility so you can
              review before saving.
            </p>
          </div>
        </form>
      )}

      {hasExtracted && (
        <div className="mb-4 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 p-2.5 flex items-start gap-2 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Opportunity details extracted!</span>
            <p className="mt-0.5 text-[11px] text-emerald-700 dark:text-emerald-400">
              Please review and adjust the extracted fields below before saving.
            </p>
          </div>
        </div>
      )}

      {extractionNotice && (
        <div className="mb-4 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-2.5 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">{extractionNotice}</p>
        </div>
      )}

      {/* Main Review / Manual Entry Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Role / Program Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Software Engineering Fellow"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Organisation / Host *
            </label>
            <input
              type="text"
              placeholder="e.g. Kleiner Perkins"
              value={organisation}
              onChange={(e) => setOrganisation(e.target.value)}
              required
              className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as OpportunityCategory)}
              className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Initial Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
              className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Application Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Location / Remote Status
            </label>
            <input
              type="text"
              placeholder="e.g. San Francisco, CA / Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Posting / Application URL
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Description / Overview
          </label>
          <textarea
            rows={2}
            placeholder="Brief summary of the role or program..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Eligibility Criteria
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Undergrads graduating 2026-2028, min 3.0 GPA..."
              value={eligibility}
              onChange={(e) => setEligibility(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Required Documents (comma-separated)
            </label>
            <textarea
              rows={2}
              placeholder="Resume, Transcript, Cover Letter"
              value={requiredDocsInput}
              onChange={(e) => setRequiredDocsInput(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 resize-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Personal Notes & Next Steps
          </label>
          <input
            type="text"
            placeholder="e.g. Ask prof for recommendation letter, polish distributed systems project"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting} size="sm">
            Save Opportunity
          </Button>
        </div>
      </form>
    </Modal>
  );
}
