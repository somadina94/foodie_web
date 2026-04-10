"use client";

import Cookies from "js-cookie";
import { COOKIE_ROLE, COOKIE_TOKEN } from "@/lib/constants";

const opts = {
  path: "/",
  sameSite: "lax" as const,
  expires: 7,
};

export function setAuthCookies(token: string, role: string): void {
  Cookies.set(COOKIE_TOKEN, token, opts);
  Cookies.set(COOKIE_ROLE, role, opts);
}

export function clearAuthCookies(): void {
  Cookies.remove(COOKIE_TOKEN, { path: "/" });
  Cookies.remove(COOKIE_ROLE, { path: "/" });
}

export function getTokenFromCookie(): string | undefined {
  return Cookies.get(COOKIE_TOKEN);
}

export function getRoleFromCookie(): string | undefined {
  return Cookies.get(COOKIE_ROLE);
}
