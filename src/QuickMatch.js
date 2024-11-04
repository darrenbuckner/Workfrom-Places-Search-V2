import React, { useState, useEffect } from 'react';
import { Brain, MapPin, Star } from 'lucide-react';
import { SearchPhases } from './constants';

const QuickMatch = ({ 
  places,
  searchPhase,
  onRecommendationMade,
  onPhotoClick,
}) => {
  const [recommendation, setRecommendation] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (searchPhase === SearchPhases.LOCATING || searchPhase === SearchPhases.LOADING) {
      setRecommendation(null);
      setIsAnalyzing(true);
    }
  }, [searchPhase]);

  useEffect(() => {
    if (places.length > 0 && searchPhase === SearchPhases.COMPLETE && isAnalyzing) {
      analyzeAndRecommend();
    }
  }, [places, searchPhase, isAnalyzing]);

  const generateRecommendation = (place) => {
    // Helper to craft personality-driven recommendations
    const { type, noise_level, power, download, coffee, outdoor_seating, food, alcohol } = place;
    
    // Determine the vibe of the space
    let vibe = "";
    if (noise_level?.toLowerCase().includes('quiet')) {
      vibe = "productivity-focused sanctuary";
    } else if (noise_level?.toLowerCase().includes('moderate')) {
      vibe = "balanced workspace";
    } else {
      vibe = "vibrant community hub";
    }

    // Craft main headline
    let headline = "";
    if (type === 'dedicated') {
      headline = `A ${vibe} designed for serious remote work`;
    } else if (coffee === "1" && food === "1") {
      headline = `Your next favorite ${vibe} with all the essentials`;
    } else {
      headline = `A welcoming ${vibe} in your neighborhood`;
    }

    // Create compelling context
    let context = "";
    if (power === "ample" && download > 50) {
      context = `Perfect for those long work sessions with reliable power and fast ${download}Mbps WiFi throughout.`;
    } else if (power === "ample") {
      context = "Plenty of accessible power outlets mean you can stay productive all day.";
    } else if (download > 50) {
      context = `Rock-solid ${download}Mbps WiFi keeps you connected and productive.`;
    }

    // Add personality notes
    const notes = [];
    if (coffee === "1") {
      notes.push("quality coffee flows freely");
    }
    if (food === "1") {
      notes.push("diverse food options on hand");
    }
    if (outdoor_seating === "1" || place.outside) {
      notes.push("fresh air workspace option");
    }
    if (alcohol === "1") {
      notes.push("great for after-hours networking");
    }

    const personalNote = notes.length > 0
      ? `Plus, ${notes.join(", ")} - what's not to love?`
      : "";

    // Craft standout features
    const standoutFeatures = [];
    
    if (noise_level?.toLowerCase().includes('quiet')) {
      standoutFeatures.push("Ideal noise levels for deep focus work");
    }
    
    if (power === "ample" && download > 50) {
      standoutFeatures.push("Tech-friendly setup with reliable power and fast internet");
    }
    
    if (coffee === "1" && food === "1") {
      standoutFeatures.push("No need to pack up - food and coffee at your fingertips");
    }
    
    if (outdoor_seating === "1" || place.outside) {
      standoutFeatures.push("Switch up your environment with outdoor seating options");
    }

    return {
      place,
      distance: place.distance,
      recommendation: {
        name: place.title,
        headline,
        context,
        personalNote,
        standoutFeatures: standoutFeatures.slice(0, 3)
      }
    };
  };

  const analyzeAndRecommend = () => {
    setTimeout(() => {
      if (places.length > 0) {
        const bestPlace = places.reduce((best, current) => {
          const currentScore = current.workabilityScore || 0;
          const bestScore = best.workabilityScore || 0;
          return (currentScore > bestScore) ? current : best;
        }, places[0]);

        const newRecommendation = generateRecommendation(bestPlace);
        setRecommendation(newRecommendation);
        onRecommendationMade?.(bestPlace.title);
      }
      setIsAnalyzing(false);
    }, 1500);
  };

  if (searchPhase === SearchPhases.INITIAL) return null;
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
                    : 'Finding your perfect match...'}
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
              <div className="flex-shrink-0 w-14 h-14 rounded-md bg-[var(--accent-primary)] text-white flex items-center justify-center font-bold text-xl relative">
                {recommendation.place.workabilityScore || '?'}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--accent-primary)] flex items-center justify-center">
                  <Star className="w-3 h-3 text-white" />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-medium">
                      <Brain className="w-3 h-3" />
                      <span>Best Match</span>
                    </div>
                    <span className="text-sm text-[var(--text-secondary)]">
                      {recommendation.distance} miles away
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">
                  {recommendation.place.title}
                </h3>
                
                <p className="text-sm font-medium text-[var(--text-primary)] mb-2">
                  {recommendation.recommendation.headline}
                </p>

                <p className="text-sm text-[var(--text-secondary)] mb-2">
                  {recommendation.recommendation.context}
                </p>

                {recommendation.recommendation.personalNote && (
                  <p className="text-sm text-[var(--text-secondary)] mb-3">
                    {recommendation.recommendation.personalNote}
                  </p>
                )}

                {recommendation.recommendation.standoutFeatures?.length > 0 && (
                  <div className="text-xs text-[var(--text-secondary)] space-y-1.5">
                    {recommendation.recommendation.standoutFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                )}

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