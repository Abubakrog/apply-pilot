'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store/app-context';
import {
  LayoutDashboard,
  Briefcase,
  UserCheck,
  Settings,
  Plus,
  LogOut,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  onOpenAddModal?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ onOpenAddModal, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, signOut, isDemoMode, isSupabaseReady } = useApp();

  const navLinks = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      name: 'Opportunities',
      href: '/opportunities',
      icon: <Briefcase className="h-4 w-4" />,
    },
    {
      name: 'Profile Vault',
      href: '/profile',
      icon: <UserCheck className="h-4 w-4" />,
    },
    {
      name: 'Settings & Alerts',
      href: '/settings',
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 transition-transform duration-200 md:static md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand / Logo */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-2" onClick={onMobileClose}>
            <div className="h-6 w-6 rounded bg-slate-900 dark:bg-slate-50 flex items-center justify-center text-white dark:text-slate-950 text-xs font-bold tracking-wider">
              AP
            </div>
            <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-slate-100">
              Apply<span className="text-blue-600">Pilot</span>
            </span>
          </Link>

          {isDemoMode && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              Demo
            </span>
          )}
        </div>

        {/* Quick Action Button */}
        {onOpenAddModal && (
          <div className="p-3">
            <Button
              onClick={() => {
                onOpenAddModal();
                if (onMobileClose) onMobileClose();
              }}
              size="sm"
              className="w-full justify-start text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Opportunity
            </Button>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 space-y-0.5 px-3 py-2">
          {navLinks.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200'
                )}
              >
                <span className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Environment Status Badge */}
        <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800">
          <div className="rounded-md bg-slate-50 dark:bg-slate-900/50 p-2 text-[11px] text-slate-500 border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-slate-700 dark:text-slate-300">Sync Status</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              {isSupabaseReady
                ? 'Supabase Cloud Connected'
                : 'Local / Offline Reactive Store'}
            </p>
          </div>
        </div>

        {/* Footer User Info */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-medium text-slate-700 dark:text-slate-300 shrink-0">
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-xs font-medium text-slate-900 dark:text-slate-100">
                {user?.name || 'Applicant'}
              </p>
              <p className="truncate text-[10px] text-slate-400">{user?.email || 'Logged in'}</p>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </aside>
    </>
  );
}
