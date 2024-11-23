import React, { useState, useEffect, useRef } from 'react';
import { 
  Focus, Users, Coffee, Sparkles, MapPin,
  ImageIcon, Video, Music, ChevronDown, Quote
} from 'lucide-react';
import StarRating from './StarRating';

const LoadingInsight = () => (
  <div className="flex items-start gap-2 p-2 mt-2 rounded-md
    bg-[var(--bg-primary)] border border-[var(--border-primary)]">
    <Quote 
      size={14} 
      className="flex-shrink-0 text-[var(--accent-primary)] mt-0.5 animate-pulse" 
    />
    <div className="flex-1 space-y-1.5">
      <p className="text-xs text-[var(--text-secondary)]">Loading Workspace Intelligence...</p>
      <div className="h-3 bg-[var(--bg-secondary)] rounded w-3/4 animate-shimmer"></div>
      <div className="h-3 bg-[var(--bg-secondary)] rounded w-1/2 animate-shimmer"></div>
    </div>
  </div>
);

const PlaceCard = ({ place, isHighlighted, onViewDetails, insights, isAnalyzing }) => {
  const placeInsight = insights?.places?.find(p => String(p.id) === String(place.ID));
  const shouldShowInsight = isHighlighted;
  const userInsight = placeInsight?.userInsight;
  const showLoading = shouldShowInsight && isAnalyzing && !userInsight;
  const hasInsight = shouldShowInsight && Boolean(userInsight);
  const [currentUserInsight, setCurrentUserInsight] = useState(userInsight);

  useEffect(() => {
    setCurrentUserInsight(userInsight);
  }, [userInsight]);

  const renderInsightSection = () => {
    if (!shouldShowInsight) return null;
    if (showLoading) return <LoadingInsight />;
    if (hasInsight) {
      return (
        <div className="flex items-start gap-2 p-2 mt-2 rounded-md
          bg-[var(--bg-primary)] border border-[var(--border-primary)]">
          <Quote 
            size={14} 
            className="flex-shrink-0 text-[var(--accent-primary)] mt-0.5" 
          />
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {currentUserInsight}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <button
      onClick={() => onViewDetails(place)}
      className={`
        relative w-full text-left rounded-lg border transition-all
        ${isHighlighted 
          ? 'border-[var(--accent-primary)] bg-gradient-to-br from-[var(--accent-primary)]/5 to-[var(--accent-primary)]/10' 
          : 'border-[var(--border-primary)] bg-[var(--bg-secondary)] hover:border-[var(--accent-primary)] hover:bg-[var(--bg-primary)]/50'
        }
      `}
    >
      <div className="p-3">
        <div className="flex items-start gap-3">
          <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 
            bg-[var(--bg-tertiary)] transition-transform hover:scale-105
            border border-[var(--border-primary)]">
            {place.thumbnail_img ? (
              <img
                src={place.thumbnail_img}
                alt={place.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = `/api/placeholder/64/64?text=No+image`;
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <ImageIcon size={16} className="text-[var(--text-tertiary)]" />
                <span className="text-[10px] text-[var(--text-tertiary)]">No image</span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-1">
              {isHighlighted && (
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full 
                  bg-[var(--accent-primary)] text-[var(--button-text)]
                  text-[10px] font-medium w-fit">
                  <Sparkles className="w-3 h-3" />
                  <span>Best Match</span>
                </div>
              )}
              <h3 className={`text-base font-semibold truncate leading-tight
                ${isHighlighted ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'}`}>
                {place.title}
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <MapPin size={12} className="text-[var(--text-secondary)]" />
                  <span className="text-xs text-[var(--text-secondary)]">
                    {place.distance} miles
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <StarRating score={place.workabilityScore} variant="small" />
                  <span className="text-xs font-medium text-[var(--text-secondary)]">
                    {place.workabilityScore.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
            {renderInsightSection()}
          </div>
        </div>
      </div>

      {isHighlighted && (
        <>
          <div className="absolute -top-px left-0 right-0 h-1 bg-[var(--accent-primary)]" />
          <div className="absolute -left-px top-1 bottom-0 w-1 bg-[var(--accent-primary)]" />
        </>
      )}
    </button>
  );
};

const QuickMatchView = ({ places, onViewDetails, radius, analyzedPlaces, isAnalyzing, onAnalyze }) => {
  const INITIAL_DISPLAY_COUNT = 4;
  const [selectedWorkStyle, setSelectedWorkStyle] = useState(null);
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);
  const lastAnalyzedPlaceId = useRef(null);
  const scrollContainerRef = useRef(null);
  const newContentRef = useRef(null);
  const lastDisplayedCount = useRef(INITIAL_DISPLAY_COUNT);

  // Reset display count when work style changes
  const handleWorkStyleChange = (workStyle) => {
    setSelectedWorkStyle(workStyle === selectedWorkStyle ? null : workStyle);
    setDisplayCount(INITIAL_DISPLAY_COUNT);
    lastDisplayedCount.current = INITIAL_DISPLAY_COUNT;
    // Scroll back to top of container
    scrollContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const workStyles = [
    { id: 'casual', label: 'Casual', icon: Coffee },
    { id: 'lively', label: 'Lively', icon: Music },
    { id: 'focus', label: 'Focus', icon: Focus },
    { id: 'group', label: 'Group', icon: Users },
    { id: 'video', label: 'Video Calls', icon: Video }
  ];

  const calculateLocalScore = (place, workStyle) => {
    let score = 0;
    const noise = String(place.noise_level || place.noise || '').toLowerCase();
    const wifiSpeed = place.download ? parseInt(place.download) : 0;
    const hasPower = place.power?.toLowerCase().includes('range3') || 
      place.power?.toLowerCase().includes('good');
    const hasFood = place.food === "1";
    const hasCoffee = place.coffee === "1";
    const hasOutdoor = place.outdoor_seating === "1" || place.outside === "1";
    const type = String(place.type || '').toLowerCase();

    switch (workStyle) {
      case 'focus':
        if (noise.includes('quiet')) score += 3;
        else if (noise.includes('moderate')) score += 1;
        if (hasPower) score += 2;
        if (wifiSpeed >= 25) score += 2;
        else if (wifiSpeed >= 10) score += 1;
        if (type.includes('library')) score += 2;
        else if (type.includes('coworking')) score += 1;
        break;

      case 'group':
        if (hasFood) score += 2;
        if (hasCoffee) score += 1;
        if (hasOutdoor) score += 1;
        if (noise.includes('moderate') || noise.includes('lively')) score += 2;
        if (type.includes('coworking')) score += 2;
        else if (type.includes('commercial')) score += 1;
        if (hasPower) score += 1;
        break;

      case 'video':
        if (wifiSpeed >= 50) score += 3;
        else if (wifiSpeed >= 25) score += 2;
        if (noise.includes('quiet')) score += 3;
        else if (noise.includes('moderate')) score += 1;
        if (hasPower) score += 2;
        if (type.includes('coworking')) score += 1;
        break;

      case 'lively':
        if (noise.includes('noisy') || noise.includes('lively')) score += 3;
        else if (noise.includes('moderate')) score += 2;
        if (hasFood) score += 2;
        if (hasCoffee) score += 1;
        if (hasOutdoor) score += 2;
        if (type.includes('commercial')) score += 1;
        break;

      case 'casual':
        if (hasCoffee) score += 2;
        if (hasFood) score += 2;
        if (hasOutdoor) score += 2;
        if (noise.includes('moderate')) score += 2;
        else if (noise.includes('lively')) score += 1;
        if (type.includes('commercial')) score += 1;
        break;

      default:
        return place.workabilityScore;
    }

    return score;
  };

  const getRecommendedPlaces = () => {
    if (!places.length) return [];

    const scoredPlaces = places.map(place => ({
      ...place,
      styleScore: calculateLocalScore(place, selectedWorkStyle)
    }));

    scoredPlaces.sort((a, b) => {
      const styleScoreDiff = b.styleScore - a.styleScore;
      if (styleScoreDiff === 0) {
        return b.workabilityScore - a.workabilityScore;
      }
      return styleScoreDiff;
    });

    // Filter places based on selected work style
    const filteredPlaces = selectedWorkStyle
      ? scoredPlaces.filter(p => p.styleScore >= 3)
      : scoredPlaces;

    // Return the top `displayCount` places
    return filteredPlaces.slice(0, displayCount);
  };

  const recommendedPlaces = getRecommendedPlaces();
  const bestMatch = recommendedPlaces[0];
  const totalMatchingPlaces = selectedWorkStyle
    ? places.filter(p => calculateLocalScore(p, selectedWorkStyle) >= 3).length
    : places.length;
  const currentlyShowing = recommendedPlaces.length;
  const hasMoreToShow = currentlyShowing === displayCount && displayCount < totalMatchingPlaces;

  const scrollToNewContent = () => {
    if (newContentRef.current) {
      // Get the first new item
      const firstNewItem = newContentRef.current.querySelector(
        `.place-card:nth-child(${lastDisplayedCount.current + 1})`
      );

      if (firstNewItem) {
        // Use requestAnimationFrame to ensure DOM has updated
        requestAnimationFrame(() => {
          firstNewItem.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
          });
        });
      }
    }
  };

  const handleShowMore = () => {
    const prevCount = displayCount;
    const nextCount = Math.min(displayCount + 4, totalMatchingPlaces);
    setDisplayCount(nextCount);

    // Wait for new content to render
    requestAnimationFrame(() => {
      // Find the first new item
      const container = scrollContainerRef.current;
      if (!container) return;

      const cards = container.querySelectorAll('.place-card');
      const firstNewCard = cards[prevCount];
      
      if (firstNewCard) {
        const containerTop = container.getBoundingClientRect().top;
        const cardTop = firstNewCard.getBoundingClientRect().top;
        const offset = cardTop - containerTop - 20; // 20px padding

        window.scrollTo({
          top: window.scrollY + offset,
          behavior: 'smooth'
        });
      }
    });
  };

  useEffect(() => {
    if (displayCount > lastDisplayedCount.current) {
      // Wait for the new content to render and animate in
      const scrollTimeout = setTimeout(() => {
        scrollToNewContent();
        lastDisplayedCount.current = displayCount;
      }, 100); // Small delay to account for render and animation start

      return () => clearTimeout(scrollTimeout);
    }
  }, [displayCount]);

  useEffect(() => {
    if (bestMatch && 
        !isAnalyzing && 
        !analyzedPlaces?.places?.some(p => p.id === bestMatch.ID) &&
        lastAnalyzedPlaceId.current !== bestMatch.ID) {
      lastAnalyzedPlaceId.current = bestMatch.ID;
      onAnalyze([bestMatch]);
    }
  }, [bestMatch?.ID, isAnalyzing, analyzedPlaces, onAnalyze, selectedWorkStyle]);

  useEffect(() => {
    // Clear the lastAnalyzedPlaceId when the selectedWorkStyle changes
    // to ensure the next best match is analyzed
    lastAnalyzedPlaceId.current = null;
  }, [selectedWorkStyle]);

  return (
    <div className="space-y-4 mb-24 sm:mb-16" ref={scrollContainerRef}>
      <div className="overflow-x-auto pb-2 -mx-4 px-4 -mb-2">
        <div className="flex items-center gap-2">
          {workStyles.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleWorkStyleChange(id)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg border transition-all
                ${selectedWorkStyle === id
                  ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]' 
                  : 'border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)]'
                }
              `}
            >
              <Icon size={16} />
              <span className="text-sm font-medium whitespace-nowrap">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg 
        bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
        <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
        <span className="text-[var(--text-secondary)]">
          {selectedWorkStyle 
            ? `Best matches for ${selectedWorkStyle} work`
            : 'Highest rated workspaces'}
        </span>
      </div>

      {selectedWorkStyle && totalMatchingPlaces > 0 && (
			  <div className="text-sm text-[var(--text-secondary)]">
			    {currentlyShowing === totalMatchingPlaces ? (
			      `Showing all ${currentlyShowing} places within ${radius} miles`
			    ) : (
			      `Showing ${currentlyShowing} of ${totalMatchingPlaces} places within ${radius} miles`
			    )}
			  </div>
			)}

      <div className="space-y-3">
        {recommendedPlaces.map((place, index) => (
          <div
            key={place.ID}
            className="place-card transform transition-all duration-300 ease-out"
            style={{
              animation: index >= displayCount - 4 
                ? `fadeSlideIn 0.3s ease-out ${index % 4 * 0.1}s both` 
                : 'none'
            }}
          >
            <PlaceCard
              place={place}
              isHighlighted={index === 0}
              onViewDetails={onViewDetails}
              insights={analyzedPlaces}
              isAnalyzing={isAnalyzing}
            />
          </div>
        ))}
      </div>

      {hasMoreToShow && (
        <button
          onClick={handleShowMore}
          className="w-full mt-4 p-3 rounded-lg border border-dashed
            border-[var(--border-primary)] bg-[var(--bg-secondary)]
            hover:border-[var(--accent-primary)] hover:bg-[var(--bg-primary)]
            text-[var(--text-secondary)] hover:text-[var(--accent-primary)]
            transition-all duration-200 group"
        >
          <div className="flex items-center justify-center gap-2">
            <ChevronDown 
              size={18} 
              className="transform group-hover:translate-y-0.5 transition-transform"
            />
            <span className="text-sm font-medium">
              Show {Math.min(4, totalMatchingPlaces - displayCount)} More Places
            </span>
          </div>
        </button>
      )}

      <style jsx>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <style jsx global>{`
        @keyframes loadingPulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
          100% {
            opacity: 1;
          }
        }

        .loading-pulse {
          animation: loadingPulse 1.5s ease-in-out infinite;
        }

        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default QuickMatchView;