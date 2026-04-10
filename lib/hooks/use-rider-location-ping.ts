"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/services/orderService";

const MIN_INTERVAL_MS = 12_000;

/**
 * While enabled, watches geolocation and POSTs rider location to the server on an interval.
 * Returns live coordinates for immediate map display.
 */
export function useRiderLocationPing(orderId: string, enabled: boolean) {
  const queryClient = useQueryClient();
  const [livePosition, setLivePosition] = useState<[number, number] | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    if (!enabled || typeof navigator === "undefined" || !navigator.geolocation) {
      return;
    }

    let watchId: number;
    let lastSent = 0;

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLivePosition([lat, lng]);
        setPermissionDenied(false);
        const now = Date.now();
        if (now - lastSent < MIN_INTERVAL_MS) return;
        lastSent = now;
        void orderService.patchRiderLocation(orderId, lat, lng).then(() => {
          void queryClient.invalidateQueries({ queryKey: ["order", orderId] });
        });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionDenied(true);
        }
      },
      /* false works better on Mac/desktop where there is no GPS */
      { enableHighAccuracy: false, maximumAge: 15_000, timeout: 30_000 },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [enabled, orderId, queryClient]);

  return { livePosition, permissionDenied };
}
