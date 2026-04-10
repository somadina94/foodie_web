"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { orderService, type OrderStatus } from "@/services/orderService";
import { ApiError } from "@/services/apiClient";
import { CustomerOrderCard } from "@/components/molecules/customer-order-card";
import { DeliveryTrackingMapSection } from "@/components/organisms/delivery-tracking-map-section";
import { OrderChatPanel } from "@/components/organisms/order-chat-panel";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ensureLocationBeforeOutForDelivery } from "@/lib/geo/rider-start-delivery";
import { cn } from "@/lib/utils";

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/60 p-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-4 h-32 w-full rounded-lg" />
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}

function riderDeliveryAction(status: string): { next: OrderStatus; label: string } | null {
  if (status === "rider_assigned") {
    return { next: "out_for_delivery", label: "Start delivery" };
  }
  if (status === "out_for_delivery") {
    return { next: "delivered", label: "Mark delivered" };
  }
  return null;
}

export function RiderOrderDetail({ orderId }: { orderId: string }) {
  const queryClient = useQueryClient();
  const [advancing, setAdvancing] = useState(false);

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderService.getById(orderId),
    enabled: Boolean(orderId),
    refetchInterval: (q) => {
      const status = q.state.data?.data?.order?.status;
      return status === "out_for_delivery" || status === "rider_assigned" ? 8000 : false;
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ next }: { next: OrderStatus }) => orderService.updateStatus(orderId, next),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      void queryClient.invalidateQueries({ queryKey: ["orders", "delivery"] });
      toast.success("Delivery updated");
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Could not update delivery.";
      toast.error("Update failed", { description: msg });
    },
  });

  async function advanceDelivery(next: OrderStatus) {
    if (next === "out_for_delivery") {
      setAdvancing(true);
      try {
        const loc = await ensureLocationBeforeOutForDelivery(orderId);
        if (!loc.ok) {
          toast.error("Location required", { description: loc.message });
          return;
        }
        await statusMutation.mutateAsync({ next });
      } finally {
        setAdvancing(false);
      }
      return;
    }
    statusMutation.mutate({ next });
  }

  const errMsg =
    error instanceof ApiError ? error.message : error instanceof Error ? error.message : null;
  const is404 = error instanceof ApiError && error.statusCode === 404;
  const is403 = error instanceof ApiError && error.statusCode === 403;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/rider/deliveries"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "-ml-2 mb-4 inline-flex gap-1.5 rounded-full",
          )}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Deliveries
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Delivery</h1>
        <p className="mt-1 text-muted-foreground">
          Address, chat with customer and kitchen, and live map.
        </p>
      </div>

      {isPending && <DetailSkeleton />}

      {isError && (
        <p className="text-sm text-destructive">
          {is404
            ? "We could not find this order."
            : is403
              ? "You do not have access to this order."
              : errMsg ?? "Could not load order."}
        </p>
      )}

      {!isPending && !isError && data?.data.order && (() => {
        const order = data.data.order;
        const detailAction = riderDeliveryAction(order.status);
        return (
          <>
            <CustomerOrderCard order={order} />
            {detailAction ? (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  className="rounded-full"
                  disabled={statusMutation.isPending || advancing}
                  onClick={() => void advanceDelivery(detailAction.next)}
                >
                  {detailAction.label}
                </Button>
                <p className="text-sm text-muted-foreground">
                  {detailAction.next === "out_for_delivery"
                    ? "You’ll be asked to allow location so customers can track this delivery."
                    : "Confirm the customer received the order."}
                </p>
              </div>
            ) : null}
            <OrderChatPanel orderId={orderId} order={order} />
            <DeliveryTrackingMapSection order={order} orderId={orderId} viewerRole="rider" />
          </>
        );
      })()}
    </div>
  );
}
