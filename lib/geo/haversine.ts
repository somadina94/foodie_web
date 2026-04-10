/** Great-circle distance in meters between two WGS84 points. */
export function haversineMeters(
  a: readonly [number, number],
  b: readonly [number, number],
): number {
  const R = 6371000;
  const [lat1, lon1] = a.map((x) => (x * Math.PI) / 180) as [number, number];
  const [lat2, lon2] = b.map((x) => (x * Math.PI) / 180) as [number, number];
  const dlat = lat2 - lat1;
  const dlon = lon2 - lon1;
  const s =
    Math.sin(dlat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

export function formatRoadDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(meters >= 10000 ? 0 : 1)} km`;
  }
  return `${Math.round(meters)} m`;
}
