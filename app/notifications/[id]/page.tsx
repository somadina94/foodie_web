"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Package } from "lucide-react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { notificationService } from "@/services/notificationService";
import { ApiError } from "@/services/apiClient";
import { useAppSelector } from "@/lib/hooks";

function formatWhen(iso: string | undefined) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "full",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function orderHrefForRole(role: string | null | undefined, orderId: string) {
  switch (role) {
    case "vendor":
      return `/vendor/orders/${orderId}`;
    case "rider":
      return `/rider/deliveries/${orderId}`;
    case "admin":
      return ROUTES.adminDashboard;
    case "user":
    default:
      return `/customer/orders/${orderId}`;
  }
}

export default function NotificationDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0];
  const router = useRouter();
  const role = useAppSelector((s) => s.auth.role);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications", id],
    queryFn: () => notificationService.getById(id!),
    enabled: Boolean(id),
  });

  const n = query.data?.data.notification;
  const markedRef = useRef(false);

  useEffect(() => {
    markedRef.current = false;
  }, [id]);

  useEffect(() => {
    if (!n || !id || n.readAt || markedRef.current) return;
    markedRef.current = true;
    void notificationService.markRead(id).then(() => {
      void queryClient.invalidateQueries({ queryKey: ["notifications", "list"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications", id] });
    });
  }, [n, id, queryClient]);

  useEffect(() => {
    if (query.isError) {
      const e = query.error;
      if (e instanceof ApiError && e.statusCode === 404) {
        toast.error("Notification not found");
        router.replace(ROUTES.notifications);
      }
    }
  }, [query.isError, query.error, router]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href={ROUTES.notifications}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "-ml-2 mb-4 inline-flex gap-1.5 rounded-full",
          )}
        >
          <ArrowLeft className="size-4" aria-hidden />
          All notifications
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Notification</h1>
      </div>

      {query.isPending && (
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
      )}

      {query.isError && (
        <p className="text-sm text-destructive">
          {query.error instanceof ApiError ? query.error.message : "Could not load notification."}
        </p>
      )}

      {!query.isPending && !query.isError && n && (
        <Card className="overflow-hidden border-border/80 shadow-sm">
          <CardHeader className="space-y-2 border-b border-border/60 bg-muted/30">
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="text-xl leading-snug">{n.title}</CardTitle>
              <time className="shrink-0 text-xs text-muted-foreground" dateTime={n.createdAt}>
                {formatWhen(n.createdAt)}
              </time>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{n.body}</p>
            {n.orderId ? (
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-card p-4">
                <Package className="size-5 text-muted-foreground" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Related order
                  </p>
                  <p className="mt-1 font-mono text-sm">#{n.orderId.slice(-8)}</p>
                </div>
                <Link
                  href={orderHrefForRole(role, n.orderId)}
                  className={cn(buttonVariants({ size: "sm" }), "rounded-full")}
                >
                  View order
                </Link>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
