"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  CircleMarker,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const deliveryIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function ResizeOnMount() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
}

function FitBounds({
  path,
  deliveryPosition,
  riderPosition,
  fallbackCenter,
}: {
  path: [number, number][];
  deliveryPosition: [number, number] | null;
  riderPosition: [number, number] | null;
  fallbackCenter: [number, number];
}) {
  const map = useMap();
  useEffect(() => {
    const pts: [number, number][] = [];
    if (path.length >= 2) {
      path.forEach((p) => pts.push(p));
    }
    if (deliveryPosition) pts.push(deliveryPosition);
    if (riderPosition) pts.push(riderPosition);
    if (pts.length === 0) {
      map.setView(fallbackCenter, 12);
      return;
    }
    if (pts.length === 1) {
      map.setView(pts[0], 14);
      return;
    }
    const b = L.latLngBounds(pts);
    map.fitBounds(b, { padding: [48, 48], maxZoom: 15 });
  }, [map, path, deliveryPosition, riderPosition, fallbackCenter]);
  return null;
}

export default function DeliveryRouteMapInner({
  className,
  center,
  zoom = 13,
  deliveryPosition,
  riderPosition,
  path,
  lineColor = "#f76707",
}: {
  className?: string;
  center: [number, number];
  zoom?: number;
  deliveryPosition: [number, number] | null;
  riderPosition: [number, number] | null;
  path: [number, number][];
  lineColor?: string;
}) {
  const mapClass =
    className ?? "z-0 h-[min(420px,50vh)] w-full rounded-xl border border-border";

  const showPolyline = useMemo(() => path.length >= 2, [path.length]);

  return (
    <MapContainer center={center} zoom={zoom} className={mapClass} scrollWheelZoom>
      <ResizeOnMount />
      <FitBounds
        path={path}
        deliveryPosition={deliveryPosition}
        riderPosition={riderPosition}
        fallbackCenter={center}
      />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {showPolyline ? (
        <Polyline
          positions={path}
          pathOptions={{ color: lineColor, weight: 5, opacity: 0.88 }}
        />
      ) : null}
      {deliveryPosition ? (
        <Marker position={deliveryPosition} icon={deliveryIcon}>
          <Popup>Delivery address</Popup>
        </Marker>
      ) : null}
      {riderPosition ? (
        <CircleMarker
          center={riderPosition}
          radius={11}
          pathOptions={{
            color: lineColor,
            fillColor: lineColor,
            fillOpacity: 0.95,
            weight: 2,
          }}
        >
          <Popup>Rider</Popup>
        </CircleMarker>
      ) : null}
    </MapContainer>
  );
}
