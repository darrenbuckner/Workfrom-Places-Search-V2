import React, { useState } from 'react';
import { 
  X, 
  Loader, 
  ImageIcon, 
  User, 
  Wifi, 
  Battery, 
  VolumeX, 
  Coffee, 
  Utensils, 
  Wine, 
  Sun, 
  Navigation, 
  AlertCircle,
  Quote 
} from 'lucide-react';

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
          Some information may be incomplete. Help the community by{' '}
          <button 
            onClick={(e) => {
              e.preventDefault();
              alert("Thank you for your willingess to help! This feature will be implemented in the future.");
            }}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            providing an update
          </button>.
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
          {value ? `Available: ${detail || 'Yes'}` : `Not Available or Unknown`}
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
    if (speed <= 10) return 'Sluggish (0-10 Mbps)';
    return `${Math.round(speed)} Mbps`;
  };

  const getPowerAvailability = (power) => {
    if (!power || power === 'None') return false;
    const powerValue = String(power).toLowerCase();
    switch (powerValue) {
      case 'range3':
      case 'good':
        return 'Many (>50% of seats)';
      case 'range2':
        return 'Several (25-50% of seats)';
      case '':
      case 'range1':
      case 'little':
        return 'Few (<25% of seats)';
      default:
        return power;
    }
  };

  const isPowerAvailable = (power) => {
    if (!power || power === 'None') return false;
    const powerValue = String(power).toLowerCase();
    return !['none', '', 'undefined', 'null'].includes(powerValue);
  };

  const getNoiseLevel = (noise) => {
    if (!noise) return false;
    if (typeof noise === 'string') {
      const lowerNoise = noise.toLowerCase();
      if (lowerNoise.includes('quiet') || lowerNoise.includes('low')) return 'Moderate';
      if (lowerNoise.includes('moderate') || lowerNoise.includes('average')) return 'Average';
      if (lowerNoise.includes('noisy') || lowerNoise.includes('high')) return 'Lively';
      return noise;
    }
    return false;
  };

  // Check if outdoor seating is available (checking for any value in outside field)
  const hasOutdoorSeating = Boolean(
    selectedPlace?.outdoor_seating === '1' || 
    selectedPlace?.outside || 
    selectedPlace?.outside === 0 || 
    selectedPlace?.outside === "0"
  );

  // Check if coffee is available (any non-empty value in coffee field or coffee-related type)
  const hasCoffee = Boolean(
    selectedPlace?.coffee ||
    selectedPlace?.type?.toLowerCase().includes('coffee')
  );

  // Check if food is available (any non-empty value in food field)
  const hasFood = Boolean(
    selectedPlace?.food || 
    selectedPlace?.food === 0 || 
    selectedPlace?.food === "0"
  );

  // Check if alcohol is available (any non-empty value in alcohol field)
  const hasAlcohol = Boolean(
    selectedPlace?.alcohol || 
    selectedPlace?.alcohol === 0 || 
    selectedPlace?.alcohol === "0"
  );

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
            {/* Left Column */}
            <div className="space-y-6">
              {/* Image */}
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
                <div className="border border-gray-200 rounded-lg">
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                      <Quote size={20} className="mr-2 text-blue-500" />
                      A Closer Look
                    </h3>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-600 italic font-medium leading-relaxed">
                        {sanitizedDescription}
                      </p>
                    </div>
                  </div>
                  {selectedPlace?.os && (
                    <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50">
                      <div className="flex items-center text-sm text-gray-500">
                        <User size={14} className="mr-2 text-gray-400" />
                        <p>Added by {selectedPlace.os}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <AmenityCategory title="Essential Amenities">
                <Amenity 
                  icon={Wifi} 
                  name="WiFi" 
                  value={selectedPlace?.download}
                  detail={getWifiQuality(selectedPlace?.download)}
                />
                <Amenity 
                  icon={Battery} 
                  name="Power Outlets" 
                  value={isPowerAvailable(selectedPlace?.power)}
                  detail={getPowerAvailability(selectedPlace?.power)}
                />
                <Amenity 
                  icon={VolumeX} 
                  name="Noise Level" 
                  value={selectedPlace?.noise_level || selectedPlace?.noise}
                  detail={getNoiseLevel(selectedPlace?.noise_level || selectedPlace?.noise)}
                />
              </AmenityCategory>

              <AmenityCategory title="Food & Drinks">
                <Amenity 
                  icon={Coffee} 
                  name="Coffee" 
                  value={hasCoffee} 
                  detail={hasCoffee ? "Yes" : null}
                />
                <Amenity 
                  icon={Utensils} 
                  name="Food" 
                  value={hasFood}
                  detail={hasFood ? "Yes" : null}
                />
                <Amenity 
                  icon={Wine} 
                  name="Alcohol" 
                  value={hasAlcohol}
                  detail={hasAlcohol ? "Yes" : null}
                />
              </AmenityCategory>

              <AmenityCategory title="Additional Features">
                <Amenity 
                  icon={Sun} 
                  name="Outdoor Seating" 
                  value={hasOutdoorSeating}
                  detail={hasOutdoorSeating ? "Yes" : null}
                />
              </AmenityCategory>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  `${selectedPlace?.street}, ${selectedPlace?.city}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium w-full"
              >
                <Navigation size={18} className="mr-2" />
                Get Directions
              </a>
            </div>
          </div>
        </div>

        {/* Alert for Missing Information */}
        {(!selectedPlace?.download || !selectedPlace?.power || !selectedPlace?.noise_level) && (
          <CustomAlert />
        )}
      </div>
    </div>
  );
};

export default PhotoModal;