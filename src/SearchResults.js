import React, { useState, useEffect, useCallback, useRef } from 'react';
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

const LoadingState = ({ progress, className = "" }) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const messages = [
    "Finding your perfect workspace...",
    "Analyzing local options...",
    "Checking community insights...",
    "Almost ready..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % messages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`mb-6 animate-fade-in ${className}`}>
      <div className="bg-[var(--bg-primary)] border border-[var(--accent-primary)] rounded-lg shadow-md overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--bg-secondary)]">
          <div 
            className="absolute top-0 left-0 h-full bg-[var(--accent-primary)] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2">
            <AIBadge />
          </div>
          
          <div className="flex items-center gap-3 mt-3">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center">
              <Loader className="w-4 h-4 text-[var(--accent-primary)] animate-spin" />
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)] transition-opacity duration-300">
              {messages[currentMessage]}
            </p>
          </div>

          <div className="mt-4 h-1 rounded-full overflow-hidden bg-[var(--bg-secondary)]">
            <div className="h-full bg-[var(--accent-primary)]/20 rounded-full shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
};

const NoResultsState = ({ onRetry, className = "" }) => (
  <div className={`mb-6 animate-fade-in ${className}`}>
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
  places,
  sortBy,
  filters,
  itemsPerPage = 10,
  viewMode,
  onPhotoClick,
  recommendedPlace,
  isAnalyzing,
  error,
  onRetry,
  onFilterChange,
  className = ""
}) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageChanging, setIsPageChanging] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const isMobileRef = useRef(window.innerWidth < 640);

  const controlsRef = useRef(null);
  const resultsRef = useRef(null);
  const recommendedCardRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  // Calculate pagination values
  const totalPages = Math.max(1, Math.ceil(places.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, places.length);
  const currentItems = places.slice(startIndex, endIndex);

  // Loading progress effect
  useEffect(() => {
    if (isAnalyzing) {
      setLoadingProgress(0);
      const startTime = Date.now();
      const duration = 8000;
      
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 90);
        
        if (progress >= 90) {
          clearInterval(interval);
        }
        
        setLoadingProgress(progress);
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const scrollToControls = useCallback(() => {
    if (controlsRef.current) {
      const headerPadding = 120;
      const controlsTop = controlsRef.current.getBoundingClientRect().top;
      const scrollPosition = window.pageYOffset + controlsTop - headerPadding;

      window.scrollTo({
        top: Math.max(0, scrollPosition),
        behavior: 'smooth'
      });
    }
  }, []);

  const handlePageChange = useCallback((newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) {
      return;
    }

    setIsPageChanging(true);
    setCurrentPage(newPage);

    requestAnimationFrame(() => {
      scrollTimeoutRef.current = setTimeout(() => {
        scrollToControls();
        setTimeout(() => {
          setIsPageChanging(false);
        }, 500);
      }, 50);
    });
  }, [currentPage, totalPages, scrollToControls]);

  // Early return for error state
  if (error) {
    return (
      <ErrorMessage
        error={error}
        onRetry={onRetry}
        variant="full"
        className={`mb-6 animate-fade-in ${className}`}
      />
    );
  }

  // Loading state
  if (isAnalyzing) {
    return <LoadingState progress={loadingProgress} className={className} />;
  }

  // No results state
  if (!isAnalyzing && places.length === 0) {
    return <NoResultsState onRetry={onRetry} className={className} />;
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={controlsRef} className="scroll-mt-32" />
      
      <div className="space-y-6">
        {currentItems.map((place, index) => {
          const isRecommended = recommendedPlace && place.ID === recommendedPlace.ID;

          return (
            <React.Fragment key={place.ID}>
              {index > 0 && index % 5 === 0 && <WorkfromVirtualAd />}
              <div 
                ref={isRecommended ? recommendedCardRef : null}
                className={isRecommended ? 'scroll-mt-[180px] sm:scroll-mt-[240px]' : ''}
              >
                <PlaceCard
                  place={place}
                  onPhotoClick={() => onPhotoClick(place)}
                  isRecommended={isRecommended}
                />
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          className="mt-6"
        />
      )}

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .shimmer {
          width: 100%;
          background-size: 200% 100%;
          background-image: linear-gradient(
            90deg, 
            transparent 0%, 
            var(--accent-primary) 50%, 
            transparent 100%
          );
          animation: shimmer 2s infinite linear;
        }
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
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SearchResults;