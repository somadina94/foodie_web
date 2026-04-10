"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { orderService } from "@/services/orderService";
import { ApiError } from "@/services/apiClient";
import { CustomerOrderCard } from "@/components/molecules/customer-order-card";
import { DeliveryTrackingMapSection } from "@/components/organisms/delivery-tracking-map-section";
import { OrderChatPanel } from "@/components/organisms/order-chat-panel";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

function OrderDetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/60 p-4">
        <div className="flex justify-between gap-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="mt-3 h-4 w-32" />
        <Skeleton className="mt-4 h-24 w-full rounded-lg" />
      </div>
      <Skeleton className="h-[min(320px,45vh)] w-full rounded-xl" />
    </div>
  );
}

export function CustomerOrderDetail({ orderId }: { orderId: string }) {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderService.getById(orderId),
    enabled: Boolean(orderId),
    refetchInterval: (q) => {
      const status = q.state.data?.data?.order?.status;
      return status === "out_for_delivery" || status === "rider_assigned" ? 8000 : false;
    },
  });

  const errMsg =
    error instanceof ApiError ? error.message : error instanceof Error ? error.message : null;
  const is404 = error instanceof ApiError && error.statusCode === 404;
  const is403 = error instanceof ApiError && error.statusCode === 403;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={ROUTES.customerOrders}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "-ml-2 mb-4 inline-flex gap-1.5 rounded-full",
          )}
        >
          <ArrowLeft className="size-4" aria-hidden />
          All orders
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Order details</h1>
        <p className="mt-1 text-muted-foreground">
          Line items, totals, and delivery tracking for this order.
        </p>
      </div>

      {isPending && <OrderDetailSkeleton />}

      {isError && (
        <p className="text-sm text-destructive">
          {is404
            ? "We could not find this order. It may have been removed or you may not have access."
            : is403
              ? "You do not have access to this order."
              : errMsg ?? "Could not load order."}
        </p>
      )}

      {!isPending && !isError && data?.data.order && (
        <>
          <CustomerOrderCard order={data.data.order} />
          <OrderChatPanel orderId={orderId} order={data.data.order} />
          <DeliveryTrackingMapSection
            order={data.data.order}
            orderId={orderId}
            viewerRole="customer"
          />
        </>
      )}
    </div>
  );
}
