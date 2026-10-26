/** Haversine afstand in km tussen twee coördinaten */
export function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface RoutableStop {
  id: number;
  lat: number;
  lng: number;
  estimatedDurationHours: number;
  resource: any;
}

/**
 * Nearest-Neighbor Heuristic: sorteert stops van dichtste naar verste,
 * startend bij het thuisadres van de inspecteur.
 */
export function nearestNeighbor(
  home: { lat: number; lng: number },
  stops: RoutableStop[]
): RoutableStop[] {
  if (stops.length === 0) return [];
  const remaining = [...stops];
  const route: RoutableStop[] = [];
  let current = home;
  while (remaining.length > 0) {
    let closestIdx = 0;
    let closestDist = Infinity;
    remaining.forEach((s, i) => {
      const d = haversine(current.lat, current.lng, s.lat, s.lng);
      if (d < closestDist) { closestDist = d; closestIdx = i; }
    });
    const next = remaining.splice(closestIdx, 1)[0];
    route.push(next);
    current = { lat: next.lat, lng: next.lng };
  }
  return route;
}

/**
 * Berekent starttijden op basis van NNH volgorde.
 * Eerste stop begint op startHour (bijv. 8), elke volgende na duur vorige stop.
 */
export function assignTimes(
  route: RoutableStop[],
  startHour = 8
): Array<RoutableStop & { scheduledHour: number; scheduledMinute: number }> {
  let minutesCursor = startHour * 60;
  return route.map(stop => {
    const h = Math.floor(minutesCursor / 60);
    const m = minutesCursor % 60;
    minutesCursor += Math.round((stop.estimatedDurationHours || 2) * 60);
    return { ...stop, scheduledHour: h, scheduledMinute: m };
  });
}
