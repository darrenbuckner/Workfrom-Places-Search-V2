import React, { useState, useEffect, useRef } from 'react';
import { 
  Focus, Users, Phone, Coffee, Sparkles, ArrowRight,
  Navigation, MapPin, Wifi, Battery, Volume2, ImageIcon,
  Video, Music, ChevronDown, Quote
} from 'lucide-react';
import StarRating from './StarRating';

// Add helper function for safely getting best work style
const getBestWorkStyle = (scores) => {
  if (!scores || typeof scores !== 'object') {
    return null;
  }
  
  const entries = Object.entries(scores || {});
  if (entries.length === 0) return null;
  
  const sorted = entries.sort(([,a], [,b]) => b - a);
  return sorted[0] ? sorted[0][0] : null;
};

// Add helper for score quality label
const getScoreLabel = (score) => {
  if (score >= 8) return "Excellent";
  if (score >= 6) return "Good";
  if (score >= 4) return "Fair";
  return "Limited";
};

const DEBUG = true;

const LoadingInsight = () => (
  <div className="mt-2 flex items-start gap-2 p-3 rounded-lg
    bg-[var(--bg-primary)] border border-[var(--border-primary)]">
    <Quote 
      size={16} 
      className="flex-shrink-0 text-[var(--accent-primary)] mt-0.5 animate-pulse" 
    />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-[var(--bg-secondary)] rounded w-3/4 animate-shimmer"></div>
      <div className="h-4 bg-[var(--bg-secondary)] rounded w-1/2 animate-shimmer"></div>
    </div>
  </div>
);

const PlaceCard = ({ 
  place, 
  isHighlighted, 
  onViewDetails, 
  workStyle, 
  insights,
  isAnalyzing 
}) => {
  // Get insights safely with null checks
  const placeInsight = insights?.places?.find(p => 
    String(p.id) === String(place.ID)
  );
  
  // Only show loading or insight for highlighted (best match) place
  const shouldShowInsight = isHighlighted;
  const userInsight = placeInsight?.userInsight;
  const showLoading = shouldShowInsight && isAnalyzing && !userInsight;
  const hasInsight = shouldShowInsight && Boolean(userInsight);

  const renderInsightSection = () => {
    if (!shouldShowInsight) return null;
    
    if (showLoading) {
      return <LoadingInsight />;
    }
    
    if (hasInsight) {
      return (
        <div className="mt-2 flex items-start gap-2 p-3 rounded-lg
          bg-[var(--bg-primary)] border border-[var(--border-primary)]">
          <Quote 
            size={16} 
            className="flex-shrink-0 text-[var(--accent-primary)] mt-0.5" 
          />
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {userInsight}
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
      <div className={`p-4 ${isHighlighted ? 'pb-5' : ''}`}>
        <div className="flex items-start gap-4">
          {/* Thumbnail */}
          <div 
            className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 
              bg-[var(--bg-tertiary)] transition-transform hover:scale-105
              border border-[var(--border-primary)]"
          >
            {place.thumbnail_img ? (
              <img
                src={place.thumbnail_img}
                alt={place.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = `/api/placeholder/80/80?text=No+image`;
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <ImageIcon size={20} className="text-[var(--text-tertiary)] mb-1" />
                <span className="text-xs text-[var(--text-tertiary)]">No image</span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {isHighlighted && (
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full 
                      bg-[var(--accent-primary)] text-[var(--button-text)]
                      text-xs font-medium w-fit mb-2"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Best Match</span>
                    </div>
                  )}
                  <h3 className={`text-lg font-semibold truncate
                    ${isHighlighted ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'}
                  `}>
                    {place.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-1.5">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-[var(--text-secondary)]" />
                      <span className="text-sm text-[var(--text-secondary)]">
                        {place.distance} miles away
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating score={place.workabilityScore} />
                      <span className="text-xs font-medium text-[var(--text-secondary)]">
                        {place.workabilityScore.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insight Section - Only shown for highlighted place */}
              {renderInsightSection()}
            </div>
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

const QuickMatchView = ({ 
  places, 
  onViewDetails, 
  radius, 
  analyzedPlaces,
  isAnalyzing 
}) => {
  const [selectedWorkStyle, setSelectedWorkStyle] = useState(null);
  const [displayCount, setDisplayCount] = useState(4);
  const scrollTargetRef = useRef(null);

  useEffect(() => {
    if (DEBUG) {
      console.group('QuickMatchView Data');
      console.log('Places count:', places?.length);
      console.log('Analyzed data:', analyzedPlaces);
      console.groupEnd();
    }
  }, [places, analyzedPlaces]);

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
        else if (type.includes('cafe')) score += 1;
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
        if (type.includes('cafe')) score += 1;
        break;

      case 'casual':
        if (hasCoffee) score += 2;
        if (hasFood) score += 2;
        if (hasOutdoor) score += 2;
        if (noise.includes('moderate')) score += 2;
        else if (noise.includes('lively')) score += 1;
        if (type.includes('cafe')) score += 1;
        break;

      default:
        return place.workabilityScore;
    }

    return score;
  };

  const getRecommendedPlaces = () => {
    if (!places.length) return [];

    if (!selectedWorkStyle) {
      return [...places]
        .sort((a, b) => b.workabilityScore - a.workabilityScore)
        .slice(0, displayCount);
    }

    const scoredPlaces = places.map(place => ({
      ...place,
      styleScore: calculateLocalScore(place, selectedWorkStyle)
    }));

    return scoredPlaces
      .sort((a, b) => {
        const styleScoreDiff = b.styleScore - a.styleScore;
        if (styleScoreDiff === 0) {
          return b.workabilityScore - a.workabilityScore;
        }
        return styleScoreDiff;
      })
      .slice(0, displayCount);
  };

  const recommendedPlaces = getRecommendedPlaces();
  const totalMatchingPlaces = selectedWorkStyle ? 
    places.filter(p => calculateLocalScore(p, selectedWorkStyle) >= 3).length : places.length;

  const hasMoreToShow = recommendedPlaces.length === displayCount && 
    displayCount < totalMatchingPlaces;

  const handleShowMore = () => {
    const newDisplayCount = Math.min(displayCount + 4, totalMatchingPlaces);
    setDisplayCount(newDisplayCount);
  };

  return (
    <div className="space-y-4 mb-24 sm:mb-16">
      {/* Work Style Filters */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4 -mb-2">
        <div className="flex items-center gap-2">
          {workStyles.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedWorkStyle(selectedWorkStyle === id ? null : id)}
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

      {/* Context Message */}
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
          Showing {Math.min(displayCount, recommendedPlaces.length)} of {totalMatchingPlaces} places within {radius} miles
        </div>
      )}

      {/* Place Cards */}
      <div className="space-y-3" ref={scrollTargetRef}>
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
						  workStyle={selectedWorkStyle}
						  insights={analyzedPlaces}
						  index={index}
						/>
          </div>
        ))}
      </div>

      {/* Show More Button */}
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