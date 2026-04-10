"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { orderService } from "@/services/orderService";
import { ApiError } from "@/services/apiClient";
import { CustomerOrderCard } from "@/components/molecules/customer-order-card";
import { OrderChatPanel } from "@/components/organisms/order-chat-panel";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/60 p-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-4 h-32 w-full rounded-lg" />
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}

export function VendorOrderDetail({ orderId }: { orderId: string }) {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderService.getById(orderId),
    enabled: Boolean(orderId),
  });

  const errMsg =
    error instanceof ApiError ? error.message : error instanceof Error ? error.message : null;
  const is404 = error instanceof ApiError && error.statusCode === 404;
  const is403 = error instanceof ApiError && error.statusCode === 403;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/vendor/orders"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "-ml-2 mb-4 inline-flex gap-1.5 rounded-full",
          )}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Kitchen orders
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Order</h1>
        <p className="mt-1 text-muted-foreground">
          Order details and chat with the customer and rider for this run.
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

      {!isPending && !isError && data?.data.order && (
        <>
          <CustomerOrderCard order={data.data.order} />
          <OrderChatPanel orderId={orderId} order={data.data.order} />
        </>
      )}
    </div>
  );
}
