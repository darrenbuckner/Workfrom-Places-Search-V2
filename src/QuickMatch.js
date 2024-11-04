import React, { useState, useEffect } from 'react';
import { Brain, MapPin, Star } from 'lucide-react';
import { SearchPhases } from './SearchButton';

const QuickMatch = ({ 
  places,
  searchPhase,
  onRecommendationMade,
  onPhotoClick,
}) => {
  const [recommendation, setRecommendation] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Reset when search starts
  useEffect(() => {
    if (searchPhase === SearchPhases.LOCATING || searchPhase === SearchPhases.LOADING) {
      setRecommendation(null);
      setIsAnalyzing(true);
    }
  }, [searchPhase]);

  // Analyze when places are loaded
  useEffect(() => {
    if (places.length > 0 && searchPhase === SearchPhases.COMPLETE && isAnalyzing) {
      analyzeAndRecommend();
    }
  }, [places, searchPhase, isAnalyzing]);

  const analyzeAndRecommend = () => {
    // Simulate AI analysis with a short delay
    setTimeout(() => {
      if (places.length > 0) {
        // Find the place with the highest workability score
        const bestPlace = places.reduce((best, current) => {
          const currentScore = current.workabilityScore || 0;
          const bestScore = best.workabilityScore || 0;
          return (currentScore > bestScore) ? current : best;
        }, places[0]);

        const newRecommendation = {
          place: bestPlace,
          reasons: [
            bestPlace.workabilityScore ? `Workability score: ${bestPlace.workabilityScore}` : null,
            bestPlace.noise_level ? `Noise level: ${bestPlace.noise_level}` : null,
            bestPlace.power ? `Power availability: ${bestPlace.power}` : null,
            bestPlace.wifi ? `Wifi: ${bestPlace.wifi}` : null
          ].filter(Boolean),
          context: `This space stands out for its ideal working environment and amenities.`
        };

        setRecommendation(newRecommendation);
        onRecommendationMade?.(bestPlace.title);
      }
      setIsAnalyzing(false);
    }, 1500);
  };

  // Don't render if no search has been performed
  if (searchPhase === SearchPhases.INITIAL) return null;

  // Don't render if there are no places and we're not analyzing
  if (!isAnalyzing && !recommendation && places.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="border border-[var(--accent-primary)] rounded-lg shadow-sm bg-[var(--bg-primary)] overflow-hidden">
        {isAnalyzing ? (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-[var(--accent-primary)]" />
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {searchPhase === SearchPhases.LOCATING 
                  ? 'Finding your location...'
                  : searchPhase === SearchPhases.LOADING
                    ? 'Finding nearby spaces...'
                    : 'Analyzing spaces...'}
              </span>
            </div>
            <div className="h-1 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
              <div 
                className="h-full bg-[var(--accent-primary)] animate-pulse transition-all duration-500" 
                style={{ 
                  width: searchPhase === SearchPhases.LOCATING 
                    ? '33%' 
                    : searchPhase === SearchPhases.LOADING 
                      ? '66%' 
                      : '90%' 
                }} 
              />
            </div>
          </div>
        ) : recommendation ? (
          <div className="p-4">
            <div className="flex gap-4">
              {/* Score Badge */}
              <div className="flex-shrink-0 w-14 h-14 rounded-md bg-[var(--accent-primary)] text-white flex items-center justify-center font-bold text-xl relative">
                {recommendation.place.workabilityScore || '?'}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--accent-primary)] flex items-center justify-center">
                  <Star className="w-3 h-3 text-white" />
                </div>
              </div>

              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-medium">
                      <Brain className="w-3 h-3" />
                      <span>Best Match</span>
                    </div>
                    <span className="text-sm text-[var(--text-secondary)]">
                      {recommendation.place.distance} miles away
                    </span>
                  </div>
                </div>

                {/* Place Name & Context */}
                <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">
                  {recommendation.place.title}
                </h3>
                <p className="text-sm text-[var(--text-primary)] mb-3">
                  {recommendation.context}
                </p>

                {/* Reasons */}
                <div className="space-y-1.5">
                  {recommendation.reasons.map((reason, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => onPhotoClick?.(recommendation.place)}
                  className="mt-4 px-4 py-2 rounded-md bg-[var(--accent-primary)] text-white text-sm font-medium
                    hover:bg-[var(--accent-primary-hover)] transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default QuickMatch;