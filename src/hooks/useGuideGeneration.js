import { useState } from 'react';
import API_CONFIG from '../config';

export const useGuideGeneration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateGuide = async (places) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Environment:', process.env.NODE_ENV);
      console.log('API Config:', API_CONFIG);
      console.log('Making request to:', `${API_CONFIG.baseUrl}/generate-guide`);
      
      const response = await fetch(`${API_CONFIG.baseUrl}/generate-guide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          places,
          location: {
            latitude: places[0].latitude,
            longitude: places[0].longitude
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setIsLoading(false);
      return data.guide;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  };

  return {
    generateGuide,
    isLoading,
    error
  };
}; 