'use client';

import React, { useState, useEffect } from 'react';
import { Opportunity, ApplicationDraft, DraftType } from '@/types/database';
import { useApp } from '@/lib/store/app-context';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { DataService } from '@/lib/store/data-service';
import {
  PenLine,
  Copy,
  Check,
  Save,
  MessageSquare,
  Mail,
  Send,
  HelpCircle,
  FileText,
  Clock,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface WritingAssistantProps {
  opportunity: Opportunity;
}

type ToneType = 'Professional' | 'Enthusiastic' | 'Confident' | 'Direct';

const DRAFT_TYPES: { id: DraftType; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    id: 'cold_email',
    label: 'Cold Email to Recruiter',
    icon: <Mail className="h-4 w-4" />,
    desc: 'Compelling outreach highlighting your projects for this specific role.',
  },
  {
    id: 'application_answer',
    label: 'Application Question / Why Us',
    icon: <FileText className="h-4 w-4" />,
    desc: 'Structured answer mapping your skills and achievements to their criteria.',
  },
  {
    id: 'follow_up',
    label: 'Polite Follow-up',
    icon: <Send className="h-4 w-4" />,
    desc: 'Check in on a submitted application or recent interview without being pushy.',
  },
  {
    id: 'organiser_email',
    label: 'Organiser / Sponsor Inquiry',
    icon: <MessageSquare className="h-4 w-4" />,
    desc: 'Inquire about travel grants, project tracks, or eligibility guidelines.',
  },
];

const TONES: ToneType[] = ['Professional', 'Enthusiastic', 'Confident', 'Direct'];

