import React, { useState } from 'react';
import { X, Loader, ImageIcon, User, Wifi, Battery, VolumeX, Coffee, 
  Utensils, Wine, Sun, Dog, Info, ExternalLink, Navigation, AlertCircle } from 'lucide-react';

const stripHtml = (html) => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const CustomAlert = ({ children }) => (
  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 m-4 mt-0 rounded">
    <div className="flex">
      <div className="flex-shrink-0">
        <AlertCircle className="h-5 w-5 text-blue-400" />
      </div>
      <div className="ml-3">
        <p className="text-sm text-gray-600">
          {children}
        </p>
      </div>
    </div>
  </div>
);

const AmenityCategory = ({ title, children }) => (
  <div className="mb-6">
    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{title}</h4>
    <div className="space-y-2">{children}</div>
  </div>
);

const Amenity = ({ icon: Icon, name, value, detail = null }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div 
      className="flex items-center p-2 rounded hover:bg-gray-50 relative group"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className={`flex items-center flex-1 ${value ? 'text-gray-900' : 'text-gray-400'}`}>
        <Icon size={18} className="mr-2 flex-shrink-0" />
        <span className={`${value ? 'font-medium' : 'font-normal'}`}>{name}</span>
      </div>
      
      {detail && (
        <div className="ml-2 flex items-center">
          <span className={`text-sm ${value ? 'text-blue-500' : 'text-gray-400'}`}>
            {detail}
          </span>
        </div>
      )}
      
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded shadow-lg whitespace-nowrap">
          {value ? `Available: ${detail || 'Yes'}` : `Not Available`}
          <div className="absolute bottom-0 left-6 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
        </div>
      )}
    </div>
  );
};

const PhotoModal = ({ selectedPlace, fullImg, isPhotoLoading, setShowPhotoModal }) => {
  const sanitizedDescription = selectedPlace?.description ? stripHtml(selectedPlace.description) : '';
  
  const getWifiQuality = (speed) => {
    if (!speed) return false;
    if (speed >= 50) return 'Very Fast (50+ Mbps)';
    if (speed >= 20) return 'Fast (20-50 Mbps)';
    if (speed >= 10) return 'Good (10-20 Mbps)';
    return false;
  };

  const getPowerAvailability = (power) => {
    if (power === 'range3') return 'Plenty (>50% of seats)';
    if (power === 'range2') return 'Good (25-50% of seats)';
    if (power === 'range1') return 'Limited (<25% of seats)';
    return false;
  };

  const getNoiseLevel = (noise) => {
    if (noise === 'below average') return 'Quiet';
    if (noise === 'average') return 'Moderate';
    if (noise === 'above average') return 'Lively';
    return false;
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold">{selectedPlace?.title}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {selectedPlace?.street}, {selectedPlace?.city}
            </p>
          </div>
          <button 
            onClick={() => setShowPhotoModal(false)}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Left Column - Image */}
            <div className="space-y-6">
              <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-video">
                {isPhotoLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader size={48} className="text-gray-400 animate-spin" />
                  </div>
                ) : fullImg ? (
                  <img
                    src={fullImg}
                    alt={`${selectedPlace?.title}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/800x600/e5e7eb/e5e7eb?text=Image not available&font=raleway";
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <ImageIcon size={48} className="text-gray-400 mb-2" />
                    <p className="text-gray-500">No image available</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {sanitizedDescription && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Info size={18} className="mr-2 text-gray-400" />
                    About this place
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {sanitizedDescription}
                  </p>
                  {selectedPlace?.os && (
                    <div className="flex items-center mt-3 text-sm text-gray-500 border-t pt-3">
                      <User size={14} className="mr-1" />
                      <p>Added by {selectedPlace.os}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Amenities */}
            <div className="space-y-6">
              {/* Essential Amenities */}
              <AmenityCategory title="Essential Amenities">
                <Amenity 
                  icon={Wifi} 
                  name="WiFi" 
                  value={getWifiQuality(selectedPlace?.download)}
                  detail={getWifiQuality(selectedPlace?.download)}
                />
                <Amenity 
                  icon={Battery} 
                  name="Power Outlets" 
                  value={getPowerAvailability(selectedPlace?.power)}
                  detail={getPowerAvailability(selectedPlace?.power)}
                />
                <Amenity 
                  icon={VolumeX} 
                  name="Noise Level" 
                  value={getNoiseLevel(selectedPlace?.mappedNoise)}
                  detail={getNoiseLevel(selectedPlace?.mappedNoise)}
                />
              </AmenityCategory>

              {/* Food & Drinks */}
              <AmenityCategory title="Food & Drinks">
                <Amenity 
                  icon={Coffee} 
                  name="Coffee" 
                  value={selectedPlace?.type?.toLowerCase().includes('coffee')} 
                />
                <Amenity 
                  icon={Utensils} 
                  name="Food" 
                  value={selectedPlace?.food === '1'} 
                />
                <Amenity 
                  icon={Wine} 
                  name="Alcohol" 
                  value={selectedPlace?.alcohol === '1'} 
                />
              </AmenityCategory>

              {/* Additional Features */}
              <AmenityCategory title="Additional Features">
                <Amenity 
                  icon={Sun} 
                  name="Outdoor Seating" 
                  value={selectedPlace?.outdoor_seating === '1'} 
                />
                <Amenity 
                  icon={Dog} 
                  name="Pet Friendly" 
                  value={selectedPlace?.pet_friendly === '1'} 
                />
              </AmenityCategory>

              {/* Quick Actions */}
              <div className="flex gap-3 mt-6">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    `${selectedPlace?.street}, ${selectedPlace?.city}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Navigation size={18} className="mr-2" />
                  Get Directions
                </a>
               
              </div>
            </div>
          </div>
        </div>

        {/* Custom Alert for Missing Information */}
        {(!selectedPlace?.download || !selectedPlace?.power || !selectedPlace?.mappedNoise) && (
          <CustomAlert>
            Some amenity information may be incomplete. Help the community by updating this location's details on Workfrom.
          </CustomAlert>
        )}
      </div>
    </div>
  );
};

export default PhotoModal;