import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const NearbyPlacesMap = ({ places, userLocation }) => {
  const [activePlace, setActivePlace] = useState(null);

  return (
    <MapContainer center={[userLocation.latitude, userLocation.longitude]} zoom={13} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {places.map(place => (
        <Marker
          key={place.ID}
          position={[place.latitude, place.longitude]}
          eventHandlers={{
            mouseover: () => setActivePlace(place),
            mouseout: () => setActivePlace(null),
          }}
        >
          <Popup>
            <div>
              <h3>{place.title}</h3>
              <p>Distance: {place.distance} miles</p>
              {place.download && <p>WiFi Speed: {Math.round(place.download)} Mbps</p>}
              <p>Noise Level: {place.mappedNoise}</p>
            </div>
          </Popup>
        </Marker>
      ))}
      {activePlace && (
        <div className="absolute bottom-0 left-0 bg-white p-2 m-2 rounded shadow z-1000">
          <h3>{activePlace.title}</h3>
          <p>Distance: {activePlace.distance} miles</p>
          {activePlace.download && <p>WiFi Speed: {Math.round(activePlace.download)} Mbps</p>}
          <p>Noise Level: {activePlace.mappedNoise}</p>
        </div>
      )}
    </MapContainer>
  );
};

export default NearbyPlacesMap;