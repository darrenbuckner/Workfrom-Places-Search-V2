import React from 'react';
import { Quote } from 'lucide-react';

const LoadingInsight = () => (
  <div className="mt-2 flex items-start gap-2 p-3 rounded-lg
    bg-[var(--bg-primary)] border border-[var(--border-primary)]">
    <Quote 
      size={16} 
      className="flex-shrink-0 text-[var(--accent-primary)] mt-0.5 animate-pulse" 
    />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-[var(--bg-secondary)] rounded w-3/4 animate-shimmer"></div>
      <div className="h-4 bg-[var(--bg-secondary)] rounded w-1/2 animate-shimmer"></div>
    </div>
  </div>
);

export default LoadingInsight;