'use client';

import React from 'react';
import { Menu, Plus, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface HeaderProps {
  title?: string;
  description?: string;
  onOpenMobileNav?: () => void;
  onOpenAddModal?: () => void;
}

export function Header({
  title,
  description,
  onOpenMobileNav,
  onOpenAddModal,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-950/95 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          {title && (
            <h1 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/settings"
          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Deadline Notifications"
        >
          <Bell className="h-4 w-4" />
        </Link>

        {onOpenAddModal && (
          <Button
            size="sm"
            onClick={onOpenAddModal}
            className="text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add Opportunity</span>
            <span className="sm:hidden">Add</span>
          </Button>
        )}
      </div>
    </header>
  );
}
