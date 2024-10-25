import React from 'react';
import { 
  X, 
  Loader, 
  Navigation, 
  Quote,
  ChevronLeft
} from 'lucide-react';
import WorkabilityScore from './WorkabilityScore';
import { useScrollLock } from './useScrollLock';
import { useTheme } from './ThemeProvider';

const stripHtml = (html) => {
  if (!html) return '';
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const PhotoModal = ({ selectedPlace, fullImg, isPhotoLoading, setShowPhotoModal }) => {
  useScrollLock(true);
  const { isDark } = useTheme();

  // Ensure selectedPlace exists to prevent undefined errors
  if (!selectedPlace) {
    return (
      <div className={`fixed inset-0 z-50 overflow-y-auto md:overflow-hidden ${
        isDark 
          ? 'bg-[#160040]/90' 
          : 'bg-black/80'
      }`}>
        <div className="min-h-screen md:flex md:items-center md:justify-center">
          <div className={`md:w-[90vw] md:max-w-6xl md:h-[85vh] 
            ${isDark ? 'bg-[#1a1f2c]' : 'bg-white'} 
            md:rounded-lg overflow-hidden relative border 
            ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            <button 
              onClick={() => setShowPhotoModal(false)}
              className="absolute right-4 top-4 z-20 flex items-center justify-center w-8 h-8 
                bg-bg-secondary hover:bg-bg-tertiary rounded-full text-text-primary transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex items-center justify-center h-full">
              <p className="text-text-primary">Error loading place details</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sanitizedDescription = stripHtml(selectedPlace?.description);
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto md:overflow-hidden bg-[var(--modal-overlay)]">
      <div className="min-h-screen md:flex md:items-center md:justify-center">
        <div className="relative flex flex-col md:flex-row md:w-[90vw] md:max-w-6xl md:h-[85vh] 
          overflow-hidden md:rounded-lg border 
          ${isDark ? 'border-white/10' : 'border-gray-200'}">
          {/* Close Button - Desktop */}
          <button 
            onClick={() => setShowPhotoModal(false)}
            className={`hidden md:flex absolute right-4 top-4 z-20 items-center justify-center w-8 h-8 
              rounded-full transition-colors
              ${isDark 
                ? 'bg-white/10 hover:bg-white/20 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
          >
            <X size={20} />
          </button>

          {/* Mobile Header */}
          <div className={`absolute top-0 left-0 right-0 z-10 md:hidden ${
            isDark 
              ? 'bg-gradient-to-b from-[#11151f] to-transparent' 
              : 'bg-gradient-to-b from-black to-transparent'
          }`}>
            <div className="flex items-center justify-between p-3">
              <button 
                onClick={() => setShowPhotoModal(false)}
                className="flex items-center text-white hover:text-white/90 transition-colors"
              >
                <ChevronLeft size={20} className="mr-1" />
                <span className="text-sm font-medium">Back</span>
              </button>
              <h2 className="text-base font-semibold text-center flex-1 mx-4 truncate text-white">
                {selectedPlace?.title || 'Place Details'}
              </h2>
              <div className="w-8" />
            </div>
          </div>

          {/* Left Column - Image */}
          <div className="md:w-3/5 md:h-full bg-black flex-shrink-0">
            <div className="relative w-full h-[50vh] md:h-full flex items-center justify-center">
              {isPhotoLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader size={32} className="text-accent-primary animate-spin" />
                </div>
              ) : fullImg ? (
                <img
                  src={fullImg}
                  alt={selectedPlace?.title}
                  className="w-full h-full object-fill md:object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://placehold.co/800x600/${isDark ? '1a1f2c' : 'f1f5f9'}/60a5fa?text=Image not available&font=raleway`;
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    No image available
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Content */}
          <div className={`md:w-2/5 md:h-full ${isDark ? 'bg-[#1a1f2c]' : 'bg-white'}`}>
            <div className="h-full overflow-y-auto">
              <div className="p-4 space-y-4">
                {/* Title - Desktop Only */}
                <div className="hidden md:block">
                  <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedPlace?.title}
                  </h2>
                </div>

                {/* Location & Actions */}
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-gray-700'}`}>
                      {selectedPlace?.street}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-gray-700'}`}>
                      {selectedPlace?.city}
                    </p>
                  </div>
                  {selectedPlace?.street && selectedPlace?.city && (
                    <div className="flex flex-col sm:flex-row sm:justify-end">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                          `${selectedPlace.street}, ${selectedPlace.city}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-[var(--action-primary)] hover:bg-[var(--action-primary-hover)]
                          text-white text-sm rounded-md transition-colors w-full sm:w-auto sm:ml-auto justify-center"
                      >
                        <Navigation size={14} className="mr-2" />
                        Get Directions
                      </a>
                    </div>
                  )}
                </div>

                {/* Workability Score */}
                <WorkabilityScore place={selectedPlace} variant="full" />

                {/* Description */}
                {sanitizedDescription && (
                  <div className={`rounded-lg border ${
                    isDark 
                      ? 'bg-[#2a3142] border-white/10' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="p-4">
                      <div className="flex items-center mb-3">
                        <Quote size={16} className="mr-2 text-accent-primary" />
                        <h3 className={`text-sm font-medium ${
                          isDark ? 'text-blue-300' : 'text-gray-600'
                        }`}>
                          A Closer Look
                        </h3>
                      </div>
                      <p className={`leading-relaxed ${
                        isDark ? 'text-blue-100' : 'text-gray-700'
                      }`}>
                        {sanitizedDescription}
                      </p>
                    </div>
                    {selectedPlace?.os && (
                      <div className={`border-t px-4 py-2.5 text-xs ${
                        isDark 
                          ? 'border-white/10 bg-[#232838] text-blue-300' 
                          : 'border-gray-200 bg-gray-100 text-gray-500'
                      }`}>
                        Added by {selectedPlace.os}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;