export function WritingAssistant({ opportunity }: WritingAssistantProps) {
  const { profile, user } = useApp();
  const { success, error } = useToast();

  const [selectedType, setSelectedType] = useState<DraftType>('cold_email');
  const [selectedTone, setSelectedTone] = useState<ToneType>('Professional');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSubject, setGeneratedSubject] = useState('');
  const [generatedBody, setGeneratedBody] = useState('');
  const [keyPointsUsed, setKeyPointsUsed] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Saved Drafts
  const [savedDrafts, setSavedDrafts] = useState<ApplicationDraft[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(true);

  useEffect(() => {
    async function loadDrafts() {
      try {
        const drafts = await DataService.getDrafts(opportunity.id);
        setSavedDrafts(drafts);
      } catch (e) {
        console.error('Error loading drafts', e);
      } finally {
        setLoadingDrafts(false);
      }
    }
    loadDrafts();
  }, [opportunity.id]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setCopied(false);

    try {
      const res = await fetch('/api/ai/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftType: selectedType,
          tone: selectedTone,
          promptQuestion: customPrompt.trim() || undefined,
          opportunity: {
            title: opportunity.title,
            organisation: opportunity.organisation,
            category: opportunity.category,
            description: opportunity.description,
            eligibility: opportunity.eligibility,
            required_documents: opportunity.required_documents,
          },
          profile: profile || {
            full_name: user?.name,
            skills: ['Problem Solving', 'Communication'],
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.unconfigured) {
          throw new Error('Gemini API key is not configured in .env.local.');
        }
        throw new Error(data.error || 'Failed to generate draft');
      }

      setGeneratedSubject(data.subject || '');
      setGeneratedBody(data.body || '');
      setKeyPointsUsed(data.keyPointsUsed || []);
      success('Draft written from your profile');
    } catch (err: unknown) {
      const e = err as Error;
      error(e.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    const fullText = generatedSubject
      ? `Subject: ${generatedSubject}\n\n${generatedBody}`
      : generatedBody;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    success('Copied draft to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveDraft = async () => {
    if (!generatedBody.trim() || !user) return;

    setIsSaving(true);
    try {
      const saved = await DataService.saveDraft({
        user_id: user.id,
        opportunity_id: opportunity.id,
        draft_type: selectedType,
        subject: generatedSubject || null,
        body: generatedBody,
        tone: selectedTone,
      });

      setSavedDrafts([saved, ...savedDrafts]);
      success('Draft saved');
    } catch {
      error('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadSavedDraft = (draft: ApplicationDraft) => {
    setSelectedType(draft.draft_type);
    setSelectedTone((draft.tone as ToneType) || 'Professional');
    setGeneratedSubject(draft.subject || '');
    setGeneratedBody(draft.body);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <PenLine className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              AI Writing Assistant
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Generates tailored applications and outreach grounded in your saved Profile Vault.
            </p>
          </div>
          {profile?.skills && profile.skills.length > 0 ? (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded">
              Vault Connected ({profile.skills.length} skills loaded)
            </span>
          ) : (
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded">
              Profile Vault empty (Add skills in Profile)
            </span>
          )}
        </div>

        {/* Draft Type Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
          {DRAFT_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`text-left p-3 rounded-md border text-xs transition flex flex-col justify-between ${
                selectedType === type.id
                  ? 'border-blue-600 bg-blue-50/50 text-blue-950 dark:border-blue-500 dark:bg-blue-950/30 dark:text-blue-100 font-medium ring-1 ring-blue-600'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 font-semibold">
                {type.icon}
                {type.label}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-snug">
                {type.desc}
              </p>
            </button>
          ))}
        </div>

        {/* Tone Selector & Custom Prompt */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Desired tone
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {TONES.map((tone) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => setSelectedTone(tone)}
                  className={`px-3 py-1 text-xs rounded border transition-colors ${
                    selectedTone === tone
                      ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 font-medium'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Custom Question / Focus (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder='e.g. "Focus on my Raft KV-store project" or "Why are you interested in Cloudflare?"'
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <Button onClick={handleGenerate} loading={isGenerating} size="sm">
                <PenLine className="h-4 w-4 mr-1" />
                Generate draft
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor & Generated Output */}
      {generatedBody ? (
        <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Generated draft
              </span>
              <span className="ml-2 text-[11px] text-slate-500">
                You can review, edit freely, and copy or save below.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="text-xs gap-1.5"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy Draft'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSaveDraft}
                loading={isSaving}
                className="text-xs gap-1.5"
              >
                <Save className="h-4 w-4" />
                Save draft
              </Button>
            </div>
          </div>

          {keyPointsUsed.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Profile Strengths Highlighted:
              </span>
              {keyPointsUsed.map((point, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300"
                >
                  <Check className="h-3 w-3 text-slate-500" />
                  {point}
                </span>
              ))}
            </div>
          )}

          {generatedSubject && (
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Subject line
              </label>
              <input
                type="text"
                value={generatedSubject}
                onChange={(e) => setGeneratedSubject(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Body Content (Editable)
            </label>
            <textarea
              rows={9}
              value={generatedBody}
              onChange={(e) => setGeneratedBody(e.target.value)}
              className="w-full p-3 text-xs font-sans rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600 resize-y leading-relaxed"
            />
          </div>

          <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <span>
              ℹ️ Drafting only. ApplyPilot never sends messages automatically without your review and external dispatch.
            </span>
          </div>
        </div>
      ) : null}

      {/* Previously Saved Drafts for this opportunity */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-slate-400" />
          Saved Drafts for {opportunity.title} ({savedDrafts.length})
        </h4>

        {savedDrafts.length === 0 ? (
          <p className="text-xs text-slate-400 italic">
            No drafts saved yet for this opportunity. Use the generator above to create and save.
          </p>
        ) : (
          <div className="space-y-3">
            {savedDrafts.map((draft) => (
              <div
                key={draft.id}
                className="p-3 rounded-md border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950 flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 text-[11px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {draft.draft_type.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatDate(draft.created_at)}
                    </span>
                  </div>
                  {draft.subject && (
                    <div className="font-medium text-slate-800 dark:text-slate-200 mb-1">
                      {draft.subject}
                    </div>
                  )}
                  <p className="text-slate-600 dark:text-slate-400 line-clamp-2 text-[11px] leading-relaxed">
                    {draft.body}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleLoadSavedDraft(draft)}
                    className="px-2 py-1 text-[11px] rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    Load into Editor
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        draft.subject ? `Subject: ${draft.subject}\n\n${draft.body}` : draft.body
                      );
                      success('Copied saved draft to clipboard');
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="Copy to clipboard"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
