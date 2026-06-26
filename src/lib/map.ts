import type { Restaurant } from "@/lib/types";

const SHORT_MAP_HOSTS = new Set(["maps.app.goo.gl", "goo.gl"]);

/** Spirito Vita — from Google Maps place link */
export const SPIRITO_VITA_PLACE_ID = "0x15564d000e8eca43:0x63b668ffb9998682";

/** Link for opening Google Maps (short goo.gl links work here). */
export function getMapOpenUrl(restaurant: Restaurant): string | null {
  const url = restaurant.mapUrl?.trim();
  if (url) return url;

  const coords = getRestaurantCoords(restaurant);
  if (coords) {
    return `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
  }

  if (restaurant.address?.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      restaurant.address.trim()
    )}`;
  }

  return null;
}

/** Official Google Maps embed (place pin + correct business card). */
export function getMapEmbedUrl(restaurant: Restaurant): string | null {
  const coords = getRestaurantCoords(restaurant);
  if (!coords) {
    if (restaurant.address?.trim()) {
      return buildQueryEmbed(restaurant.address.trim());
    }
    return null;
  }

  const mapUrl = restaurant.mapUrl?.trim();
  let placeId = restaurant.mapPlaceId?.trim() || null;
  let label = restaurant.nameEn || restaurant.nameAr;

  if (mapUrl && !isShortMapLink(mapUrl)) {
    placeId = extractPlaceId(mapUrl) || placeId;
    const nameFromUrl = extractPlaceName(mapUrl);
    if (nameFromUrl) label = nameFromUrl;
  }

  if (!placeId && restaurant.nameEn.toLowerCase().includes("spirito")) {
    placeId = SPIRITO_VITA_PLACE_ID;
  }

  return buildPlaceEmbed(coords.lat, coords.lng, placeId, label);
}

function getRestaurantCoords(restaurant: Restaurant): { lat: number; lng: number } | null {
  const mapUrl = restaurant.mapUrl?.trim();
  if (mapUrl && !isShortMapLink(mapUrl)) {
    const fromUrl = extractPlaceCoords(mapUrl);
    if (fromUrl) return fromUrl;
  }

  if (restaurant.latitude != null && restaurant.longitude != null) {
    return { lat: restaurant.latitude, lng: restaurant.longitude };
  }

  return null;
}

function isShortMapLink(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return SHORT_MAP_HOSTS.has(host);
  } catch {
    return url.includes("maps.app.goo.gl") || url.includes("goo.gl/");
  }
}

function extractPlaceId(url: string): string | null {
  const patterns = [
    /!1s(0x[a-f0-9]+:0x[a-f0-9]+)/i,
    /1s(0x[a-f0-9]+:0x[a-f0-9]+)/i,
    /place_id=(ChIJ[a-zA-Z0-9_-]+)/i,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

function extractPlaceCoords(url: string): { lat: number; lng: number } | null {
  const place3d = url.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (place3d) {
    return { lat: parseFloat(place3d[1]), lng: parseFloat(place3d[2]) };
  }

  const atMatch = url.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (atMatch) {
    return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
  }

  return null;
}

function extractPlaceName(url: string): string | null {
  try {
    const match = new URL(url).pathname.match(/\/place\/([^/]+)/);
    if (!match) return null;
    return decodeURIComponent(match[1].replace(/\+/g, " "))
      .replace(/,.*$/, "")
      .trim();
  } catch {
    return null;
  }
}

/** Google embed pb URL — shows the exact place, not a random nearby business. */
function buildPlaceEmbed(
  lat: number,
  lng: number,
  placeId: string | null,
  label: string
): string {
  const span = embedSpanForZoom(lat, 17);
  const encLabel = encodeURIComponent(label).replace(/%20/g, "+");

  if (placeId) {
    const encId = placeId.replace(":", "%3A");
    const pb = `!1m18!1m12!1m3!1d${span}!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s${encId}!2s${encLabel}!5e0!3m2!1sar!2siq!4v${Date.now()}!5m2!1sar!2siq`;
    return `https://www.google.com/maps/embed?pb=${pb}`;
  }

  const pb = `!1m14!1m8!1m3!1d${span}!2d${lng}!3d${lat}!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0!2s${encLabel}!5e0!3m2!1sar!2siq!5m2!1sar!2siq`;
  return `https://www.google.com/maps/embed?pb=${pb}`;
}

function buildQueryEmbed(query: string): string {
  const enc = encodeURIComponent(query).replace(/%20/g, "+");
  const pb = `!1m18!1m12!1m3!1d12690!2d0!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0!2s${enc}!5e0!3m2!1sar!2siq!4v${Date.now()}!5m2!1sar!2siq`;
  return `https://www.google.com/maps/embed?pb=${pb}`;
}

function embedSpanForZoom(lat: number, zoom: number): number {
  // Tuned for street-level embed at ~zoom 17
  const meters =
    (591657550.5 / Math.pow(2, zoom + 7)) * Math.cos((lat * Math.PI) / 180);
  return Math.max(800, Math.round(meters * 360));
}
