"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppSelector } from "@/lib/hooks";
import { performLogout } from "@/lib/logout";
import { subscribeWebPush } from "@/lib/push/web-push";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** Routes where we do not require the notification permission gate (auth pages + static marketing). */
function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  const prefixes = ["/login", "/signup", "/about", "/terms", "/privacy", "/menu"];
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const denyHandled = useRef(false);
  const subscribeOnce = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      denyHandled.current = false;
      subscribeOnce.current = false;
    }
  }, [isAuthenticated]);

  const shouldGate = isAuthenticated && !isPublicPath(pathname);

  const logoutForNotifications = useCallback(async () => {
    if (denyHandled.current) return;
    denyHandled.current = true;
    await performLogout();
    toast.message("Signed out — notifications are required to use Foodie.");
    router.replace("/login");
  }, [router]);

  useEffect(() => {
    if (!shouldGate) {
      setShowModal(false);
      return;
    }
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    const p = Notification.permission;
    if (p === "denied") {
      void logoutForNotifications();
      return;
    }
    if (p === "granted") {
      if (!subscribeOnce.current) {
        subscribeOnce.current = true;
        void subscribeWebPush();
      }
      setShowModal(false);
      return;
    }
    setShowModal(true);
  }, [shouldGate, logoutForNotifications]);

  async function onAllow() {
    setBusy(true);
    try {
      const result = await Notification.requestPermission();
      if (result === "denied") {
        await logoutForNotifications();
        return;
      }
      if (result === "granted") {
        setShowModal(false);
        subscribeOnce.current = true;
        const ok = await subscribeWebPush();
        if (ok) {
          toast.success("Notifications enabled");
        } else {
          toast.error("Could not finish push setup", {
            description:
              "Ensure NEXT_PUBLIC_VAPID_PUBLIC_KEY matches the server and you are on HTTPS or localhost.",
          });
        }
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {children}
      <Dialog open={showModal && shouldGate} onOpenChange={() => {}}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enable notifications</DialogTitle>
            <DialogDescription>
              Foodie uses notifications for order updates, delivery status, and kitchen alerts. Allow
              notifications to continue using your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-full sm:w-auto"
              disabled={busy}
              onClick={() => void logoutForNotifications()}
            >
              Sign out
            </Button>
            <Button
              type="button"
              className="w-full rounded-full sm:w-auto"
              disabled={busy}
              onClick={() => void onAllow()}
            >
              {busy ? "Requesting…" : "Allow notifications"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
