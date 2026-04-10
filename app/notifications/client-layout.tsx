"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/organisms/dashboard-shell";
import { useAppSelector } from "@/lib/hooks";

export default function NotificationsClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = useAppSelector((s) => s.auth.role);
  const isAuth = useAppSelector((s) => s.auth.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (!isAuth) {
      router.replace("/login?callbackUrl=/notifications");
    }
  }, [isAuth, router]);

  if (!isAuth || !role) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  const variant = role === "user" ? "customer" : role;
  return <DashboardShell variant={variant}>{children}</DashboardShell>;
}
