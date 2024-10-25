import React, { useEffect, useRef, useState } from 'react';
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

const useScrollPosition = (ref) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!ref.current || window.innerWidth >= 768) return;

    const handleScroll = () => {
      const scrollTop = ref.current.scrollTop;
      const viewportHeight = window.innerHeight;
      const triggerDistance = viewportHeight * 0.35; // Height of image
      
      // Calculate progress based on scroll position
      const progress = Math.min(Math.max(scrollTop / triggerDistance, 0), 1);
      setProgress(progress);
    };

    const element = ref.current;
    element.addEventListener('scroll', handleScroll);
    
    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [ref]);

  return progress;
};

const PhotoModal = ({ selectedPlace, fullImg, isPhotoLoading, setShowPhotoModal }) => {
  const { isDark } = useTheme();
  const contentRef = useRef(null);
  const progress = useScrollPosition(contentRef);
  useScrollLock(true);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowPhotoModal(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [setShowPhotoModal]);

  if (!selectedPlace) return null;

  const sanitizedDescription = stripHtml(selectedPlace?.description);
  const getGoogleMapsUrl = (address) => 
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  return (
    <div 
      className="fixed inset-0 z-50 bg-[var(--modal-overlay)] flex flex-col md:overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Mobile Header */}
      <div className={`flex-shrink-0 md:hidden sticky top-0 z-20 ${
        isDark ? 'bg-[#11151f]' : 'bg-black'
      }`}>
        <div className="flex items-center justify-between p-3">
          <button 
            onClick={() => setShowPhotoModal(false)}
            className="flex items-center text-white hover:text-white/90 transition-colors"
            aria-label="Back to results"
          >
            <ChevronLeft size={20} className="mr-1" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h2 
            id="modal-title"
            className="text-base font-semibold text-center flex-1 mx-4 truncate text-white"
          >
            {selectedPlace?.title || 'Place Details'}
          </h2>
          <div className="w-8" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex md:items-center md:justify-center overflow-hidden">
        <div className={`w-full h-full md:w-[90vw] md:max-w-6xl md:h-[85vh] md:flex 
          md:rounded-lg border overflow-hidden relative
          ${isDark ? 'border-white/10' : 'border-gray-200'}`}
        >
          {/* Desktop Close Button */}
          <button 
            onClick={() => setShowPhotoModal(false)}
            className={`hidden md:flex absolute right-4 top-4 z-20 items-center justify-center 
              w-8 h-8 rounded-full transition-colors
              ${isDark 
                ? 'bg-white/10 hover:bg-white/20 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>

          {/* Scrollable Container */}
          <div 
            ref={contentRef}
            className="h-full overflow-y-auto md:flex flex-grow"
            style={{ 
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div className="relative md:flex md:w-full">
              {/* Image Section */}
              <div className="relative md:w-3/5 flex-shrink-0 bg-black transform-gpu"
                style={{
                  height: window.innerWidth >= 768 ? '100%' : '35vh',
                }}
              >
                <div className={`h-full ${window.innerWidth >= 768 ? 'absolute inset-0' : ''}`}>
                  {isPhotoLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black">
                      <Loader size={32} className="text-accent-primary animate-spin" />
                    </div>
                  ) : fullImg ? (
                    <>
                      <img
                        src={fullImg}
                        alt={selectedPlace?.title}
                        className="w-full h-full object-cover transform-gpu transition-transform duration-200"
                        style={{
                          transform: window.innerWidth < 768 
                            ? `scale(${1 + Math.min(progress * 0.05, 0.05)})` 
                            : 'none',
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://placehold.co/800x600/${
                            isDark ? '1a1f2c' : 'f1f5f9'
                          }/60a5fa?text=Image not available&font=raleway`;
                        }}
                      />
                      <div 
                        className="absolute inset-x-0 -bottom-1 h-32 pointer-events-none md:hidden
                          bg-gradient-to-t from-black via-black/80 to-transparent"
                        style={{ 
                          opacity: 0.3 + Math.min(progress * 0.7, 0.7),
                          transition: 'opacity 0.2s ease-out'
                        }}
                      />
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-black">
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        No image available
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Section */}
              <div className={`relative flex-1 md:w-2/5 ${isDark ? 'bg-[#1a1f2c]' : 'bg-white'}`}>
                <div className="p-4 space-y-4">
                  {/* Desktop Title */}
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
                          href={getGoogleMapsUrl(`${selectedPlace.street}, ${selectedPlace.city}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center px-4 py-2 
                            bg-[var(--action-primary)] hover:bg-[var(--action-primary-hover)]
                            text-white text-sm rounded-md transition-colors 
                            w-full sm:w-auto sm:ml-auto"
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
    </div>
  );
};

export default PhotoModal;