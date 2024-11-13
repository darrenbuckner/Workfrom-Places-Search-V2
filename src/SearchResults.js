import React from 'react';
import { Brain, Loader, Sparkles, AlertTriangle } from 'lucide-react';
import PlaceCard from './PlaceCard';
import Pagination from './Pagination';
import WorkfromVirtualAd from './WorkfromVirtualAd';
import ErrorMessage from './ErrorMessage';

const AIBadge = ({ className = "" }) => (
  <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full 
    bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-medium ${className}`}>
    <Brain className="w-3 h-3" />
    <span>AI Pick</span>
  </div>
);

const SkeletonPlaceCard = () => (
  <div className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
    <div className="p-4 animate-pulse">
      <div className="flex items-start gap-4">
        {/* Thumbnail skeleton */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-[var(--bg-tertiary)] flex-shrink-0" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              {/* Title skeleton */}
              <div className="h-6 bg-[var(--bg-tertiary)] rounded w-3/4 mb-2" />
              {/* Distance skeleton */}
              <div className="h-4 bg-[var(--bg-tertiary)] rounded w-1/4" />
            </div>
            {/* Score skeleton */}
            <div className="w-12 h-12 rounded-lg bg-[var(--bg-tertiary)] flex-shrink-0" />
          </div>

          {/* Metrics skeleton */}
          <div className="mt-3 space-y-2">
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 bg-[var(--bg-tertiary)] rounded w-24" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actions skeleton */}
      <div className="flex gap-2 mt-4">
        <div className="h-9 bg-[var(--bg-tertiary)] rounded w-32" />
        <div className="h-9 bg-[var(--bg-tertiary)] rounded w-28" />
      </div>
    </div>
  </div>
);

const NoResultsState = ({ onRetry, className = "" }) => (
  <div className={`mb-6 animate-fadeIn ${className}`}>
    <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-[var(--accent-primary)]" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">
            No Places Found
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">
            We couldn't find any workspaces matching your criteria. Try adjusting your filters or search in a different area.
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-sm font-medium text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

const SearchResults = ({ 
  places = [],
  sortBy,
  filters,
  itemsPerPage = 10,
  viewMode,
  onPhotoClick,
  isLoading = false,
  error,
  onRetry,
  onFilterChange,
  className = ""
}) => {
  const [currentPage, setCurrentPage] = React.useState(1);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy]);

  // Calculate pagination values
  const totalPages = Math.max(1, Math.ceil(places.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, places.length);
  const currentItems = places.slice(startIndex, endIndex);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        {[...Array(3)].map((_, index) => (
          <SkeletonPlaceCard key={index} />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <ErrorMessage
        error={error}
        onRetry={onRetry}
        className={`mb-6 animate-fadeIn ${className}`}
      />
    );
  }

  // No results state
  if (!isLoading && places.length === 0) {
    return <NoResultsState onRetry={onRetry} className={className} />;
  }

  return (
    <div className={`relative ${className}`}>
      <div className="space-y-6">
        {currentItems.map((place, index) => (
          <React.Fragment key={place.ID}>
            {index > 0 && index % 5 === 0 && <WorkfromVirtualAd />}
            <div className="animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
              <PlaceCard
                place={place}
                onPhotoClick={() => onPhotoClick(place)}
              />
            </div>
          </React.Fragment>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className="mt-6"
        />
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .shimmer {
          background-size: 200% 100%;
          background-image: linear-gradient(
            90deg,
            transparent 0%,
            var(--accent-primary) 50%,
            transparent 100%
          );
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default SearchResults;