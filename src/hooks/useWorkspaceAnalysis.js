import { useState, useCallback, useRef } from 'react';
import API_CONFIG from '../config';

// Cache implementation
const analysisCache = new Map();
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

// Helper to generate a cache key from places
const generateCacheKey = (places) => {
  return places
    .map(p => `${p.ID}-${p.workabilityScore}-${p.distance}`)
    .sort()
    .join('|');
};

// Simplified payload to reduce request size
const prepareAnalysisPayload = (places) => {
  return places.map(place => ({
    id: place.ID,
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

    // Clear previous analysis state
    clearAnalysis();
    setIsAnalyzing(true);

    // Check cache first
    const cacheKey = generateCacheKey(places);
    if (!skipCache) {
      const cached = analysisCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
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
      setError(err);
      // Return partial analysis if available
      return generatePartialAnalysis(places);
    } finally {
      setIsAnalyzing(false);
      abortControllerRef.current = null;
    }
  }, [clearAnalysis]);

  // Generate basic insights when full analysis fails
  const generatePartialAnalysis = (places) => {
    // Simple analysis based on basic metrics
    return {
      featured_spot: {
        place_name: places[0]?.title,
        vibe: "Popular Spot",
        highlight: "Basic information available",
        unique_features: [
          "Details temporarily limited",
          "Check back for full analysis"
        ],
        best_time_to_visit: "Varies",
        best_for: ["Remote Work"]
      },
      metrics: {
        wifi_availability: places.filter(p => p.no_wifi !== "1").length / places.length,
        power_availability: places.filter(p => p.power && p.power !== 'none').length / places.length,
        average_workability: places.reduce((sum, p) => sum + (p.workabilityScore || 0), 0) / places.length
      }
    };
  };

  return {
    isAnalyzing,
    analysis,
    error,
    analyzePlaces,
    cancelAnalysis,
    clearAnalysis
  };
};