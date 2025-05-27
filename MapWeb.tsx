// MapWeb.tsx - Web version using Leaflet
import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const OPENWEATHER_API_KEY = 'your-api-key-here';

export default function MapWeb() {
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <MapContainer
        center={[53.3498, -6.2603] as [number,number]}
        zoom={7}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url={`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`}
        />
      </MapContainer>
    </div>
  );
}
