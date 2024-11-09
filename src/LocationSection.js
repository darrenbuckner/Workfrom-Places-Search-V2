import React from 'react';
import { MapPin, Navigation, Clock } from 'lucide-react';

const LocationSection = ({ place }) => {
  const getGoogleMapsUrl = (mode = 'driving') => {
    const address = `${place.street}, ${place.city}, ${place.postal}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}&travelmode=${mode}`;
  };

  const getDistanceDescription = () => {
    const distance = parseFloat(place.distance);
    if (distance <= 0.1) return 'Very short walk';
    if (distance <= 0.5) return 'Pleasant walk';
    if (distance <= 2) return 'Quick bike ride';
    if (distance <= 5) return 'Short drive';
    return 'Drive';
  };

  const getEstimatedTime = () => {
    const distance = parseFloat(place.distance);
    const walkingMins = Math.round(distance * 20);
    const bikingMins = Math.round(distance * 6);
    const drivingMins = Math.round(distance * 2) + 5;

    return {
      walking: walkingMins > 60 ? `${Math.round(walkingMins/60)}h ${walkingMins%60}m` : `${walkingMins}m`,
      biking: bikingMins > 60 ? `${Math.round(bikingMins/60)}h ${bikingMins%60}m` : `${bikingMins}m`,
      driving: drivingMins > 60 ? `${Math.round(drivingMins/60)}h ${drivingMins%60}m` : `${drivingMins}m`
    };
  };

  const times = getEstimatedTime();

  return (
    <div className="mb-4">
      <div className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        <div className="p-4">
          {/* Address and Base Distance */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/10 
              flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-[var(--accent-primary)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)]">{place.street}</p>
              <p className="text-sm text-[var(--text-secondary)]">
                {place.city}{place.postal ? `, ${place.postal}` : ''}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {place.distance} miles away • {getDistanceDescription()}
              </p>
            </div>
          </div>

          {/* Travel Options */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { mode: 'walking', label: 'Walk', time: times.walking, show: parseFloat(place.distance) <= 2 },
              { mode: 'bicycling', label: 'Bike', time: times.biking, show: parseFloat(place.distance) <= 5 },
              { mode: 'driving', label: 'Drive', time: times.driving, show: true }
            ].filter(option => option.show).map(option => (
              <a
                key={option.mode}
                href={getGoogleMapsUrl(option.mode)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded-md
                  border border-[var(--border-primary)] bg-[var(--bg-primary)]
                  hover:border-[var(--accent-primary)] transition-colors group"
              >
                <div className="flex flex-col items-center flex-1">
                  <span className="text-xs font-medium text-[var(--text-primary)]">
                    {option.label}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {option.time}
                  </span>
                </div>
                <Navigation size={14} className="text-[var(--text-secondary)] 
                  group-hover:text-[var(--accent-primary)]" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSection;