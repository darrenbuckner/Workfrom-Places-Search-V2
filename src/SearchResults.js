import React, { useState, useEffect, useMemo, useRef } from 'react';
import PlaceCard from './PlaceCard';
import Pagination from './Pagination';
import WorkfromVirtualAd from './WorkfromVirtualAd';

const SearchResults = ({ 
  places, 
  sortBy, 
  filters, 
  itemsPerPage, 
  viewMode, 
  onPhotoClick 
}) => {
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const controlsRef = useRef(null);
  const resultsRef = useRef(null);
  
  // Process and filter places
  const processedPlaces = useMemo(() => {
    if (!places.length) return [];
    
    const filtered = places.filter(place => {
      // Filter by type
      if (filters.type !== 'any' && place.type !== filters.type) {
        return false;
      }

      // Filter by noise level
      if (filters.noise !== 'any') {
        const noise = String(place.noise_level || place.noise || '').toLowerCase();
        if (filters.noise === 'quiet' && !noise.includes('quiet') && !noise.includes('low')) {
          return false;
        }
        if (filters.noise === 'moderate' && !noise.includes('moderate') && !noise.includes('average')) {
          return false;
        }
        if (filters.noise === 'noisy' && !noise.includes('noisy') && !noise.includes('high')) {
          return false;
        }
      }

      return true;
    });

    // Sort places if needed
    return sortBy === 'score_high' 
      ? filtered.sort((a, b) => b.workabilityScore - a.workabilityScore)
      : filtered;
  }, [places, sortBy, filters]);

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(processedPlaces.length / itemsPerPage));

  // Keep the current page within bounds when total pages changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Get current page items
  const currentItems = processedPlaces.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle page changes with improved scroll positioning
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    
    // Calculate scroll position with increased padding
    if (controlsRef.current) {
      // Get the header height and add padding
      const headerPadding = 120; // Increased padding for better visibility
      const controlsTop = controlsRef.current.getBoundingClientRect().top;
      const scrollPosition = window.pageYOffset + controlsTop - headerPadding;

      // Smooth scroll to the new position
      window.scrollTo({
        top: Math.max(0, scrollPosition), // Ensure we don't scroll past the top
        behavior: 'smooth'
      });
    }
  };

  return (
    <div ref={resultsRef}>
      {/* Scroll marker with increased padding */}
      <div ref={controlsRef} className="scroll-mt-32" /> {/* Increased scroll margin */}
      
      <div className="space-y-6">
        {currentItems.map((place, index) => (
          <React.Fragment key={place.ID}>
            {index > 0 && index % 5 === 0 && <WorkfromVirtualAd />}
            <PlaceCard
              place={place}
              onPhotoClick={() => onPhotoClick(place)}
            />
          </React.Fragment>
        ))}
      </div>

      {processedPlaces.length > itemsPerPage && (
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