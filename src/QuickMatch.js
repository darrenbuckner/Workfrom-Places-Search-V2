import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sparkles, ArrowRight, Navigation, Loader, X } from 'lucide-react';
import { SearchPhases } from './constants';
import API_CONFIG from './config';
import ErrorMessage from './ErrorMessage';

const getGoogleMapsUrl = (place) => {
  const address = `${place.street}, ${place.city}, ${place.postal}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
};

const QuickMatch = ({ 
  places,
  searchPhase,
  onRecommendationMade,
  onPhotoClick,
  isHidden,
  onHide,
  onError
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('Finding your perfect workspace...');
  const [error, setError] = useState(null);
  const analysisRequestedRef = useRef(false);

  // Loading message rotation
  useEffect(() => {
    if (!isAnalyzing) return;

    const messages = [
      'Finding your perfect workspace...',
      'Analyzing workspace details...',
      'Checking community insights...',
      'Almost ready...'
    ];
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % messages.length;
      setLoadingMessage(messages[currentIndex]);
    }, 2000);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Reset analysis state when places change
  useEffect(() => {
    if (places?.length === 0) {
      setRecommendation(null);
      setError(null);
      analysisRequestedRef.current = false;
    }
  }, [places]);

  const handleError = (error) => {
    const errorMessage = {
      title: 'Analysis Error',
      message: error.message || 'Unable to analyze workspaces at this time.',
      variant: 'warning'
    };
    setError(errorMessage);
    onError?.(errorMessage);
  };

  const analyzeAndRecommend = useCallback(async () => {
    if (isAnalyzing || !places.length || analysisRequestedRef.current) return;
    
    setIsAnalyzing(true);
    setError(null);
    analysisRequestedRef.current = true;

    try {
      const placesForAnalysis = places.slice(0, 10).map(place => ({
        name: place.title,
        distance: place.distance,
        wifi: place.download ? `${Math.round(place.download)} Mbps` : 
              place.no_wifi === "1" ? "No WiFi" : "Unknown",
        noise: place.noise_level || place.noise || 'Unknown',
        power: place.power || 'Unknown',
        type: place.type || 'Unknown',
        workabilityScore: place.workabilityScore || 0,
        amenities: {
          coffee: Boolean(place.coffee),
          food: Boolean(place.food),
          alcohol: Boolean(place.alcohol),
          outdoorSeating: place.outdoor_seating === '1' || Boolean(place.outside)
        }
      }));

      const response = await fetch(`${API_CONFIG.baseUrl}/analyze-workspaces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ places: placesForAnalysis })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze workspaces');
      }

      const data = await response.json();
      
      if (data.meta.code === 200 || data.meta.code === 207) {
        const aiRecommendation = data.insights.recommendation;
        const recommendedPlace = places.find(p => p.title === aiRecommendation.name);
        
        if (recommendedPlace) {
          setRecommendation({
            place: recommendedPlace,
            headline: aiRecommendation.headline,
            context: data.insights.context
          });
          onRecommendationMade?.(recommendedPlace);
        }
      } else {
        throw new Error(data.meta.error_detail || 'Unable to get workspace recommendations.');
      }
    } catch (error) {
      handleError(error);
      // Fallback to basic scoring if AI analysis fails
      try {
        const bestPlace = places.reduce((best, current) => 
          current.workabilityScore > best.workabilityScore ? current : best
        , places[0]);

        setRecommendation({
          place: bestPlace,
          headline: 'Highest rated workspace nearby',
          context: 'Based on workability score'
        });
        onRecommendationMade?.(bestPlace);
      } catch (fallbackError) {
        console.error('Fallback recommendation failed:', fallbackError);
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [places, onRecommendationMade, onError]);

  // Trigger analysis when conditions are met
  useEffect(() => {
    const shouldAnalyze = 
      places?.length > 0 && 
      searchPhase === SearchPhases.COMPLETE && 
      !recommendation && 
      !isHidden && 
      !analysisRequestedRef.current;

    if (shouldAnalyze) {
      analyzeAndRecommend();
    }
  }, [places, searchPhase, recommendation, isHidden, analyzeAndRecommend]);

  if (isHidden || searchPhase === SearchPhases.INITIAL || (!places?.length && !isAnalyzing)) {
    return null;
  }

  if (error) {
    return (
      <ErrorMessage
        error={error}
        onRetry={() => {
          setError(null);
          analysisRequestedRef.current = false;
          analyzeAndRecommend();
        }}
        onDismiss={() => {
          setError(null);
          onHide?.();
        }}
        size="compact"
        className="animate-fade-in"
      />
    );
  }

  if (isAnalyzing) {
    return (
      <div className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center">
            <Loader className="w-4 h-4 text-[var(--accent-primary)] animate-spin" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-[var(--text-primary)]">
              {loadingMessage}
            </div>
            <div className="mt-2 h-1 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
              <div className="h-full w-1/3 bg-[var(--accent-primary)] animate-pulse rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!recommendation) return null;

  const { place } = recommendation;

  return (
    <div className="relative rounded-lg border border-[var(--accent-primary)] bg-[var(--bg-primary)] overflow-hidden animate-fadeIn">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--accent-primary)]" />
      
      <div className="p-4">
        {/* Close button */}
        <button
          onClick={onHide}
          className="absolute right-3 top-3 p-1.5 rounded-full 
            hover:bg-[var(--bg-tertiary)] transition-colors"
          aria-label="Hide quick match"
        >
          <X size={14} className="text-[var(--text-secondary)]" />
        </button>

        {/* AI Badge */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full 
            bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] 
            text-xs font-medium">
            <Sparkles className="w-3 h-3" />
            AI Recommended
          </div>
        </div>

        {/* Content Grid */}
        <div className="flex gap-4">
          {/* Score Badge */}
          <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-[var(--accent-primary)] 
            text-white flex items-center justify-center font-bold text-2xl">
            {place.workabilityScore}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1 line-clamp-1">
              {place.title}
            </h3>
            
            <p className="text-sm text-[var(--text-secondary)] mb-1">
              {place.distance} miles away
            </p>

            {recommendation.headline && (
              <p className="text-sm text-[var(--text-primary)] mb-3 line-clamp-2">
                {recommendation.headline}
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={() => onPhotoClick(place)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md
                  bg-[var(--accent-primary)] text-white
                  hover:bg-[var(--accent-secondary)] transition-colors
                  text-sm font-medium"
              >
                View Details
                <ArrowRight size={14} />
              </button>
              
              <a
                href={getGoogleMapsUrl(place)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md
                  text-[var(--text-primary)] bg-[var(--bg-tertiary)]
                  hover:bg-[var(--bg-secondary)] transition-colors
                  text-sm font-medium"
              >
                <Navigation size={14} />
                Directions
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickMatch;