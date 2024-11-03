import { useState, useCallback } from 'react';
import API_CONFIG from '../config';

const stripHtml = (html) => {
  if (!html) return '';
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

export const usePhotoModal = () => {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [fullImg, setFullImg] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);

  const fetchPlacePhotos = useCallback(async (placeId) => {
    setIsPhotoLoading(true);
    try {
      const response = await fetch(
        `${API_CONFIG.baseUrl}/places/${placeId}?appid=${API_CONFIG.appId}`
      );
      const data = await response.json();

      if (data.meta.code === 200 && data.response?.[0]) {
        const { full_img, description, os } = data.response[0];
        setFullImg(full_img || '');
        setSelectedPlace(prev => ({
          ...prev,
          description: description ? stripHtml(description) : '',
          os: os || ''
        }));
      }
    } catch (err) {
      console.error('Error fetching place photos:', err);
      setFullImg('');
      setSelectedPlace(prev => ({
        ...prev,
        description: '',
        os: ''
      }));
    } finally {
      setIsPhotoLoading(false);
    }
  }, []);

  const handlePhotoClick = useCallback((place) => {
    setSelectedPlace(place);
    setShowPhotoModal(true);
    fetchPlacePhotos(place.ID);
  }, [fetchPlacePhotos]);

  const closePhotoModal = useCallback(() => {
    setShowPhotoModal(false);
    setFullImg('');
    setSelectedPlace(null);
    setIsPhotoLoading(false);
  }, []);

  const resetPhotoState = useCallback(() => {
    setSelectedPlace(null);
    setFullImg('');
    setShowPhotoModal(false);
    setIsPhotoLoading(false);
  }, []);

  return {
    // State
    selectedPlace,
    fullImg,
    showPhotoModal,
    isPhotoLoading,

    // Setters
    setSelectedPlace,
    setShowPhotoModal,

    // Actions
    handlePhotoClick,
    fetchPlacePhotos,
    closePhotoModal,
    resetPhotoState
  };
};