'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet';
import type { Place } from '@/lib/api/types';

export interface TripMapProps {
  origin: Place | null;
  destination: Place | null;
  geometry: [number, number][] | null;
}

// Manila as the default view.
const DEFAULT_CENTER: [number, number] = [14.5995, 120.9842];

const pin = (color: string, letter: string) =>
  L.divIcon({
    className: '',
    html: `<div style="background:${color};color:#fff;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #14171f;display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);font:700 12px system-ui">${letter}</span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  const key = points.map((p) => p.join(',')).join('|');
  useEffect(() => {
    if (points.length === 1) map.setView(points[0], 15);
    else if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
}

export default function TripMap({ origin, destination, geometry }: TripMapProps) {
  const points: [number, number][] =
    geometry && geometry.length > 1
      ? geometry
      : ([origin && [origin.lat, origin.lng], destination && [destination.lat, destination.lng]].filter(Boolean) as [
          number,
          number,
        ][]);

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={11}
      scrollWheelZoom={false}
      className="h-full w-full"
      aria-label="Map of your trip"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {origin && (
        <Marker position={[origin.lat, origin.lng]} icon={pin('#1D4E89', 'A')}>
          <Tooltip>{origin.label}</Tooltip>
        </Marker>
      )}
      {destination && (
        <Marker position={[destination.lat, destination.lng]} icon={pin('#C8102E', 'B')}>
          <Tooltip>{destination.label}</Tooltip>
        </Marker>
      )}
      {geometry && geometry.length > 1 && <Polyline positions={geometry} pathOptions={{ color: '#1D4E89', weight: 5, opacity: 0.85 }} />}
      <FitBounds points={points} />
    </MapContainer>
  );
}
