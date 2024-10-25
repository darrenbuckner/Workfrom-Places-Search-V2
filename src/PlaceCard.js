import React from 'react';
import { 
  Navigation, 
  Copy, 
  AlertTriangle, 
  Star,
  User,
  Wifi,
  WifiOff
} from 'lucide-react';
import LazyImage from './LazyImage';
import WorkabilityScore from './WorkabilityScore';

const PlaceCard = ({ place, onPhotoClick }) => {
  const copyAddressToClipboard = (address) => {
    navigator.clipboard.writeText(address).then(
      () => alert('Address copied to clipboard!'),
      (err) => console.error('Could not copy text: ', err)
    );
  };

  const getGoogleMapsUrl = (address) => 
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  const reportPlace = (placeId) => {
    console.log(`Reported place with ID: ${placeId}`);
    alert("Thank you for your report. This feature will be implemented in the future.");
  };

  const getWifiStatus = () => {
    if (place.no_wifi === "1") {
      return { icon: WifiOff, text: "No WiFi Available", colorClass: "text-red-500" };
    }
    if (place.download) {
      return { 
        icon: Wifi, 
        text: `WiFi Speed: ${Math.round(place.download)} Mbps`, 
        colorClass: "text-green-600" 
      };
    }
    return { icon: Wifi, text: "WiFi Status Unknown", colorClass: "text-gray-500" };
  };

  const wifiStatus = getWifiStatus();

  return (
    <div 
      className={`border p-4 rounded shadow-sm hover:shadow-md transition-shadow relative ${
        place.owner_promoted_flag === "1" ? 'border-yellow-400 bg-yellow-50' : ''
      }`}
    >
      {place.owner_promoted_flag === "1" && (
        <div className="absolute top-0 right-0 bg-red-400 text-white px-2 py-1 rounded-bl text-xs flex items-center">
          <Star size={12} className="mr-1" />
          Promoted
        </div>
      )}
      
      <div className="flex flex-col space-y-4">
        <div className="flex items-start space-x-4">
          {/* Thumbnail */}
          <div 
            className="w-24 h-24 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center cursor-pointer"
            onClick={onPhotoClick}
          >
            {place.thumbnail_img ? (
              <LazyImage
                src={place.thumbnail_img}
                alt={place.title}
                placeholder="https://placehold.co/100x100/e5e7eb/e5e7eb?text=Loading...&font=raleway"
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <span className="text-gray-400 text-xs">No image</span>
            )}
          </div>

          {/* Content */}
          <div className="flex-grow min-w-0">
            <div className="flex justify-between items-start">
              <h2 
                className="text-xl font-semibold mb-1 truncate cursor-pointer hover:text-blue-600 transition-colors" 
                title={place.title}
                onClick={onPhotoClick}
              >
                {place.title}
              </h2>
              <WorkabilityScore place={place} variant="compact" />
            </div>

            <p className="text-sm mb-2">
              Distance: {place.distance} miles
            </p>

            {/* WiFi Status */}
            <div className="mb-2">
              <p className={`text-sm flex items-center ${wifiStatus.colorClass}`}>
                <wifiStatus.icon size={16} className="mr-1.5" />
                <strong>{wifiStatus.text}</strong>
              </p>
            </div>

            <div className="flex items-center text-sm">
              <span className="mr-1">Noise Levels:</span>
              <span className={`font-medium ${
                place.mappedNoise === 'Below average' ? 'text-green-600' :
                place.mappedNoise === 'Average' ? 'text-blue-600' :
                place.mappedNoise === 'Above average' ? 'text-yellow-600' :
                'text-text-primary'
              }`}>
                {place.mappedNoise}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-between gap-2">
          {place.os && (
            <div className="text-text-primary text-sm flex items-center">
              <User size={16} className="mr-1 flex-shrink-0" />
              <span>{place.os}</span>
            </div>
          )}
          
          <a
            href={getGoogleMapsUrl(`${place.street}, ${place.city}, ${place.postal}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
          >
            <Navigation size={16} className="mr-1 flex-shrink-0" />
            <span className="hidden sm:inline">Get Directions</span>
            <span className="sm:hidden">Directions</span>
          </a>

          <button
            onClick={() => copyAddressToClipboard(`${place.street}, ${place.city}, ${place.postal}`)}
            className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
          >
            <Copy size={16} className="mr-1 flex-shrink-0" />
            <span className="hidden sm:inline">Copy Address</span>
            <span className="sm:hidden">Copy</span>
          </button>

          <button
            onClick={() => reportPlace(place.ID)}
            className="text-gray-500 hover:text-yellow-700 text-sm flex items-center"
          >
            <AlertTriangle size={16} className="mr-1 flex-shrink-0" />
            <span className="hidden sm:inline">Report</span>
            <span className="sm:hidden">Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;