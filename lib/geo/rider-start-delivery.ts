import { orderService } from "@/services/orderService";

const MAC_LOCATION_HINT =
  "On Mac: System Settings → Privacy & Security → Location Services — turn Location Services on, scroll down, and enable your browser (Chrome, Safari, Arc, etc.). You may need to quit and reopen the browser after changing this.";

function getCurrentPosition(options: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

/**
 * Desktop browsers (especially on Mac) often fail with high-accuracy + zero cache because there is
 * no GPS — Wi‑Fi/cell positioning needs a moment. Try precise first, then coarse / cached.
 */
async function readPositionWithFallback(): Promise<GeolocationPosition> {
  try {
    return await getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 12_000,
      maximumAge: 0,
    });
  } catch (first) {
    const e = first as GeolocationPositionError;
    if (e.code === e.PERMISSION_DENIED) {
      throw first;
    }
    return await getCurrentPosition({
      enableHighAccuracy: false,
      timeout: 25_000,
      maximumAge: 120_000,
    });
  }
}

function geolocationErrorMessage(err: GeolocationPositionError): string {
  if (err.code === err.PERMISSION_DENIED) {
    return `Location access is required to mark this order as out for delivery. Allow location for this site in your browser, then try again. ${MAC_LOCATION_HINT}`;
  }
  if (err.code === err.TIMEOUT) {
    return `Location request timed out. On a Mac there is no GPS — the browser uses Wi‑Fi and network data, which can be slow. Try again, or move closer to a window / better Wi‑Fi. ${MAC_LOCATION_HINT}`;
  }
  if (err.code === err.POSITION_UNAVAILABLE) {
    return `Could not determine your position (often a temporary network or Wi‑Fi positioning issue). Try again in a few seconds. ${MAC_LOCATION_HINT}`;
  }
  return `Could not read your location. ${MAC_LOCATION_HINT}`;
}

/**
 * Prompts for browser location (required for live tracking), sends an initial rider ping
 * while the order is still `rider_assigned`, then the caller should set status to `out_for_delivery`.
 */
export async function ensureLocationBeforeOutForDelivery(
  orderId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    return { ok: false, message: "Geolocation is not supported in this browser." };
  }

  try {
    const pos = await readPositionWithFallback();
    const { latitude, longitude } = pos.coords;
    try {
      await orderService.patchRiderLocation(orderId, latitude, longitude);
    } catch {
      /* Still allow status change if the ping fails; permission was granted. */
    }
    return { ok: true };
  } catch (unknownErr) {
    const err = unknownErr as GeolocationPositionError;
    if (err && typeof err.code === "number" && err.code >= 1 && err.code <= 3) {
      return { ok: false, message: geolocationErrorMessage(err) };
    }
    return {
      ok: false,
      message: `Could not read your location. ${MAC_LOCATION_HINT}`,
    };
  }
}
