import { useState, useCallback, useRef } from 'react';
import API_CONFIG from '../config';

// Cache implementation
const analysisCache = new Map();
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

// Helper to generate a cache key from places
const generateCacheKey = (places) => {
  return places
    .map(p => `${p.ID}-${p.workabilityScore}-${p.distance}-${p.description?.substring(0, 100)}`)
    .sort()
    .join('|');
};

// Helper to prepare payload with all necessary data
const prepareAnalysisPayload = (places) => {
  return places.map(place => ({
    id: place.ID,
    description: place.description,  // Include the description
    name: place.title,
    type: place.type || '',
    distance: parseFloat(place.distance) || 0,
    noise: place.noise_level || place.noise || '',
    wifi: place.download ? `${Math.round(place.download)} Mbps` : 
          place.no_wifi === "1" ? "No WiFi" : "Unknown",
    workabilityScore: place.workabilityScore || 0,
    features: {
      hasCoffee: place.coffee === "1",
      hasFood: place.food === "1",
      hasOutdoor: place.outdoor_seating === "1" || place.outside === "1",
      isPowerAvailable: Boolean(place.power && place.power !== 'none')
    }
  }));
};

// Custom error class for analysis
class AnalysisError extends Error {
  constructor(message, code, retryable = true) {
    super(message);
    this.name = 'AnalysisError';
    this.code = code;
    this.retryable = retryable;
  }
}

export const useWorkspaceAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  
  // Keep track of retry attempts
  const retryAttemptsRef = useRef(0);
  const MAX_RETRIES = 2;

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
    setError(null);
    retryAttemptsRef.current = 0;
  }, []);

  const cancelAnalysis = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsAnalyzing(false);
  }, []);

  // Helper for exponential backoff
  const getRetryDelay = (attempt) => {
    return Math.min(1000 * Math.pow(2, attempt), 8000); // Max 8 second delay
  };

  const analyzePlaces = useCallback(async (places, skipCache = false) => {
    if (!places?.length) {
      setError(new AnalysisError('No places to analyze', 'NO_PLACES', false));
      return null;
    }

    // Log incoming places data for debugging
    console.log('Places to analyze:', places.map(p => ({
      id: p.ID,
      hasDescription: !!p.description,
      descriptionLength: p.description?.length,
      descriptionPreview: p.description?.substring(0, 100)
    })));

    // Clear previous analysis state
    clearAnalysis();
    setIsAnalyzing(true);

    // Check cache first
    const cacheKey = generateCacheKey(places);
    if (!skipCache) {
      const cached = analysisCache.get(cacheKey);
      if (cached) {
        setAnalysis(cached.data);
        setIsAnalyzing(false);
        return cached.data;
      }
    }

    // Create new abort controller for this request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const attemptAnalysis = async (retryCount = 0) => {
      try {
        const timeoutId = setTimeout(() => {
          abortControllerRef.current?.abort();
        }, 25000); // 25 second timeout

        console.log('Sending places for analysis:', prepareAnalysisPayload(places)
          .map(p => ({
            id: p.id,
            hasDescription: !!p.description,
            descriptionLength: p.description?.length
          }))
        );

        const response = await fetch(
          `${API_CONFIG.baseUrl}/analyze-workspaces?appid=${API_CONFIG.appId}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ 
              places: prepareAnalysisPayload(places)
            }),
            signal: abortControllerRef.current.signal
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new AnalysisError(
            response.status === 429 ? 'Rate limit exceeded' : 'Analysis failed',
            response.status,
            response.status === 429 || response.status >= 500
          );
        }

        const data = await response.json();
        
        // Validate response structure
        if (!data.insights) {
          throw new AnalysisError('Invalid analysis response', 'INVALID_RESPONSE', false);
        }

        // Log analysis results for debugging
        console.log('Analysis results:', {
          totalPlaces: data.insights.places.length,
          placesWithInsights: data.insights.places.filter(p => p.userInsight).length,
          sampleInsights: data.insights.places
            .filter(p => p.userInsight)
            .slice(0, 3)
            .map(p => ({ id: p.id, insight: p.userInsight }))
        });

        // Cache successful response
        analysisCache.set(cacheKey, {
          data: data.insights,
          timestamp: Date.now()
        });

        setAnalysis(data.insights);
        setError(null);
        return data.insights;

      } catch (err) {
        // Handle abort errors
        if (err.name === 'AbortError') {
          throw new AnalysisError('Analysis timed out', 'TIMEOUT', true);
        }

        // Determine if we should retry
        const shouldRetry = (
          err.retryable !== false && 
          retryCount < MAX_RETRIES && 
          !abortControllerRef.current?.signal.aborted
        );

        if (shouldRetry) {
          const delay = getRetryDelay(retryCount);
          await new Promise(resolve => setTimeout(resolve, delay));
          return attemptAnalysis(retryCount + 1);
        }

        throw err;
      }
    };

    try {
      const result = await attemptAnalysis();
      return result;
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err);
      return null;
    } finally {
      setIsAnalyzing(false);
      abortControllerRef.current = null;
    }
  }, [clearAnalysis]);

  return {
    isAnalyzing,
    analysis,
    error,
    analyzePlaces,
    cancelAnalysis,
    clearAnalysis
  };
};