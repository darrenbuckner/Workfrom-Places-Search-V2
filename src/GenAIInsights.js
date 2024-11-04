import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { Message } from './components/ui/loading';
import { AILoadingMessage } from './components/ui//AIComponents';
import QuickMatch from './QuickMatch';
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

  const analyzeNearbyPlaces = async () => {
    if (isAnalyzing || places.length === 0 || isSearching || insights) {
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Prepare places data for analysis
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
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      
      if (data.insights?.recommendation) {
        // Ensure we have the lede before setting insights
        if (!data.insights.recommendation.lede) {
          data.insights.recommendation.lede = data.insights.recommendation.context;
        }
        
        setInsights(data.insights);
        onRecommendationMade?.(data.insights);
      } else {
        throw new Error('Invalid analysis response');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Trigger analysis when places are loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAnalyzing && places.length > 0 && !isSearching && !insights) {
        analyzeNearbyPlaces();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [places, isSearching, isAnalyzing, insights]);

  // Find the recommended place object
  const getRecommendedPlace = () => {
    if (!insights?.recommendation?.name || !places.length) return null;
    return places.find(p => p.title === insights.recommendation.name);
  };

  const recommendedPlace = getRecommendedPlace();

  // Don't render anything if we have no places or are searching
  if (!places.length || isSearching) return null;


  // Show quick match card
  if (isAnalyzing || (insights?.recommendation && recommendedPlace)) {
    return (
      <QuickMatch
        recommendation={insights?.recommendation}
        place={recommendedPlace}
        onViewDetails={() => onPhotoClick?.(recommendedPlace)}
        isAnalyzing={isAnalyzing}
      />
    );
  }

  return null;
};

export default GenAIInsights;