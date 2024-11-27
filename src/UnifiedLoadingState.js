import React, { useState, useEffect } from 'react';
import { Loader, Sparkles } from 'lucide-react';

const LoadingStateCard = ({ children }) => (
  <div className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4 animate-pulse">
    {children}
  </div>
);

const MetricBadgeSkeleton = () => (
  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md
    bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
    <div className="w-3.5 h-3.5 rounded-full bg-[var(--bg-primary)]" />
    <div className="w-16 h-3.5 rounded bg-[var(--bg-primary)]" />
  </div>
);

const WorkStyleButtonSkeleton = () => (
  <div className="flex items-center gap-2 px-3 py-2 rounded-lg border 
    border-[var(--border-primary)] bg-[var(--bg-tertiary)]
    min-w-[100px]">
    <div className="w-4 h-4 rounded bg-[var(--bg-primary)]" />
    <div className="w-16 h-4 rounded bg-[var(--bg-primary)]" />
  </div>
);

const PlaceCardSkeleton = ({ isHighlighted }) => (
  <div className={`
    relative rounded-lg border transition-all
    ${isHighlighted 
      ? 'border-[var(--accent-primary)] bg-gradient-to-br from-[var(--accent-primary)]/5 to-[var(--accent-primary)]/10' 
      : 'border-[var(--border-primary)] bg-[var(--bg-secondary)]'
    }
  `}>
    <div className="p-3">
      <div className="flex items-start gap-3">
        {/* Thumbnail */}
        <div className="w-16 h-16 rounded-md bg-[var(--bg-tertiary)] flex-shrink-0" />

        <div className="flex-1 min-w-0">
          {/* Title and Badge */}
          <div className="flex flex-col gap-1">
            {isHighlighted && (
              <div className="w-20 h-5 rounded-full bg-[var(--bg-tertiary)]" />
            )}
            <div className="h-6 bg-[var(--bg-tertiary)] rounded-md w-3/4" />
            
            {/* Metrics */}
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[var(--bg-tertiary)]" />
                <div className="w-16 h-4 rounded bg-[var(--bg-tertiary)]" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-3 h-3 rounded-full bg-[var(--bg-tertiary)]" />
                  ))}
                </div>
                <div className="w-8 h-4 rounded bg-[var(--bg-tertiary)]" />
              </div>
            </div>
          </div>

          {/* Insight Box for Highlighted Card */}
          {isHighlighted && (
            <div className="flex items-start gap-2 p-2 mt-2 rounded-md
              bg-[var(--bg-primary)] border border-[var(--border-primary)]">
              <div className="w-3.5 h-3.5 rounded-full bg-[var(--bg-tertiary)] flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-[var(--bg-tertiary)] rounded w-3/4" />
                <div className="h-3 bg-[var(--bg-tertiary)] rounded w-1/2" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    {isHighlighted && (
      <>
        <div className="absolute -top-px left-0 right-0 h-1 bg-[var(--accent-primary)]" />
        <div className="absolute -left-px top-1 bottom-0 w-1 bg-[var(--accent-primary)]" />
      </>
    )}
  </div>
);

const UnifiedLoadingState = ({ viewMode, searchPhase, locationName }) => {
  const [loadingText, setLoadingText] = useState({
    phase: 'searching',
    message: 'Finding workspaces nearby...'
  });
  
  useEffect(() => {
    const messages = [
      { phase: 'searching', message: 'Finding workspaces nearby...' },
      { phase: 'analyzing', message: 'Analyzing workspace details...' },
      { phase: 'preparing', message: 'Preparing recommendations...' }
    ];
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      setLoadingText(messages[currentIndex]);
      currentIndex = (currentIndex + 1) % messages.length;
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (searchPhase === 'initial') return null;

  return (
    <div className="space-y-4">
      {/* Progress Indicator */}
      <LoadingStateCard>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--accent-primary)]/10 
            flex items-center justify-center">
            <Loader className="w-5 h-5 text-[var(--accent-primary)] animate-spin" />
          </div>
          <div className="flex-1">
            <div className="flex flex-col">
              <h3 className="font-medium text-[var(--text-primary)]">
                {loadingText.message}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {locationName ? `Searching in ${locationName}` : 'Searching your area'}
              </p>
            </div>
          </div>
        </div>
      </LoadingStateCard>

      {/* Work Style Filters Skeleton */}
      <div className="space-y-4">
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex items-center gap-2">
            {[...Array(6)].map((_, i) => (
              <WorkStyleButtonSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Context Bar Skeleton */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg 
          bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
          <Sparkles className="w-4 h-4 text-[var(--accent-primary)] flex-shrink-0" />
          <div className="h-4 bg-[var(--bg-tertiary)] rounded w-48" />
        </div>
      </div>

      {/* Place Cards Skeleton */}
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <PlaceCardSkeleton key={i} isHighlighted={i === 0} />
        ))}
      </div>
    </div>
  );
};

export default UnifiedLoadingState;