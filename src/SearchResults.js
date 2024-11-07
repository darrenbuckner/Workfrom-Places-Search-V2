import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Brain, Loader, Sparkles } from 'lucide-react';
import SearchResultsSkeleton from './SearchResultsSkeleton';
import PlaceCard from './PlaceCard';
import Pagination from './Pagination';
import WorkfromVirtualAd from './WorkfromVirtualAd';

const AIBadge = ({ className = "" }) => (
  <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full 
    bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-medium ${className}`}>
    <Brain className="w-3 h-3" />
    <span>AI Pick</span>
  </div>
);

const LoadingState = ({ progress }) => {
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
    <div className="mb-6 animate-fade-in">
      <div className="bg-[var(--bg-primary)] border border-[var(--accent-primary)] rounded-lg shadow-md overflow-hidden relative">
        {/* Top Progress Bar */}
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

          {/* Subtle Loading Bar */}
          <div className="mt-4 h-1 rounded-full overflow-hidden bg-[var(--bg-secondary)]">
            <div 
              className="h-full bg-[var(--accent-primary)]/20 rounded-full shimmer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const SearchResults = ({ 
  places, 
  sortBy, 
  filters, 
  itemsPerPage = 10, 
  viewMode, 
  onPhotoClick,
  recommendedPlaceId,
  recommendation,
  recommendedPlace,
  isAnalyzing,
  isUsingSavedLocation
}) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageChanging, setIsPageChanging] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const isMobileRef = useRef(window.innerWidth < 640);

  // Calculate pagination values
  const totalPages = Math.max(1, Math.ceil(places.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, places.length);
  const currentItems = places.slice(startIndex, endIndex);

  const shouldShowLoading = isAnalyzing && !isUsingSavedLocation;

  // Loading progress effect
  useEffect(() => {
    if (shouldShowLoading) {
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
  }, [shouldShowLoading]);

  const controlsRef = useRef(null);
  const resultsRef = useRef(null);
  const recommendedCardRef = useRef(null);

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
      scrollToControls();
      setTimeout(() => {
        setIsPageChanging(false);
      }, 500);
    });
  }, [currentPage, totalPages, scrollToControls]);

  return (
    <div className="relative">      
      <div ref={controlsRef} className="scroll-mt-32" />
      
      <div className="space-y-6">
        {shouldShowLoading ? (
          <>
            <LoadingState progress={loadingProgress} />
            <SearchResultsSkeleton />
          </>
        ) : recommendation?.recommendation && recommendedPlace ? (
          <RecommendedCard 
            recommendation={recommendation} 
            place={recommendedPlace} 
            onPhotoClick={onPhotoClick}
          />
        ) : null}

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
          background-image: linear-gradient(90deg, transparent 0%, var(--accent-primary) 50%, transparent 100%);
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

// Separate RecommendedCard component
const RecommendedCard = ({ recommendation, place, onPhotoClick }) => {
  const recData = recommendation.recommendation;
  const description = recData.headline || recData.context;

  return (
    <div className="mb-6 animate-fade-in">
      <div className="bg-[var(--bg-primary)] border border-[var(--accent-primary)] rounded-lg shadow-md overflow-hidden">
        <div className="p-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-md relative
              bg-[var(--accent-primary)] text-white
              flex items-center justify-center font-bold text-xl">
              {place.workabilityScore}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full 
                bg-[var(--accent-primary)] flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white animate-pulse" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <AIBadge />
                <span className="text-sm text-[var(--text-secondary)]">
                  {place.distance} miles away
                </span>
              </div>

              <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">
                {place.title}
              </h3>

              {description && (
                <p className="text-sm font-medium text-[var(--text-primary)] mb-2">
                  {description}
                </p>
              )}

              {recData.personalNote && (
                <p className="text-sm text-[var(--text-secondary)] mb-3">
                  {recData.personalNote}
                </p>
              )}

              {recData.standoutFeatures?.length > 0 && (
                <div className="text-xs text-[var(--text-secondary)] space-y-1.5">
                  {recData.standoutFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                      <span>{typeof feature === 'string' ? feature : feature.description}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => onPhotoClick(place)}
                className="mt-4 text-sm font-medium text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] 
                  transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;