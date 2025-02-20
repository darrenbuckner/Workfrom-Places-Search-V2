import { useState, useCallback, useMemo, useRef } from 'react';
import API_CONFIG from '../config';
import { calculateWorkabilityScore } from '../WorkabilityScore';

const MAX_RADIUS_MILES = 5; // Maximum allowed radius in miles

const mapNoiseLevel = (noise) => {
  if (!noise) return 'Unknown';
  if (typeof noise === 'string') {
    const lowerNoise = noise.toLowerCase();
    if (lowerNoise.includes('quiet') || lowerNoise.includes('low')) return 'Below average';
    if (lowerNoise.includes('moderate') || lowerNoise.includes('average')) return 'Average';
    if (lowerNoise.includes('noisy') || lowerNoise.includes('high')) return 'Above average';
    return noise;
  }
  return 'Unknown';
};

// Custom error class for API-specific errors
class APIError extends Error {
  constructor(code, type, detail, canRetryWithLargerRadius = false) {
    super(detail);
    this.name = 'APIError';
    this.code = code;
    this.type = type;
    this.canRetryWithLargerRadius = canRetryWithLargerRadius;
  }
}

export const usePlaces = () => {
  const [originalPlaces, setOriginalPlaces] = useState([]);
  const [searchPhase, setSearchPhase] = useState('initial');
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('score_high');
  const [postSearchFilters, setPostSearchFilters] = useState({
    type: 'any',
    power: 'any',
    noise: 'any',
    openNow: false
  });
  
  const searchStateRef = useRef({
    hasSearched: false,
    isSearching: false,
    lastSearchParams: null
  });

  const fetchPlaces = useCallback(async (searchLocation, radius) => {
    try {
      // Store search parameters for potential retry
      searchStateRef.current.lastSearchParams = { searchLocation, radius };
      
      // Ensure radius is a number and within limits
      const radiusValue = Number(radius);
      if (isNaN(radiusValue) || radiusValue <= 0) {
        throw new Error('Invalid radius value');
      }
      if (radiusValue > MAX_RADIUS_MILES) {
        throw new APIError(
          400,
          'RADIUS_TOO_LARGE',
          `Search radius cannot exceed ${MAX_RADIUS_MILES} miles. Please try a smaller radius.`,
          false
        );
      }

      const response = await fetch(
        `${API_CONFIG.baseUrl}/places/ll/${searchLocation.latitude},${searchLocation.longitude}?radius=${radiusValue}&appid=${API_CONFIG.appId}&rpp=50`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch places');
      }

      const data = await response.json();
      
      // Handle API response
      if (data.meta) {
        switch (data.meta.code) {
          case 200:
            if (Array.isArray(data.response)) {
              const placesWithScores = data.response.map(place => ({
                ...place,
                mappedNoise: mapNoiseLevel(place.noise_level || place.noise),
                workabilityScore: calculateWorkabilityScore(place).score
              }));
              setOriginalPlaces(placesWithScores);
              setError('');
              return placesWithScores;
            }
            throw new APIError(400, 'invalid_response', 'Invalid response format from server');

          case 404:
            setOriginalPlaces([]);
            throw new APIError(
              404,
              'NO_RESULTS',
              `No workspaces found within ${(radiusValue/1609.34).toFixed(1)} miles. Try increasing your search radius or searching in a different area.`,
              true
            );

          default:
            throw new APIError(
              data.meta.code,
              data.meta.error_type || 'unknown',
              data.meta.error_detail || 'Something unexpected occurred. Please try again.'
            );
        }
      }

      throw new Error('Invalid API response structure');
    } catch (err) {
      console.error('Search error:', err);
      setOriginalPlaces([]);
      setError(err.message);
      throw err;
    }
  }, []);

  // Retry search with increased radius
  const retryWithLargerRadius = useCallback(async () => {
    const lastParams = searchStateRef.current.lastSearchParams;
    if (!lastParams) return null;

    const newRadius = Math.min(lastParams.radius * 2, MAX_RADIUS_MILES); // Cap at MAX_RADIUS_MILES
    if (newRadius === lastParams.radius) return null;

    try {
      return await fetchPlaces(lastParams.searchLocation, newRadius);
    } catch (err) {
      console.error('Retry search failed:', err);
      return null;
    }
  }, [fetchPlaces]);

  const filteredPlaces = useMemo(() => {
    if (!originalPlaces.length) return [];
    
    const filtered = originalPlaces.filter(place => {
      const { type, noise, power } = postSearchFilters;
      
      if (type !== 'any' && place.type !== type) return false;
      
      if (noise !== 'any') {
        const placeNoise = String(place.noise_level || place.noise || '').toLowerCase();
        const noiseMap = {
          quiet: ['quiet', 'low'],
          moderate: ['moderate', 'average'],
          noisy: ['noisy', 'high']
        };
        if (!noiseMap[noise].some(level => placeNoise.includes(level))) return false;
      }
      
      if (power !== 'any' && (!place.power || !place.power.includes(power))) return false;
      
      return true;
    });

    return sortBy === 'score_high' 
      ? filtered.sort((a, b) => b.workabilityScore - a.workabilityScore)
      : filtered;
  }, [originalPlaces, sortBy, postSearchFilters]);

  return {
    places: filteredPlaces,
    originalPlaces,
    setPlaces: setOriginalPlaces,
    searchPhase,
    setSearchPhase,
    error,
    setError,
    sortBy,
    setSortBy,
    postSearchFilters,
    setPostSearchFilters,
    fetchPlaces,
    retryWithLargerRadius,
    searchStateRef
  };
};