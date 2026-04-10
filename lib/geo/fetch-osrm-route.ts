import { haversineMeters } from "@/lib/geo/haversine";

export type OsrmRouteResult = {
  latlngs: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
};

/**
 * Driving route via public OSRM (OpenStreetMap). Falls back to a straight line if the service fails.
 */
export async function fetchOsrmRouteWithFallback(
  from: [number, number],
  to: [number, number],
): Promise<OsrmRouteResult> {
  const [lat1, lng1] = from;
  const [lat2, lng2] = to;
  const straight = haversineMeters(from, to);
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("OSRM error");
    const json = (await res.json()) as {
      routes?: { distance: number; duration: number; geometry: { coordinates: [number, number][] } }[];
    };
    const route = json.routes?.[0];
    const coords = route?.geometry?.coordinates;
    if (!route || !coords?.length) throw new Error("No route");
    const latlngs: [number, number][] = coords.map(([lng, lat]) => [lat, lng]);
    return {
      latlngs,
      distanceMeters: route.distance,
      durationSeconds: route.duration,
    };
  } catch {
    return {
      latlngs: [from, to],
      distanceMeters: straight,
      durationSeconds: 0,
    };
  }
}
