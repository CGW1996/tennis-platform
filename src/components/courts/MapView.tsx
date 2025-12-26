'use client';

import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { Court } from '@/types/court';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/icons/marker-icon-2x.png',
  iconUrl: '/icons/marker-icon.png',
  shadowUrl: '/icons/marker-shadow.png',
});

interface MapViewProps {
  courts: Court[];
  selectedCourt: Court | null;
  onCourtSelect: (court: Court) => void;
}

// Component to handle map updates
function MapUpdater({ selectedCourt, courts }: { selectedCourt: Court | null; courts: Court[] }) {
  const map = useMap();

  useEffect(() => {
    if (selectedCourt) {
      map.setView([selectedCourt.latitude, selectedCourt.longitude], 15);
    } else if (courts.length > 0 && courts[0]) {
      map.setView([courts[0].latitude, courts[0].longitude], 12);
    }
  }, [selectedCourt, courts, map]);

  return null;
}

export default function MapView({ courts, selectedCourt, onCourtSelect }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Set initial center based on available data
  const getInitialCenter = (): [number, number] => {
    if (courts.length > 0 && courts[0]) {
      return [courts[0].latitude, courts[0].longitude];
    }
    return [25.0330, 121.5654]; // Default to Taipei
  };

  // Create a stable key to force remount when needed
  // This prevents the "Map container is already initialized" error
  const mapKey = courts.length > 0 ? `map-${courts[0]?.id || 'default'}` : 'map-default';

  const createCustomIcon = (isSelected: boolean) => {
    return L.divIcon({
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background: ${isSelected ? '#059669' : '#10b981'};
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          font-size: 14px;
          color: white;
          font-weight: bold;
        ">
          🎾
        </div>
      `,
      className: 'custom-div-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  return (
    <div ref={containerRef} style={{ height: '100%', width: '100%' }}>
      <MapContainer
        key={mapKey}
        center={getInitialCenter()}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <MapUpdater selectedCourt={selectedCourt} courts={courts} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {courts.map((court) => (
          <Marker
            key={court.id}
            position={[court.latitude, court.longitude]}
            icon={createCustomIcon(selectedCourt?.id === court.id)}
            eventHandlers={{
              click: () => onCourtSelect(court),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-gray-900 mb-1">{court.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{court.address}</p>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>價格:</span>
                    <span className="font-medium">${court.pricePerHour}/小時</span>
                  </div>
                  <div className="flex justify-between">
                    <span>類型:</span>
                    <span className="capitalize">{court.courtType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>評分:</span>
                    <span className="flex items-center">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1">{court.averageRating} ({court.totalReviews})</span>
                    </span>
                  </div>
                </div>
                <button
                  className="w-full mt-2 bg-emerald-600 text-white px-3 py-1 rounded text-sm hover:bg-emerald-700"
                  onClick={() => {
                    // Navigate to court detail page
                    window.location.href = `/courts/${court.id}`;
                  }}
                >
                  查看詳情
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}