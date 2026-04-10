"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { notificationService } from "@/services/notificationService";
import { ApiError } from "@/services/apiClient";

function formatWhen(iso: string | undefined) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export default function NotificationsListPage() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: () => notificationService.list(),
  });

  const markAll = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications", "list"] });
      toast.success("All notifications marked as read");
    },
    onError: (e) => {
      const msg = e instanceof ApiError ? e.message : "Could not update.";
      toast.error(msg);
    },
  });

  const items = query.data?.data.notifications ?? [];
  const unread = query.data?.data.unreadCount ?? 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="mt-1 text-muted-foreground">
            Order updates and delivery alerts for your account.
          </p>
        </div>
        {unread > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 rounded-full gap-1.5"
            disabled={markAll.isPending}
            onClick={() => markAll.mutate()}
          >
            <CheckCheck className="size-4" aria-hidden />
            Mark all read
          </Button>
        )}
      </div>

      {query.isPending && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      )}

      {query.isError && (
        <p className="text-sm text-destructive">
          {query.error instanceof ApiError ? query.error.message : "Could not load notifications."}
        </p>
      )}

      {!query.isPending && !query.isError && items.length === 0 && (
        <Card className="border-dashed">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Bell className="size-6" aria-hidden />
              </div>
              <div>
                <CardTitle className="text-lg">You&apos;re all caught up</CardTitle>
                <CardDescription>
                  When something changes on your orders, it will show up here and in push
                  notifications.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {!query.isPending && !query.isError && items.length > 0 && (
        <ul className="space-y-4">
          {items.map((n) => (
            <li key={n._id}>
              <Link href={`${ROUTES.notifications}/${n._id}`} className="block">
                <Card
                  className={cn(
                    "transition-shadow hover:shadow-md",
                    !n.readAt && "border-primary/25 bg-primary/[0.03]",
                  )}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          {!n.readAt ? (
                            <span className="size-2 shrink-0 rounded-full bg-primary" aria-hidden />
                          ) : null}
                          <CardTitle className="text-base leading-snug">{n.title}</CardTitle>
                        </div>
                        <CardDescription className="line-clamp-2">{n.body}</CardDescription>
                      </div>
                      <time
                        className="shrink-0 text-xs text-muted-foreground tabular-nums"
                        dateTime={n.createdAt}
                      >
                        {formatWhen(n.createdAt)}
                      </time>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
