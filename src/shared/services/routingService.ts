/**
 * Reusable routing service for Leaflet and OpenStreetMap (OSRM)
 */

export interface RouteData {
  coordinates: [number, number][]; // [lat, lng] list for Leaflet
  distanceKm: number;
  durationSeconds: number;
  distanceFormatted: string;
  durationFormatted: string;
  isFallback: boolean;
}

// Simple in-memory cache to avoid redundant OSRM API calls
const routeCache = new Map<string, RouteData>();

/**
 * Calculates straight line distance as fallback
 */
export function getStraightLineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

/**
 * Formats distance from meters to KM string (e.g., 12854 -> "12.85 KM")
 */
export function getDistanceKm(meters: number): string {
  const km = meters / 1000;
  return `${km.toFixed(2)} KM`;
}

/**
 * Formats duration from seconds to readable string (e.g., 8100 -> "2h 15m", 2100 -> "35 min")
 */
export function getDuration(seconds: number): string {
  if (seconds < 60) return "1 min";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
}

/**
 * Decodes GeoJSON LineString coordinates [lng, lat] to Leaflet [lat, lng] format
 */
export function decodeRoute(geometry: any): [number, number][] {
  if (!geometry || !geometry.coordinates) return [];
  return geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
}

export async function getRoadRoute(
  lng1: number,
  lat1: number,
  lng2: number,
  lat2: number,
  signal?: AbortSignal
): Promise<RouteData> {
  const cacheKey = `${lng1},${lat1};${lng2},${lat2}`;

  // Check cache first
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey)!;
  }

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson`;
    const response = await fetch(url, { signal });

    if (!response.ok) {
      throw new Error(`OSRM responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (data.code === "Ok" && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const coordinates = decodeRoute(route.geometry);
      const distanceKm = route.distance / 1000;
      const durationSeconds = route.duration;

      const result: RouteData = {
        coordinates,
        distanceKm,
        durationSeconds,
        distanceFormatted: getDistanceKm(route.distance),
        durationFormatted: getDuration(route.duration),
        isFallback: false,
      };

      // Save to cache
      routeCache.set(cacheKey, result);
      return result;
    }

    throw new Error("Empty or invalid OSRM route response");
  } catch (error: any) {
    if (error.name === "AbortError") {
      // Re-throw or ignore AbortError. Let's return a pending or empty state, or default fallback.
      throw error;
    }

    console.warn("OSRM routing API unavailable, falling back to straight-line:", error.message);

    // Calculate straight-line fallback
    const straightDistKm = getStraightLineDistance(lat1, lng1, lat2, lng2);
    // Estimate driving duration based on avg 50 km/h speed (50 km / 3600 seconds)
    const estimatedSeconds = (straightDistKm / 50) * 3600;

    const fallbackResult: RouteData = {
      coordinates: [
        [lat1, lng1],
        [lat2, lng2],
      ],
      distanceKm: straightDistKm,
      durationSeconds: estimatedSeconds,
      distanceFormatted: `${straightDistKm.toFixed(2)} KM`,
      durationFormatted: getDuration(estimatedSeconds),
      isFallback: true,
    };

    return fallbackResult;
  }
}
