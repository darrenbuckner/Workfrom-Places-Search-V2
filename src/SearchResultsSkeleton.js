import React from 'react';
import { MapPin, Brain, Loader } from 'lucide-react';

const SearchResultsSkeleton = () => {
  return (
    <div className="space-y-4">
      {/* Location status loading state */}
      <div className="flex items-start gap-3 p-4 rounded-lg border border-blue-500 bg-blue-500/10">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
          <Loader className="w-4 h-4 text-white animate-spin" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-[var(--action-primary)]">
            Getting your location
          </div>
          <div className="text-sm text-[var(--text-secondary)] mt-0.5">
            Please allow location access if prompted
          </div>
        </div>
      </div>

      {/* Loading Content */}
      <div className="bg-[var(--bg-primary)] border border-[var(--accent-primary)] rounded-lg shadow-md overflow-hidden relative animate-pulse">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--bg-secondary)]">
          <div className="absolute top-0 left-0 h-full w-3/4 bg-[var(--accent-primary)] 
            transition-all duration-300 ease-out" />
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2">
            <div className="px-1.5 py-0.5 rounded-full bg-[var(--accent-primary)]/10 flex items-center gap-1">
              <Brain className="w-3 h-3 text-[var(--accent-primary)]" />
              <div className="text-xs font-medium text-[var(--accent-primary)]">
                AI Pick
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center">
              <Loader className="w-4 h-4 text-[var(--accent-primary)] animate-spin" />
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Finding your perfect workspace...
            </p>
          </div>
          <div className="mt-4 h-1 rounded-full overflow-hidden bg-[var(--bg-secondary)]">
            <div className="h-full w-3/4 bg-[var(--accent-primary)]/20 rounded-full shimmer" />
          </div>
        </div>
      </div>

      {/* Shimmer animation style */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .shimmer {
          background: linear-gradient(
            90deg,
            var(--accent-primary)/0.1 0%,
            var(--accent-primary)/0.2 50%,
            var(--accent-primary)/0.1 100%
          );
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default SearchResultsSkeleton;