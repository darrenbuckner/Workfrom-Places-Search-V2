import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation } from 'lucide-react';

const NearbyPlacesMap = ({ places, userLocation }) => {
  const defaultPosition = [userLocation.latitude, userLocation.longitude];

  const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const placeIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const getGoogleMapsUrl = (address) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };

  return (
    <MapContainer center={defaultPosition} zoom={13} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={defaultPosition} icon={userIcon}>
        <Popup>Your location</Popup>
      </Marker>
      {places.map((place) => (
        <Marker
          key={place.ID}
          position={[place.latitude, place.longitude]}
          icon={placeIcon}
        >
          <Popup>
            <div>
              <h3 className="font-bold">{place.title}</h3>
              <p>{place.street}, {place.city}, {place.postal}</p>
              <p>Distance: {place.distance} miles</p>
              {place.download && (
                <p>WiFi Speed: {Math.round(place.download)} Mbps</p>
              )}
              <p>Background Noise: {place.mappedNoise}</p>
              <a
                href={getGoogleMapsUrl(`${place.street}, ${place.city}, ${place.postal}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 flex items-center mt-2"
              >
                <Navigation size={16} className="mr-1" />
                Get Directions
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default NearbyPlacesMap;