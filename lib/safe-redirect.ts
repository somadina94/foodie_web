import { ROUTES } from "@/lib/constants";

/** Prevent open redirects — only same-origin relative paths. */
export function safeCallbackUrl(
  path: string | null | undefined,
  fallback: string = ROUTES.customerDashboard,
): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }
  return path;
}
