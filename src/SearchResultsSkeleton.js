import React from 'react';

const SearchResultsSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {[...Array(3)].map((_, index) => (
        <div 
          key={index}
          className="border rounded-lg shadow-sm border-[var(--border-primary)] bg-[var(--bg-primary)]"
        >
          <div className="p-4">
            <div className="flex flex-col space-y-4">
              {/* Header with Title and Score */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* AI Badge skeleton */}
                  <div className="w-20 h-5 rounded-full bg-[var(--bg-secondary)] mb-2" />
                  
                  {/* Title skeleton */}
                  <div className="h-7 bg-[var(--bg-secondary)] rounded-md w-3/4 mb-1" />
                  
                  {/* Distance skeleton */}
                  <div className="h-4 bg-[var(--bg-secondary)] rounded w-1/4" />
                </div>
                
                {/* Score Badge skeleton */}
                <div className="flex-shrink-0 w-12 h-12 rounded-md bg-[var(--bg-secondary)]" />
              </div>

              {/* Image section skeleton */}
              <div className="flex space-x-4">
                <div className="w-24 h-24 rounded bg-[var(--bg-secondary)] flex-shrink-0" />
              </div>

              {/* Actions section skeleton */}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                {/* User info skeleton */}
                <div className="flex items-center gap-2 flex-shrink">
                  <div className="w-4 h-4 rounded-full bg-[var(--bg-secondary)]" />
                  <div className="w-24 h-4 rounded bg-[var(--bg-secondary)]" />
                </div>
                
                {/* Directions button skeleton */}
                <div className="flex gap-2 flex-shrink-0">
                  <div className="w-28 h-6 rounded bg-[var(--bg-secondary)]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchResultsSkeleton;