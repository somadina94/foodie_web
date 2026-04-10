"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const MapInner = dynamic(() => import("./leaflet-map-inner"), {
  ssr: false,
  loading: () => (
    <Skeleton className="h-[min(420px,50vh)] w-full rounded-xl border border-border" />
  ),
});

type Props = {
  className?: string;
  center: [number, number];
  zoom?: number;
  markerPosition?: [number, number];
};

export function LeafletMap(props: Props) {
  return <MapInner {...props} />;
}
