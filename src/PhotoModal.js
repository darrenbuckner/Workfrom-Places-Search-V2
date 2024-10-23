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

const stripHtml = (html) => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const PhotoModal = ({ selectedPlace, fullImg, isPhotoLoading, setShowPhotoModal }) => {
  const sanitizedDescription = selectedPlace?.description ? stripHtml(selectedPlace.description) : '';
  
  return (
    <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto md:overflow-hidden">
      {/* Modal Container */}
      <div className="min-h-screen md:flex md:items-center md:justify-center">
        <div className="md:flex md:w-[90vw] md:max-w-6xl md:h-[85vh] bg-white md:rounded-lg overflow-hidden relative">
          {/* Close Button - Visible on Desktop */}
          <button 
            onClick={() => setShowPhotoModal(false)}
            className="hidden md:flex absolute right-4 top-4 z-20 items-center justify-center w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
          >
            <X size={20} />
          </button>

          {/* Mobile Header - Hidden on Desktop */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b z-10 md:hidden">
            <div className="flex items-center justify-between p-3">
              <button 
                onClick={() => setShowPhotoModal(false)}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft size={20} className="mr-1" />
                <span className="text-sm font-medium">Back</span>
              </button>
              <h2 className="text-base font-semibold text-center flex-1 mx-4 truncate">
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
                  <Loader size={32} className="text-white animate-spin" />
                </div>
              ) : fullImg ? (
                <img
                  src={fullImg}
                  alt={selectedPlace?.title}
                  className="w-full h-full object-contain md:object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/800x600/e5e7eb/e5e7eb?text=Image not available&font=raleway";
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white/50">
                  <p className="text-sm">No image available</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="md:w-2/5 md:h-full md:overflow-y-auto">
            <div className="p-4 bg-white space-y-4">
              {/* Title - Desktop Only */}
              <div className="hidden md:block">
                <h2 className="text-xl font-semibold">
                  {selectedPlace?.title}
                </h2>
              </div>

              {/* Location & Actions - Redesigned for better spacing */}
              <div className="space-y-3">
                <div className="flex flex-col">
                  <p className="text-sm text-gray-600">
                    {selectedPlace?.street}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedPlace?.city}
                  </p>
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    `${selectedPlace?.street}, ${selectedPlace?.city}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors w-full sm:w-auto justify-center"
                >
                  <Navigation size={14} className="mr-2" />
                  Get Directions
                </a>
              </div>

              {/* Workability Score */}
              <WorkabilityScore place={selectedPlace} variant="full" />

              {/* Description */}
              {sanitizedDescription && (
                <div className="border rounded-lg">
                  <div className="p-3">
                    <div className="flex items-center text-gray-800 mb-2">
                      <Quote size={16} className="mr-1 text-blue-500" />
                      <h3 className="text-sm font-medium">A Closer Look</h3>
                    </div>
                    <p className="text-gray-600 italic">
                      {sanitizedDescription}
                    </p>
                  </div>
                  {selectedPlace?.os && (
                    <div className="border-t px-3 py-2 bg-gray-50 text-xs text-gray-500">
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