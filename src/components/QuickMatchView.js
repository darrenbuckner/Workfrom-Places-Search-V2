import React, { useState, useEffect } from 'react';
import { 
  Focus, Users, Phone, Coffee, Sparkles, ArrowRight,
  Navigation, MapPin, Wifi, Battery, Volume2, ImageIcon,
  Video, Music, ChevronDown
} from 'lucide-react';

// Component for displaying metric badges
const MetricBadge = ({ icon: Icon, label, variant }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-400/10';
      case 'warning':
        return 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-400/10';
      case 'error':
        return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-400/10';
      default:
        return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-400/10';
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs ${getVariantStyles()}`}>
      <Icon size={12} />
      <span className="font-medium">{label}</span>
    </div>
  );
};

// Card component for displaying place information
const PlaceCard = ({ place, isHighlighted, onViewDetails }) => {
  if (!place) return null;

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
          <div className={`
            w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 
            bg-[var(--bg-tertiary)] transition-transform hover:scale-105
            border ${isHighlighted ? 'border-[var(--accent-primary)]/25' : 'border-[var(--border-primary)]'}
          `}>
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

          {/* Content */}
          <div className="flex-1 min-w-0">
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
                <div className="flex items-center justify-between mt-1.5">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} className={
                      isHighlighted ? 'text-[var(--accent-primary)]/75' : 'text-[var(--text-secondary)]'
                    } />
                    <span className={
                      isHighlighted ? 'text-sm text-[var(--accent-primary)]/75' : 'text-sm text-[var(--text-secondary)]'
                    }>
                      {place.distance} miles away
                    </span>
                  </div>
                  <div className={`
                    flex items-center gap-1.5 px-2 py-0.5 rounded-md text-sm font-medium
                    ${isHighlighted 
                      ? 'bg-[var(--accent-primary)] text-[var(--button-text)]' 
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'}
                  `}>
                    {place.workabilityScore}/10
                  </div>
                </div>
              </div>
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

const calculateLocalScore = (place, workStyle) => {
  const noise = String(place.noise_level || place.noise || '').toLowerCase();
  const wifiSpeed = place.download ? parseInt(place.download) : 0;
  const hasPower = place.power?.toLowerCase().includes('range3') || 
                  place.power?.toLowerCase().includes('good');
  const type = String(place.type || '').toLowerCase();
  const hasFood = place.food === "1";
  const hasCoffee = place.coffee === "1";
  const hasOutdoor = place.outdoor_seating === "1" || place.outside === "1";

  let score = 0;

  switch (workStyle) {
    case 'focus':
      score += noise.includes('quiet') ? 4 : noise.includes('moderate') ? 2 : 0;
      score += hasPower ? 3 : 0;
      score += wifiSpeed >= 25 ? 3 : wifiSpeed >= 10 ? 2 : 0;
      score += type.includes('library') ? 2 : type.includes('coworking') ? 1 : 0;
      break;

    case 'group':
      score += hasFood ? 3 : 0;
      score += hasCoffee ? 2 : 0;
      score += hasOutdoor ? 2 : 0;
      score += (noise.includes('moderate') || noise.includes('noisy')) ? 3 : 0;
      score += type.includes('coworking') ? 2 : type.includes('cafe') ? 1 : 0;
      score += wifiSpeed >= 25 ? 1 : 0;
      break;

    case 'video':
      score += wifiSpeed >= 50 ? 5 : wifiSpeed >= 25 ? 3 : wifiSpeed >= 10 ? 1 : 0;
      score += noise.includes('quiet') ? 4 : noise.includes('moderate') ? 2 : 0;
      score += hasPower ? 2 : 0;
      score += type.includes('coworking') ? 2 : 0;
      break;

    case 'casual':
      score += hasCoffee ? 3 : 0;
      score += hasFood ? 2 : 0;
      score += hasOutdoor ? 2 : 0;
      score += noise.includes('moderate') ? 2 : noise.includes('lively') ? 1 : 0;
      score += type.includes('cafe') ? 2 : type.includes('coworking') ? 1 : 0;
      score += wifiSpeed >= 10 ? 1 : 0;
      break;

    case 'lively':
      score += noise.includes('noisy') || noise.includes('lively') ? 4 :
               noise.includes('moderate') ? 2 : 0;
      score += hasFood ? 2 : 0;
      score += hasCoffee ? 2 : 0;
      score += hasOutdoor ? 2 : 0;
      score += type.includes('cafe') || type.includes('coffee') ? 2 :
               type.includes('commercial') ? 1 : 0;
      score += wifiSpeed >= 25 ? 1 : 0;
      score += hasPower ? 1 : 0;
      break;

    default:
      return place.workabilityScore || 5;
  }

  return Math.min(10, score);
};

const QuickMatchView = ({ places, onViewDetails }) => {
  const [selectedWorkStyle, setSelectedWorkStyle] = useState(null);
  const [displayCount, setDisplayCount] = useState(4);

  useEffect(() => {
    setDisplayCount(4);
  }, [selectedWorkStyle]);

  const workStyles = [
    { id: 'casual', label: 'Casual', icon: Coffee },
    { id: 'lively', label: 'Lively', icon: Music },
    { id: 'focus', label: 'Focus', icon: Focus },
    { id: 'group', label: 'Group', icon: Users },
    { id: 'video', label: 'Video Calls', icon: Video }
  ];

  const getWorkStyleCount = (workStyle) => {
    return places.filter(p => {
      const score = calculateLocalScore(p, workStyle);
      return score >= 3;
    }).length;
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

  const getInitialContextMessage = () => {
    if (!selectedWorkStyle) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 mb-3 text-sm rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
          <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
          <span className="text-[var(--text-secondary)]">
            Showing highest rated workspaces
          </span>
        </div>
      );
    }

    if (selectedWorkStyle === 'video') {
      return (
        <div className="flex items-center gap-2 px-3 py-2 mb-3 text-sm rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
          <Video className="w-4 h-4 text-[var(--accent-primary)]" />
          <span className="text-[var(--text-secondary)]">
            Best spots for video calls
          </span>
        </div>
      );
    }

    if (selectedWorkStyle === 'lively') {
      return (
        <div className="flex items-center gap-2 px-3 py-2 mb-3 text-sm rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
          <Music className="w-4 h-4 text-[var(--accent-primary)]" />
          <span className="text-[var(--text-secondary)]">
            Energetic spaces with a social atmosphere
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 px-3 py-2 mb-3 text-sm rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
        <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
        <span className="text-[var(--text-secondary)]">
          Showing best matches for {selectedWorkStyle} work
        </span>
      </div>
    );
  };

  const recommendedPlaces = getRecommendedPlaces();
  const totalMatchingPlaces = selectedWorkStyle ? 
    places.filter(p => calculateLocalScore(p, selectedWorkStyle) >= 3).length : places.length;

  const hasMoreToShow = recommendedPlaces.length === displayCount && 
    displayCount < totalMatchingPlaces;

  return (
    <div className="space-y-4">
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
              <span className={`
                text-xs px-1.5 rounded-full
                ${selectedWorkStyle === id
                  ? 'bg-[var(--accent-primary)] text-[var(--button-text)]'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                }
              `}>
                {getWorkStyleCount(id)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {getInitialContextMessage()}

      {selectedWorkStyle && totalMatchingPlaces > 0 && (
        <div className="text-sm text-[var(--text-secondary)]">
          Showing {Math.min(displayCount, recommendedPlaces.length)} of {totalMatchingPlaces} matches
        </div>
      )}

      <div className="space-y-3">
        {recommendedPlaces.map((place, index) => (
          <div
            key={place.ID}
            className="transform transition-all duration-300 ease-out"
            style={{
              animation: index >= displayCount - 4 
                ? `fadeSlideIn 0.3s ease-out ${index % 4 * 0.1}s both` 
                : 'none'
            }}
          >
            <PlaceCard
              key={place.ID}
              place={place}
              isHighlighted={index === 0}
              onViewDetails={onViewDetails}
            />
          </div>
        ))}
      </div>

      {hasMoreToShow && (
        <button
          onClick={() => setDisplayCount(prev => Math.min(prev + 4, totalMatchingPlaces))}
          className="w-full mt-4 p-3 rounded-lg border border-dashed
            border-[var(--border-primary)] bg-[var(--bg-secondary)]
            hover:border-[var(--accent-primary)] hover:bg-[var(--bg-primary)]
            text-[var(--text-secondary)] hover:text-[var(--accent-primary)]
            transitiontransition-all duration-200 group"
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
    </div>
  );
};

export default QuickMatchView;