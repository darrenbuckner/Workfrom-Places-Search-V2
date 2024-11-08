import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sparkles, Star, X, ArrowRight, Navigation, Loader } from 'lucide-react';
import { SearchPhases } from './constants';
import API_CONFIG from './config';
import ErrorMessage from './ErrorMessage';

// Extracted animation keyframes
const animationStyles = {
  '@keyframes progress': {
    '0%': { transform: 'translateX(-100%)' },
    '50%': { transform: 'translateX(0)' },
    '100%': { transform: 'translateX(100%)' }
  },
  progressAnimation: {
    animation: 'progress 2s ease-in-out infinite'
  }
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
  const [loadingMessage, setLoadingMessage] = useState('Confirming your best option...');
  const [error, setError] = useState(null);
  const analysisRequestedRef = useRef(false);
  
  const getGoogleMapsUrl = (place) => {
    const address = `${place.street}, ${place.city}, ${place.postal}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };

  useEffect(() => {
    if (!isAnalyzing) return;

    const messages = [
      'Confirming your best option...',
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
        const contextInfo = data.insights.context;
        const recommendedPlace = places.find(p => p.title === aiRecommendation.name);
        
        if (recommendedPlace) {
          setRecommendation({
            place: recommendedPlace,
            headline: aiRecommendation.headline,
            lede: aiRecommendation.lede,
            personalNote: aiRecommendation.personalNote,
            standoutFeatures: aiRecommendation.standoutFeatures,
            context: contextInfo
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
          lede: 'This workspace offers the best overall workability score in the area.',
          standoutFeatures: [],
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

  // Trigger analysis when we have places and are in complete state
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
      <div className="flex items-center gap-3 animate-fade-in">
        <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/10 
          flex items-center justify-center">
          <Loader className="w-4 h-4 text-[var(--accent-primary)] animate-spin" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-[var(--text-primary)]">
            {loadingMessage}
          </div>
          <div className="mt-2 h-1 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
            <div 
              className="h-full w-full bg-[var(--accent-primary)] origin-left"
              style={animationStyles.progressAnimation}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!recommendation) return null;

  return (
    <div className="relative animate-fade-in">
      <button
        onClick={onHide}
        className="absolute right-0 top-0 p-1.5 rounded-full 
          hover:bg-[var(--bg-tertiary)] transition-colors"
        aria-label="Hide quick match"
      >
        <X size={14} className="text-[var(--text-secondary)]" />
      </button>

      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-14 h-14 rounded-md relative
          bg-[var(--accent-primary)] text-white
          flex items-center justify-center font-bold text-xl">
          {recommendation.place.workabilityScore}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full 
            bg-[var(--accent-primary)] flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white animate-pulse" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-xs px-1.5 py-0.5 rounded-full 
              bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] 
              font-medium inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Best Match
            </div>
            <span className="text-sm text-[var(--text-secondary)]">
              {recommendation.place.distance}mi away
            </span>
          </div>

          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">
            {recommendation.place.title}
          </h3>

          {recommendation.headline && (
            <p className="text-sm text-[var(--text-primary)] font-medium mb-2">
              {recommendation.headline}
            </p>
          )}

          {recommendation.lede && (
            <p className="text-sm text-[var(--text-secondary)] mb-3">
              {recommendation.lede}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onPhotoClick(recommendation.place)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md
                bg-[var(--accent-primary)] text-white
                hover:bg-[var(--accent-secondary)] transition-colors
                text-sm font-medium"
            >
              View Details
              <ArrowRight size={14} />
            </button>
            <a
              href={getGoogleMapsUrl(recommendation.place)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md
                border border-[var(--border-primary)]
                hover:bg-[var(--bg-secondary)] transition-colors
                text-sm font-medium"
            >
              <Navigation size={14} />
              Directions
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default QuickMatch;