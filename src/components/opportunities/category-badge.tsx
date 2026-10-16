import React from 'react';
import { OpportunityCategory } from '@/types/database';
import { Badge } from '@/components/ui/badge';

interface CategoryBadgeProps {
  category: OpportunityCategory | string;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const getVariant = (cat: string) => {
    switch (cat) {
      case 'Internship':
        return 'blue';
      case 'Scholarship':
        return 'success';
      case 'Hackathon':
        return 'purple';
      case 'Fellowship':
        return 'warning';
      case 'Job':
        return 'default';
      default:
        return 'neutral';
    }
  };

  return (
    <Badge variant={getVariant(category)} className={className}>
      {category}
    </Badge>
  );
}
