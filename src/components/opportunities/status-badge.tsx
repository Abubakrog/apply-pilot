import React from 'react';
import { ApplicationStatus } from '@/types/database';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: ApplicationStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getVariant = (s: string) => {
    switch (s) {
      case 'Interested':
        return 'neutral';
      case 'Preparing':
        return 'blue';
      case 'Applied':
        return 'warning';
      case 'Interview':
        return 'purple';
      case 'Accepted':
        return 'success';
      case 'Rejected':
        return 'danger';
      case 'Withdrawn':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  return (
    <Badge variant={getVariant(status)} className={className}>
      <span className="mr-1 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </Badge>
  );
}
