"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { DeliveryRouteMap } from "@/components/organisms/delivery-route-map";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { orderService, type Order } from "@/services/orderService";
import { fetchOsrmRouteWithFallback } from "@/lib/geo/fetch-osrm-route";
import { formatRoadDistance } from "@/lib/geo/haversine";
import { useRiderLocationPing } from "@/lib/hooks/use-rider-location-ping";

const DEFAULT_CENTER: [number, number] = [40.7128, -74.006];

function envCenter(): [number, number] {
  const lat = Number(process.env.NEXT_PUBLIC_TRACKING_MAP_LAT);
  const lng = Number(process.env.NEXT_PUBLIC_TRACKING_MAP_LNG);
  if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
  return DEFAULT_CENTER;
}

export type DeliveryTrackingMapSectionProps = {
  order: Order;
  orderId: string;
  viewerRole: "customer" | "rider";
};

export function DeliveryTrackingMapSection({
  order,
  orderId,
  viewerRole,
}: DeliveryTrackingMapSectionProps) {
  const queryClient = useQueryClient();

  const trackRider =
    viewerRole === "rider" &&
    (order.status === "rider_assigned" || order.status === "out_for_delivery");

  const { livePosition, permissionDenied } = useRiderLocationPing(orderId, trackRider);

  const needsGeocode =
    Boolean(order.deliveryAddress?.trim()) &&
    (order.deliveryLat == null || order.deliveryLng == null);

  const geocodeQuery = useQuery({
    queryKey: ["order-delivery-geocode", orderId, order.deliveryAddress],
    queryFn: async () => {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(order.deliveryAddress)}`);
      const body = (await res.json().catch(() => ({}))) as { error?: string; lat?: number; lng?: number };
      if (!res.ok) {
        throw new Error(body.error ?? "Could not geocode address");
      }
      const { lat, lng } = body as { lat: number; lng: number };
      await orderService.patchDeliveryLocation(orderId, lat, lng);
      void queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      return { lat, lng };
    },
    enabled: Boolean(orderId) && needsGeocode,
    retry: false,
    staleTime: Infinity,
  });

  const deliveryPos = useMemo((): [number, number] | null => {
    if (order.deliveryLat != null && order.deliveryLng != null) {
      return [order.deliveryLat, order.deliveryLng];
    }
    return null;
  }, [order.deliveryLat, order.deliveryLng]);

  const riderPos: [number, number] | null = useMemo(() => {
    if (viewerRole === "rider" && livePosition) return livePosition;
    if (order.riderLat != null && order.riderLng != null) {
      return [order.riderLat, order.riderLng];
    }
    return null;
  }, [viewerRole, livePosition, order.riderLat, order.riderLng]);

  const activeLeg =
    order.status === "rider_assigned" || order.status === "out_for_delivery";

  const [routeState, setRouteState] = useState<{
    path: [number, number][];
    distanceM: number | null;
    loading: boolean;
  }>({ path: [], distanceM: null, loading: false });

  useEffect(() => {
    if (!activeLeg || !deliveryPos || !riderPos) {
      setRouteState({ path: [], distanceM: null, loading: false });
      return;
    }
    let cancelled = false;
    setRouteState((s) => ({ ...s, loading: true }));
    void fetchOsrmRouteWithFallback(riderPos, deliveryPos).then((r) => {
      if (cancelled) return;
      setRouteState({
        path: r.latlngs,
        distanceM: r.distanceMeters,
        loading: false,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [activeLeg, deliveryPos, riderPos]);

  const mapCenter = deliveryPos ?? riderPos ?? envCenter();

  const showRouteMeta = activeLeg && deliveryPos && riderPos && routeState.distanceM != null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Delivery tracking</CardTitle>
        <CardDescription>
          {activeLeg
            ? "Road route from the rider to the delivery address. Distance follows drivable roads (OpenStreetMap)."
            : "Map shows your delivery drop-off once the address is located. Live rider line appears when a rider is assigned and sharing location."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {viewerRole === "rider" && trackRider && permissionDenied ? (
          <div
            className="flex gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:bg-amber-500/15 dark:text-amber-50"
            role="status"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>
              Location access is off. Turn it on in your browser settings so the customer can see
              your position and route while this delivery is active.
            </p>
          </div>
        ) : null}

        {geocodeQuery.isPending && needsGeocode ? (
          <p className="text-sm text-muted-foreground">Locating your address on the map…</p>
        ) : null}
        {geocodeQuery.isError ? (
          <p className="text-sm text-destructive">
            {geocodeQuery.error instanceof Error
              ? geocodeQuery.error.message
              : "Could not locate this address."}
          </p>
        ) : null}

        {routeState.loading && activeLeg && deliveryPos && riderPos ? (
          <p className="text-sm text-muted-foreground">Drawing route…</p>
        ) : null}

        {showRouteMeta && routeState.distanceM != null ? (
          <p className="text-sm font-medium text-foreground">
            Road distance: {formatRoadDistance(routeState.distanceM)}
          </p>
        ) : null}

        {activeLeg && deliveryPos && !riderPos ? (
          <p className="text-sm text-muted-foreground">
            Waiting for the rider&apos;s location. They must enable location sharing on their device
            while this order is assigned or out for delivery.
          </p>
        ) : null}

        <DeliveryRouteMap
          className="min-h-[min(320px,45vh)]"
          center={mapCenter}
          deliveryPosition={deliveryPos}
          riderPosition={riderPos}
          path={routeState.path}
        />

        {!activeLeg && deliveryPos ? (
          <p className="text-sm text-muted-foreground">
            A rider line and distance will appear when someone is assigned and en route.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
