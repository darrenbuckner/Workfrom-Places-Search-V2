import { useState, useEffect } from 'react';

const STORAGE_KEY = 'workfrom_favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading favorites:', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, [favorites]);

  const addFavorite = (place) => {
    const favoritePlace = {
      id: place.ID || place.id,
      ID: place.ID || place.id,
      name: place.name || place.title,
      title: place.title || place.name,
      images: {
        thumbnail: place.images?.thumbnail || place.thumbnail_img,
        full: place.images?.full || place.full_img
      },
      thumbnail_img: place.images?.thumbnail || place.thumbnail_img,
      full_img: place.images?.full || place.full_img,
      coordinates: place.coordinates || place.location,
      latitude: place.latitude,
      longitude: place.longitude,
      street: place.street,
      city: place.city,
      workabilityScore: place.workabilityScore || 0,
      noise_level: place.noise_level,
      noise: place.noise,
      power: place.power,
      no_wifi: place.no_wifi,
      distance: place.distance || '0',
      download: place.download || '0',
      description: place.description,
      password: place.password,
      hours: place.hours,
      coffee: place.coffee,
      food: place.food,
      outdoor_seating: place.outdoor_seating,
      outside: place.outside,
      type: place.type,
      savedAt: new Date().toISOString()
    };
    
    console.log('Saving favorite with images:', {
      originalImages: place.images,
      savedImages: favoritePlace.images,
      thumbnail: favoritePlace.thumbnail_img,
      full: favoritePlace.full_img
    });
    
    setFavorites(prev => [...prev, favoritePlace]);
  };

  const removeFavorite = (placeId) => {
    setFavorites(prev => prev.filter(p => p.id !== placeId));
  };

  const isFavorite = (placeId) => {
    return favorites.some(p => p.id === placeId);
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite
  };
}; 