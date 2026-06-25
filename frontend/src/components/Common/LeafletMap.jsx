import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet icon paths in React bundle
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Pins
const donorIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const orphanageIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// View updater helper component
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, 12);
    }
  }, [center, map]);
  return null;
};

const LeafletMap = ({ donorLoc, orphanages = [], activeOrphanage = null }) => {
  // Fallback default coordinates if not provided (e.g. Hyderabad, India center)
  const defaultCenter = [17.3850, 78.4867];
  
  const mapCenter = donorLoc && donorLoc.latitude && donorLoc.longitude
    ? [donorLoc.latitude, donorLoc.longitude]
    : defaultCenter;

  return (
    <div className="map-container" style={{ position: 'relative', zIndex: 1 }}>
      <MapContainer
        center={mapCenter}
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Recenter Map Helper */}
        <RecenterMap center={mapCenter} />

        {/* Donor Marker */}
        {donorLoc && donorLoc.latitude && donorLoc.longitude && (
          <Marker position={[donorLoc.latitude, donorLoc.longitude]} icon={donorIcon}>
            <Popup>
              <strong>You (Donor)</strong>
              <br />
              Location: {donorLoc.village || 'My coordinates'}
            </Popup>
          </Marker>
        )}

        {/* Orphanage Markers */}
        {orphanages.map((orphanage) => {
          if (!orphanage.latitude || !orphanage.longitude) return null;
          return (
            <Marker
              key={orphanage._id || orphanage.id}
              position={[orphanage.latitude, orphanage.longitude]}
              icon={orphanageIcon}
            >
              <Popup>
                <strong>{orphanage.orphanageName || orphanage.name}</strong>
                <br />
                Phone: {orphanage.phone}
                {orphanage.distance && (
                  <>
                    <br />
                    Distance: {orphanage.distance.toFixed(1)} km
                  </>
                )}
              </Popup>
            </Marker>
          );
        })}

        {/* If viewing a single active orphanage connection, draw polyline route */}
        {donorLoc && donorLoc.latitude && donorLoc.longitude && activeOrphanage && activeOrphanage.latitude && activeOrphanage.longitude && (
          <>
            <Marker position={[activeOrphanage.latitude, activeOrphanage.longitude]} icon={orphanageIcon}>
              <Popup>
                <strong>Connected: {activeOrphanage.orphanageName}</strong>
                <br />
                Contact: {activeOrphanage.phone}
              </Popup>
            </Marker>
            <Polyline
              positions={[
                [donorLoc.latitude, donorLoc.longitude],
                [activeOrphanage.latitude, activeOrphanage.longitude]
              ]}
              color="var(--primary)"
              dashArray="5, 10"
              weight={3}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default LeafletMap;
