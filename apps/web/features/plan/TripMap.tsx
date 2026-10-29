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

// Same marks as the From/To stack: a ringed dot for the pickup, an ink square for the drop-off.
const originIcon = L.divIcon({
  className: '',
  html: '<div style="width:20px;height:20px;border-radius:50%;background:#fff;border:4px solid #08744C;box-shadow:0 1px 4px rgba(21,24,28,.35)"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});
const destIcon = L.divIcon({
  className: '',
  html: '<div style="width:20px;height:20px;border-radius:5px;background:#15181C;border:3px solid #fff;box-shadow:0 1px 4px rgba(21,24,28,.35)"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
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

/** The container can open, close or resize after Leaflet measured it (the phone map expands). Re-measure. */
function InvalidateOnResize() {
  const map = useMap();
  useEffect(() => {
    const el = map.getContainer();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(el);
    // The phone panel expands with a ~300ms transition; measure again once it has settled.
    const timers = [60, 350].map((ms) => window.setTimeout(() => map.invalidateSize(), ms));
    return () => {
      ro.disconnect();
      timers.forEach(window.clearTimeout);
    };
  }, [map]);
  return null;
}

export default function TripMap({ origin, destination, geometry }: TripMapProps) {
  const hasRoute = !!geometry && geometry.length > 1;
  const points: [number, number][] = hasRoute
    ? geometry
    : ([origin && [origin.lat, origin.lng], destination && [destination.lat, destination.lng]].filter(Boolean) as [
        number,
        number,
      ][]);
  const routeKey = hasRoute ? `${geometry.length}:${geometry[0].join(',')}:${geometry[geometry.length - 1].join(',')}` : 'none';

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={11}
      scrollWheelZoom
      className="h-full w-full"
      aria-label="Map of your trip"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {origin && (
        <Marker position={[origin.lat, origin.lng]} icon={originIcon}>
          <Tooltip>{origin.label}</Tooltip>
        </Marker>
      )}
      {destination && (
        <Marker position={[destination.lat, destination.lng]} icon={destIcon}>
          <Tooltip>{destination.label}</Tooltip>
        </Marker>
      )}
      {hasRoute && (
        <Polyline
          // A new route is a new element, so the line draws itself again.
          key={routeKey}
          positions={geometry}
          pathOptions={{ color: '#08744C', weight: 6, opacity: 1, lineCap: 'round', lineJoin: 'round', className: 'route-line' }}
          eventHandlers={{
            // pathLength=1 lets the CSS draw animation run along the real path without measuring it.
            add: (e) => (e.target as L.Polyline).getElement()?.setAttribute('pathLength', '1'),
          }}
        />
      )}
      <FitBounds points={points} />
      <InvalidateOnResize />
    </MapContainer>
  );
}
