import React from 'react';
import { Brain, MapPin, List, Map, Loader } from 'lucide-react';
import { SearchPhases } from './constants';

const LoadingStateCard = ({ children }) => (
  <div className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4 animate-pulse">
    {children}
  </div>
);

const UnifiedLoadingState = ({ viewMode, searchPhase, locationName }) => {
  // Don't show anything in initial state
  if (searchPhase === SearchPhases.INITIAL) return null;

  const commonShimmer = "h-4 bg-[var(--bg-tertiary)] rounded";
  
  const ViewIcon = {
    insights: Brain,
    list: List,
    map: Map
  }[viewMode];

  // Show different content based on the search phase
  const isLocating = searchPhase === SearchPhases.LOCATING;
  const headerText = isLocating ? 'Getting your location...' : 'Finding nearby workspaces...';
  const subText = isLocating 
    ? 'Please allow location access if prompted'
    : locationName 
      ? `Searching in ${locationName}`
      : 'Searching your area';

  if (viewMode === 'insights') {
    return (
      <div className="space-y-4">
        <LoadingStateCard>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-primary)]/10 
              flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-[var(--accent-primary)]" />
            </div>
            <div className="flex-1">
              <div className="w-2/3 bg-[var(--bg-tertiary)] h-5 rounded mb-2" />
              <div className="w-1/2 bg-[var(--bg-tertiary)] h-4 rounded" />
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 rounded-lg bg-[var(--bg-tertiary)]" />
              ))}
            </div>
          </div>
        </LoadingStateCard>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <LoadingStateCard key={i}>
            <div className="flex gap-4">
              <div className="w-24 h-24 rounded-lg bg-[var(--bg-tertiary)] flex-shrink-0" />
              <div className="flex-1 space-y-4">
                <div className={`${commonShimmer} w-3/4`} />
                <div className={`${commonShimmer} w-1/4`} />
                <div className="flex gap-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className={`${commonShimmer} w-20`} />
                  ))}
                </div>
              </div>
            </div>
          </LoadingStateCard>
        ))}
      </div>
    );
  }

  if (viewMode === 'map') {
    return (
      <div className="rounded-lg border border-[var(--border-primary)] overflow-hidden">
        <div className="h-[500px] bg-[var(--bg-tertiary)] relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Map className="w-8 h-8 text-[var(--text-secondary)] mb-2 mx-auto" />
              <div className="text-[var(--text-secondary)]">Loading map...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Progress indicator that's shown above all views during loading
  return (
    <div className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4 mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--accent-primary)]/10 
          flex items-center justify-center">
          {isLocating ? (
            <MapPin className="w-5 h-5 text-[var(--accent-primary)]" />
          ) : (
            <ViewIcon className="w-5 h-5 text-[var(--accent-primary)]" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Loader className="w-4 h-4 text-[var(--accent-primary)] animate-spin" />
            <h3 className="font-medium text-[var(--text-primary)]">{headerText}</h3>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{subText}</p>
        </div>
      </div>
    </div>
  );
};

export default UnifiedLoadingState;