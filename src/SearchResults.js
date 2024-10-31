import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sparkles } from 'lucide-react';
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
  const [quickMatchHeight, setQuickMatchHeight] = useState(0);

  const controlsRef = useRef(null);
  const resultsRef = useRef(null);
  const recommendedCardRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const quickMatchRef = useRef(null);

  const totalPages = Math.max(1, Math.ceil(places.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, places.length);
  const currentItems = places.slice(startIndex, endIndex);

  // Update QuickMatch height when it changes
  useEffect(() => {
    if (quickMatchRef.current) {
      const updateQuickMatchHeight = () => {
        const height = quickMatchRef.current?.offsetHeight || 0;
        setQuickMatchHeight(height);
      };

      updateQuickMatchHeight();
      window.addEventListener('resize', updateQuickMatchHeight);
      return () => window.removeEventListener('resize', updateQuickMatchHeight);
    }
  }, []);

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

  const scrollToRecommended = useCallback(() => {
    if (recommendedCardRef.current && !isPageChanging) {
      const isMobile = window.innerWidth < 640;
      
      // Get recommended card position and dimensions
      const cardRect = recommendedCardRef.current.getBoundingClientRect();
      
      // Calculate offsets based on device type
      const baseOffset = isMobile ? 100 : 180; // Increased offset for desktop
      const totalOffset = baseOffset + quickMatchHeight;
      
      // Calculate scroll position
      const currentScroll = window.pageYOffset;
      const elementPosition = currentScroll + cardRect.top;
      const scrollTarget = elementPosition - totalOffset;

      // Perform scroll
      window.scrollTo({
        top: Math.max(0, scrollTarget),
        behavior: 'smooth'
      });

      // Highlight animation
      setHighlightRecommended(true);
      setTimeout(() => setHighlightRecommended(false), 1500);
    }
  }, [isPageChanging, quickMatchHeight]);

  useEffect(() => {
    if (!recommendedPlaceName) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsRecommendedVisible(entry.isIntersecting);
      },
      {
        threshold: 0.5,
        rootMargin: window.innerWidth < 640 
          ? `-${quickMatchHeight + 150}px 0px -50px 0px`
          : `-${quickMatchHeight + 32}px 0px -20px 0px`
      }
    );

    if (recommendedCardRef.current) {
      observer.observe(recommendedCardRef.current);
    }

    return () => observer.disconnect();
  }, [recommendedPlaceName, currentPage, quickMatchHeight]);

  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.pageYOffset > 200 && !isRecommendedVisible && !isPageChanging;
      setShowScrollButton(shouldShow);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isRecommendedVisible, isPageChanging]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes buttonGlow {
        0%, 100% { box-shadow: 0 0 10px var(--accent-primary); }
        50% { box-shadow: 0 0 20px var(--accent-primary); }
      }
      @keyframes sparklesPulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div ref={resultsRef} className="relative pt-2">
      {/* QuickMatch height measurement div */}
      <div 
        ref={quickMatchRef} 
        className="absolute top-0 left-0 right-0 pointer-events-none"
        aria-hidden="true"
      />
      
      <div ref={controlsRef} className="scroll-mt-32" />
      
      <div className="space-y-6">
        {currentItems.map((place, index) => {
          const isRecommended = place.title === recommendedPlaceName;

          return (
            <React.Fragment key={place.ID}>
              {index > 0 && index % 5 === 0 && <WorkfromVirtualAd />}
              <div 
                ref={isRecommended ? recommendedCardRef : null}
                className={`
                  transition-transform duration-300
                  ${highlightRecommended && isRecommended ? 'scale-[1.02]' : ''}
                  ${isRecommended ? 'scroll-mt-[180px] sm:scroll-mt-[240px]' : ''}
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
            <Sparkles 
              size={18} 
              className="[animation:sparklesPulse_2s_ease-in-out_infinite]"
            />
          </div>
          <span className="text-sm font-medium whitespace-nowrap">
            View Best Match
          </span>
        </button>
      )}
    </div>
  );
};

export default SearchResults;