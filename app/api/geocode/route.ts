import { NextRequest, NextResponse } from "next/server";

/** Collapse newlines (common in checkout textareas) and tidy spacing for geocoders. */
function normalizeAddress(q: string): string {
  return q
    .replace(/\r\n/g, "\n")
    .replace(/\n+/g, ", ")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
}

async function nominatimSearch(query: string): Promise<{ lat: number; lng: number } | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "5");
  url.searchParams.set("addressdetails", "0");

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": "FoodieDelivery/1.0 (contact via app support)",
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) return null;
  const data = (await res.json()) as { lat?: string; lon?: string }[];
  const hit = data[0];
  if (!hit?.lat || !hit?.lon) return null;
  return { lat: Number(hit.lat), lng: Number(hit.lon) };
}

/** Public Photon instance — often fills gaps when Nominatim returns nothing for free-form text. */
async function photonSearch(query: string): Promise<{ lat: number; lng: number } | null> {
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "1");

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": "FoodieDelivery/1.0 (contact via app support)",
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) return null;
  const json = (await res.json()) as {
    features?: { geometry?: { coordinates?: [number, number] } }[];
  };
  const coords = json.features?.[0]?.geometry?.coordinates;
  if (!coords || coords.length < 2) return null;
  const [lng, lat] = coords;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

/**
 * Proxy geocoding for delivery addresses. Tries Nominatim, optional country-biased retry, then Photon.
 */
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("q")?.trim();
  if (!raw) {
    return NextResponse.json({ error: "q is required" }, { status: 400 });
  }

  const normalized = normalizeAddress(raw);
  if (!normalized) {
    return NextResponse.json({ error: "Address is empty" }, { status: 400 });
  }

  const countryBias = process.env.GEOCODE_COUNTRY_BIAS?.trim();

  let result = await nominatimSearch(normalized);
  if (!result && countryBias) {
    result = await nominatimSearch(`${normalized}, ${countryBias}`);
  }
  if (!result) {
    result = await photonSearch(normalized);
  }
  if (!result && countryBias) {
    result = await photonSearch(`${normalized}, ${countryBias}`);
  }

  if (!result) {
    return NextResponse.json(
      {
        error:
          "No results for this address. Try adding city, state/postcode, and country (e.g. “123 Main St, Austin, TX 78701, USA”).",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    lat: result.lat,
    lng: result.lng,
  });
}
