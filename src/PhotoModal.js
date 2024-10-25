import React from 'react';
import { 
  X, 
  Loader, 
  Navigation, 
  Quote,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import WorkabilityScore from './WorkabilityScore';
import { useScrollLock } from './useScrollLock';
import { useTheme } from './ThemeProvider';

const stripHtml = (html) => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const PhotoModal = ({ selectedPlace, fullImg, isPhotoLoading, setShowPhotoModal }) => {
  useScrollLock(true);
  const { isDark } = useTheme();

  const sanitizedDescription = selectedPlace?.description ? stripHtml(selectedPlace.description) : '';
  
  return (
    <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto md:overflow-hidden">
      <div className="min-h-screen md:flex md:items-center md:justify-center">
        <div className={`md:flex md:w-[90vw] md:max-w-6xl md:h-[85vh] ${
          isDark 
            ? 'bg-[#1a1f2c] border-white/10' 
            : 'bg-white border-gray-200'
        } md:rounded-lg overflow-hidden relative border`}>
          {/* Close Button - Visible on Desktop */}
          <button 
            onClick={() => setShowPhotoModal(false)}
            className={`hidden md:flex absolute right-4 top-4 z-20 items-center justify-center w-8 h-8 rounded-full transition-colors ${
              isDark 
                ? 'bg-white/10 hover:bg-white/20 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            <X size={20} />
          </button>

          {/* Mobile Header - Hidden on Desktop */}
          <div className={`sticky top-0 backdrop-blur-sm border-b z-10 md:hidden ${
            isDark 
              ? 'bg-[#1a1f2c]/95 border-white/10' 
              : 'bg-white/95 border-gray-200'
          }`}>
            <div className="flex items-center justify-between p-3">
              <button 
                onClick={() => setShowPhotoModal(false)}
                className={`flex items-center ${
                  isDark 
                    ? 'text-blue-300 hover:text-blue-200' 
                    : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                <ChevronLeft size={20} className="mr-1" />
                <span className="text-sm font-medium">Back</span>
              </button>
              <h2 className={`text-base font-semibold text-center flex-1 mx-4 truncate ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {selectedPlace?.title}
              </h2>
              <div className="w-8" />
            </div>
          </div>

          {/* Left Column - Image */}
          <div className="md:w-3/5 md:h-full bg-black">
            <div className="relative aspect-[4/3] md:aspect-auto md:h-full w-full">
              {isPhotoLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader size={32} className={
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  } />
                </div>
              ) : fullImg ? (
                <img
                  src={fullImg}
                  alt={selectedPlace?.title}
                  className="w-full h-full object-contain md:object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = isDark
                      ? "https://placehold.co/800x600/1a1f2c/blue?text=Image not available&font=raleway"
                      : "https://placehold.co/800x600/f8fafc/blue?text=Image not available&font=raleway";
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className={`text-sm ${
                    isDark ? 'text-blue-300/50' : 'text-blue-400/50'
                  }`}>
                    No image available
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="md:w-2/5 md:h-full md:overflow-y-auto">
            <div className={`p-4 space-y-4 ${
              isDark ? 'bg-[#1a1f2c]' : 'bg-white'
            }`}>
              {/* Title - Desktop Only */}
              <div className="hidden md:block">
                <h2 className={`text-xl font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {selectedPlace?.title}
                </h2>
              </div>

              {/* Location & Actions */}
              <div className="space-y-3">
                <div className="flex flex-col">
                  <p className={isDark ? 'text-sm text-blue-200' : 'text-sm text-gray-600'}>
                    {selectedPlace?.street}
                  </p>
                  <p className={isDark ? 'text-sm text-blue-200' : 'text-sm text-gray-600'}>
                    {selectedPlace?.city}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-end">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      `${selectedPlace?.street}, ${selectedPlace?.city}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors w-full sm:w-auto sm:ml-auto justify-center"
                  >
                    <Navigation size={14} className="mr-2" />
                    Get Directions
                  </a>
                </div>
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
                      <Quote size={16} className={`mr-2 ${
                        isDark ? 'text-blue-400' : 'text-blue-600'
                      }`} />
                      <h3 className={`text-sm font-medium ${
                        isDark ? 'text-blue-300' : 'text-blue-700'
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
                        : 'border-gray-200 bg-gray-100 text-gray-600'
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
  );
};

export default PhotoModal;