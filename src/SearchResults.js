import React, { useState, useEffect, useCallback, useRef } from 'react';
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

  return (
    <div className="relative">      
      <div ref={controlsRef} className="scroll-mt-32" />
      
      <div className="space-y-6">
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
    </div>
  );
};

export default SearchResults;