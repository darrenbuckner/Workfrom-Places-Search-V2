import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Brain, ArrowRight, Sparkles } from 'lucide-react';
import PlaceCard from './PlaceCard';
import Pagination from './Pagination';
import WorkfromVirtualAd from './WorkfromVirtualAd';

// AI Badge subcomponent
const AIBadge = ({ className = "" }) => (
  <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full 
    bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-medium ${className}`}>
    <Brain className="w-3 h-3" />
    <span>AI Pick</span>
  </div>
);

const IntegratedSearchResults = ({ 
  places, 
  sortBy, 
  filters, 
  itemsPerPage = 10, 
  viewMode, 
  onPhotoClick,
  recommendedPlaceName,
  recommendation,
  recommendedPlace,
  isAnalyzing
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageChanging, setIsPageChanging] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const isMobileRef = useRef(window.innerWidth < 640);

  const controlsRef = useRef(null);
  const resultsRef = useRef(null);
  const recommendedCardRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  const totalPages = Math.max(1, Math.ceil(places.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, places.length);
  const currentItems = places.slice(startIndex, endIndex);

  useEffect(() => {
    const handleResize = () => {
      isMobileRef.current = window.innerWidth < 640;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cleanup timeout on unmount
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

  const RecommendedCard = () => {
    if (!recommendation?.recommendation || !recommendedPlace || isAnalyzing) return null;

    // Get the recommendation data from the insights
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
                {recommendedPlace.workabilityScore}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full 
                  bg-[var(--accent-primary)] flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white animate-pulse" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <AIBadge />
                  <span className="text-sm text-[var(--text-secondary)]">
                    {recommendedPlace.distance} miles away
                  </span>
                </div>

                <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">
                  {recommendedPlace.title}
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
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative">      
      <div ref={controlsRef} className="scroll-mt-32" />
      
      <div className="space-y-6">
        {/* Recommended Card - Always show first if available */}
        <RecommendedCard />

        {/* Regular Results */}
        {currentItems.map((place, index) => {
          const isRecommended = place.title === recommendedPlaceName;

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

      <style jsx>{`
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

export default IntegratedSearchResults;