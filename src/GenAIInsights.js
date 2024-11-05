import React, { useState, useEffect } from 'react';
import { Brain, Star } from 'lucide-react';
import API_CONFIG from './config';

const GenAIInsights = ({ 
  places, 
  isSearching, 
  onPhotoClick,
  onRecommendationMade,
  className = ''
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);

  // Reset states when new search begins
  useEffect(() => {
    if (isSearching) {
      setInsights(null);
      setError(null);
      setIsAnalyzing(false);
    }
  }, [isSearching]);

  // Analyze when places are loaded
  useEffect(() => {
    if (places?.length > 0 && !isSearching && !insights) {
      analyzeNearbyPlaces();
    }
  }, [places, isSearching, insights]);

  const analyzeNearbyPlaces = async () => {
    if (isAnalyzing || places.length === 0 || insights) return;

    setIsAnalyzing(true);
    setError(null);

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

      const data = await response.json();
      
      if (data.meta.code === 200 || data.meta.code === 207) {
        const recommendation = data.insights.recommendation;
        
        // Find the full place object that matches the recommendation
        const recommendedPlace = places.find(p => p.title === recommendation.name);
        
        if (recommendedPlace) {
          setInsights({
            recommendation: {
              ...recommendation,
              lede: data.insights.recommendation.lede
            },
            place: recommendedPlace,
            context: data.insights.context
          });
          onRecommendationMade?.(recommendedPlace.title);
        } else {
          throw new Error('Recommended place not found');
        }
      } else {
        throw new Error(data.meta?.error || 'Analysis failed');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message);
      
      // Fallback handled by the API now
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!places.length || isSearching) return null;

  return (
    <div className={`mb-6 ${className}`}>
      <div className="border border-[var(--accent-primary)] rounded-lg shadow-sm bg-[var(--bg-primary)] overflow-hidden">
        <div className="p-4">
          {isAnalyzing ? (
            <div className="animate-pulse space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-[var(--accent-primary)]" />
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  Using AI to analyze nearby workspaces...
                </span>
              </div>
              <div className="h-1 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                <div className="w-2/3 h-full bg-[var(--accent-primary)]" />
              </div>
            </div>
          ) : insights?.place ? (
            <div className="flex gap-4">
              {/* Score Badge */}
              <div className="flex-shrink-0 w-14 h-14 rounded-md bg-[var(--accent-primary)] text-white 
                flex items-center justify-center font-bold text-xl relative">
                {insights.place.workabilityScore}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--accent-primary)] 
                  flex items-center justify-center">
                  <Star className="w-3 h-3 text-white" />
                </div>
              </div>

              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full 
                      bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-medium">
                      <Brain className="w-3 h-3" />
                      <span>AI Pick</span>
                    </div>
                    <span className="text-sm text-[var(--text-secondary)]">
                      {insights.place.distance} miles away
                    </span>
                  </div>
                </div>

                {/* Place Name & Context */}
                <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
                  {insights.place.title}
                </h3>

                {/* AI Insights */}
                {insights.recommendation.headline && (
                  <p className="text-sm text-[var(--text-primary)] mb-3">
                    {insights.recommendation.headline}
                  </p>
                )}

                {/* Personal Note - if available */}
                {insights.recommendation.personalNote && (
                  <p className="text-sm text-[var(--text-secondary)] italic mb-3">
                    "{insights.recommendation.personalNote}"
                  </p>
                )}

                {/* Standout Features */}
                <div className="space-y-1.5">
                  {insights.recommendation.standoutFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                      <span>{typeof feature === 'string' ? feature : feature.description}</span>
                    </div>
                  ))}
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => onPhotoClick?.(insights.place)}
                  className="mt-4 px-4 py-2 rounded-md bg-[var(--accent-primary)] text-white 
                    text-sm font-medium hover:bg-[var(--accent-primary-hover)] transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default GenAIInsights;