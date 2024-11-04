import { useState, useCallback } from 'react';

export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [error, setError] = useState('');

  const getLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by your browser');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
            );
            const data = await response.json();
            const friendly = data.address?.city || data.address?.town || data.address?.suburb || 'your area';
            setLocationName(friendly);
            resolve(newLocation);
          } catch (err) {
            setLocationName('your area');
            resolve(newLocation);
          }
        },
        () => reject(new Error('Unable to retrieve your location'))
      );
    });
  }, []);

  return {
    location,
    setLocation,
    locationName,
    setLocationName,
    error,
    setError,
    getLocation
  };
};