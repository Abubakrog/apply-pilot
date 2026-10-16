import React, { Suspense } from 'react';
import OpportunityDetailClient from './detail-client';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OpportunityDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-12 text-xs text-slate-400">
          Loading opportunity details...
        </div>
      }
    >
      <OpportunityDetailClient id={resolvedParams.id} />
    </Suspense>
  );
}
