"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const Inner = dynamic(() => import("./delivery-route-map-inner"), {
  ssr: false,
  loading: () => (
    <Skeleton className="h-[min(420px,50vh)] w-full rounded-xl border border-border" />
  ),
});

export type DeliveryRouteMapProps = {
  className?: string;
  center: [number, number];
  zoom?: number;
  deliveryPosition: [number, number] | null;
  riderPosition: [number, number] | null;
  path: [number, number][];
  lineColor?: string;
};

export function DeliveryRouteMap(props: DeliveryRouteMapProps) {
  return <Inner {...props} />;
}
