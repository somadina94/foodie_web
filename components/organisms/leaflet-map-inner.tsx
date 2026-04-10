"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const icon = L.icon({
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

export default function LeafletMapInner({
  className,
  center,
  zoom = 13,
  markerPosition,
}: {
  className?: string;
  center: [number, number];
  zoom?: number;
  markerPosition?: [number, number];
}) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className ?? "z-0 h-[min(420px,50vh)] w-full rounded-xl border border-border"}
      scrollWheelZoom
    >
      <ResizeOnMount />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markerPosition ? (
        <Marker position={markerPosition} icon={icon}>
          <Popup>Delivery area</Popup>
        </Marker>
      ) : null}
    </MapContainer>
  );
}
