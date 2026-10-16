'use client';

import React, { useState, Suspense } from 'react';
import { Sidebar } from '@/components/navigation/sidebar';
import { AddOpportunityModal } from '@/components/opportunities/add-opportunity-modal';
import { EnvBanner } from '@/components/common/env-banner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <EnvBanner />

      <div className="flex flex-1 overflow-hidden">
        <Suspense fallback={<div className="w-60 border-r border-slate-200 bg-white" />}>
          <Sidebar
            onOpenAddModal={() => setIsAddModalOpen(true)}
            mobileOpen={mobileNavOpen}
            onMobileClose={() => setMobileNavOpen(false)}
          />
        </Suspense>

        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <Suspense
            fallback={
              <div className="flex-1 flex items-center justify-center p-12 text-xs text-slate-400">
                Loading...
              </div>
            }
          >
            {React.isValidElement(children)
              ? React.cloneElement(
                  children as React.ReactElement<{
                    onOpenAddModal?: () => void;
                    onOpenMobileNav?: () => void;
                  }>,
                  {
                    onOpenAddModal: () => setIsAddModalOpen(true),
                    onOpenMobileNav: () => setMobileNavOpen(true),
                  }
                )
              : children}
          </Suspense>
        </main>
      </div>

      <AddOpportunityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
