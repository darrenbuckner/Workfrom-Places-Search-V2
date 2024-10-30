// SearchResults.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Brain } from 'lucide-react';
import PlaceCard from './PlaceCard';
import Pagination from './Pagination';
import WorkfromVirtualAd from './WorkfromVirtualAd';

const SearchResults = ({ 
  places, 
  sortBy, 
  filters, 
  itemsPerPage = 10, 
  viewMode, 
  onPhotoClick,
  recommendedPlaceName 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [highlightRecommended, setHighlightRecommended] = useState(false);
  const [isRecommendedVisible, setIsRecommendedVisible] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isPageChanging, setIsPageChanging] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const controlsRef = useRef(null);
  const resultsRef = useRef(null);
  const recommendedCardRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  const totalPages = Math.max(1, Math.ceil(places.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, places.length);
  const currentItems = places.slice(startIndex, endIndex);

  const getRecommendedPlaceInfo = useCallback(() => {
    if (!recommendedPlaceName) return null;
    
    const index = places.findIndex(place => place.title === recommendedPlaceName);
    if (index === -1) return null;
    
    const page = Math.floor(index / itemsPerPage) + 1;
    return { index, page };
  }, [places, recommendedPlaceName, itemsPerPage]);

  useEffect(() => {
    if (!hasInitialized && recommendedPlaceName) {
      const info = getRecommendedPlaceInfo();
      if (info) {
        if (info.page !== currentPage) {
          setCurrentPage(info.page);
        }
        setHasInitialized(true);
      }
    }
  }, [recommendedPlaceName, hasInitialized, getRecommendedPlaceInfo, currentPage]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const scrollToPosition = useCallback((element, offset = 0, retryCount = 0) => {
    if (!element || retryCount > 5) return;

    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = window.pageYOffset + elementPosition - offset;

    window.scrollTo({
      top: Math.max(0, offsetPosition),
      behavior: 'smooth'
    });

    // Verify scroll position after animation
    setTimeout(() => {
      const newPosition = element.getBoundingClientRect().top;
      if (Math.abs(newPosition - offset) > 10 && retryCount < 5) {
        scrollToPosition(element, offset, retryCount + 1);
      }
    }, 100);
  }, []);

  const scrollToControls = useCallback((retryCount = 0) => {
    if (controlsRef.current) {
      scrollToPosition(controlsRef.current, 120); // 120px header offset
    } else if (retryCount < 5) {
      // Retry if controls aren't mounted yet
      setTimeout(() => scrollToControls(retryCount + 1), 50);
    }
  }, [scrollToPosition]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) {
      return;
    }

    setIsPageChanging(true);
    setCurrentPage(newPage);

    // Wait for state update and DOM render
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToControls();
        
        // Reset page changing state after scroll completes
        setTimeout(() => {
          setIsPageChanging(false);
        }, 500);
      });
    });
  }, [currentPage, totalPages, scrollToControls]);

  const scrollToRecommended = useCallback(() => {
    if (recommendedCardRef.current && !isPageChanging) {
      scrollToPosition(recommendedCardRef.current, 100);
      setHighlightRecommended(true);
      setTimeout(() => setHighlightRecommended(false), 1500);
    }
  }, [isPageChanging, scrollToPosition]);

  // Watch recommended card visibility
  useEffect(() => {
    if (!recommendedPlaceName) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsRecommendedVisible(entry.isIntersecting);
      },
      {
        threshold: 0.5,
        rootMargin: '-100px 0px',
      }
    );

    if (recommendedCardRef.current) {
      observer.observe(recommendedCardRef.current);
    }

    return () => observer.disconnect();
  }, [recommendedPlaceName, currentPage]);

  // Handle scroll button visibility
  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.pageYOffset > 200 && !isRecommendedVisible && !isPageChanging;
      setShowScrollButton(shouldShow);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isRecommendedVisible, isPageChanging]);

  return (
    <div ref={resultsRef} className="relative pt-6">
      <div ref={controlsRef} className="scroll-mt-32" />
      
      <div className="space-y-6">
        {currentItems.map((place, index) => {
          const absoluteIndex = startIndex + index;
          const isRecommended = place.title === recommendedPlaceName;

          return (
            <React.Fragment key={place.ID}>
              {index > 0 && index % 5 === 0 && <WorkfromVirtualAd />}
              <div 
                ref={isRecommended ? recommendedCardRef : null}
                className={`
                  transition-transform duration-300
                  ${highlightRecommended && isRecommended ? 'scale-[1.02]' : ''}
                  ${isRecommended ? '-mt-4' : ''}
                `}
              >
                <PlaceCard
                  place={place}
                  onPhotoClick={() => onPhotoClick(place)}
                  isRecommended={isRecommended}
                  highlight={highlightRecommended && isRecommended}
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

      {showScrollButton && recommendedPlaceName && (
        <button
          onClick={() => {
            const info = getRecommendedPlaceInfo();
            if (info && info.page !== currentPage) {
              handlePageChange(info.page);
              // After page change and scroll, highlight recommended
              setTimeout(scrollToRecommended, 600);
            } else {
              scrollToRecommended();
            }
          }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-2.5 rounded-full
            bg-[var(--accent-primary)] text-white
            transform transition-all duration-200 hover:scale-105
            shadow-lg hover:shadow-xl
            hover:bg-[var(--accent-primary)]/90
            [animation:buttonGlow_2s_ease-in-out_infinite]"
          style={{
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="relative flex-shrink-0">
            <Brain 
              size={18} 
              className="[animation:brainPulse_2s_ease-in-out_infinite]"
            />
          </div>
          <span className="text-sm font-medium whitespace-nowrap">
            View AI Recommendation
          </span>
        </button>
      )}
    </div>
  );
};

export default SearchResults;