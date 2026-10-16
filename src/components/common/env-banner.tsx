'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store/app-context';
import { Info, X, ExternalLink, Check, RotateCcw } from 'lucide-react';

export function EnvBanner() {
  const { isDemoMode, isSupabaseReady, resetToSeedData } = useApp();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-slate-900 text-slate-100 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
      <div className="flex items-center gap-2">
        <Info className="h-3.5 w-3.5 text-blue-400 shrink-0" />
        <span>
          {isSupabaseReady ? (
            <span className="text-emerald-400 font-medium">
              Supabase connected with PostgreSQL & Row Level Security.
            </span>
          ) : (
            <span>
              <strong>Local Mode:</strong> Supabase keys not set in .env.local. Operating in full
              local reactive mode with seed opportunities.
            </span>
          )}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {isDemoMode && (
          <button
            onClick={() => {
              resetToSeedData();
              alert('Reset to initial sample opportunities');
            }}
            className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 underline underline-offset-2"
          >
            <RotateCcw className="h-3 w-3" />
            Reset Demo Data
          </button>
        )}
        <a
          href="/settings"
          className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
        >
          Check API Connections →
        </a>
        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-white p-0.5"
          title="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
