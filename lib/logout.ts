"use client";

import { persistor, store } from "@/lib/store";
import { logout } from "@/lib/features/auth/authSlice";
import { clearAuthCookies } from "@/lib/cookies";

export async function performLogout(): Promise<void> {
  store.dispatch(logout());
  clearAuthCookies();
  await persistor.purge();
}
