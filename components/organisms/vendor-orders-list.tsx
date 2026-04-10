"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Package } from "lucide-react";
import { toast } from "sonner";
import {
  CustomerOrderAccordionSummary,
  CustomerOrderDetailsBody,
} from "@/components/molecules/customer-order-card";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/services/apiClient";
import { orderService, type Order, type OrderStatus } from "@/services/orderService";
import { cn } from "@/lib/utils";
import { sortOrdersNewestFirst } from "@/lib/orders/sort-orders";

function vendorAction(status: string): { next: OrderStatus; label: string } | null {
  if (status === "kitchen_assigned") {
    return { next: "preparing", label: "Start preparing" };
  }
  if (status === "preparing") {
    return { next: "pending_rider", label: "Mark ready for rider" };
  }
  return null;
}

function VendorOrdersSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1].map((i) => (
        <div key={i} className="rounded-xl border border-border/60 p-4">
          <div className="flex justify-between gap-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="mt-3 h-4 w-32" />
          <Skeleton className="mt-4 h-24 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function VendorOrdersList() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["orders", "kitchen"],
    queryFn: () => orderService.listKitchen(),
  });

  const mutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      orderService.updateStatus(orderId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders", "kitchen"] });
      toast.success("Order updated");
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Could not update order.";
      toast.error("Update failed", { description: msg });
    },
  });

  const orders = useMemo(
    () => sortOrdersNewestFirst(query.data?.data.orders ?? []),
    [query.data?.data.orders],
  );
  const errMsg =
    query.error instanceof ApiError
      ? query.error.message
      : query.error instanceof Error
        ? query.error.message
        : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Kitchen orders</h1>
        <p className="mt-1 text-muted-foreground">
          Orders assigned to you. Advance status when you start cooking and when the order is ready
          for pickup.
        </p>
      </div>

      {query.isPending && <VendorOrdersSkeleton />}

      {query.isError && (
        <p className="text-sm text-destructive">{errMsg ?? "Could not load orders."}</p>
      )}

      {!query.isPending && !query.isError && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/80 bg-muted/20 px-6 py-14 text-center">
          <Package className="size-10 text-muted-foreground" aria-hidden />
          <div className="space-y-1">
            <p className="font-medium">No orders assigned yet</p>
            <p className="text-sm text-muted-foreground">
              When customers place orders, they will appear here after the kitchen queue assigns
              them to you.
            </p>
          </div>
        </div>
      )}

      {!query.isPending && !query.isError && orders.length > 0 && (
        <Accordion multiple className="w-full rounded-xl border border-border/80 bg-card shadow-sm">
          {orders.map((o) => (
            <VendorOrderAccordionItem
              key={o._id}
              order={o}
              disabled={mutation.isPending}
              onAdvance={(status) => mutation.mutate({ orderId: o._id, status })}
            />
          ))}
        </Accordion>
      )}
    </div>
  );
}

function VendorOrderAccordionItem({
  order,
  disabled,
  onAdvance,
}: {
  order: Order;
  disabled: boolean;
  onAdvance: (status: OrderStatus) => void;
}) {
  const action = vendorAction(order.status);

  return (
    <AccordionItem value={order._id}>
      <AccordionTrigger className="px-4 py-3 hover:no-underline sm:px-5">
        <CustomerOrderAccordionSummary order={order} />
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 sm:px-5">
        <CustomerOrderDetailsBody order={order} />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link
            href={`/vendor/orders/${order._id}`}
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
              "inline-flex rounded-full gap-1.5 shadow-sm",
            )}
          >
            <MessageCircle className="size-3.5" aria-hidden />
            Chat
          </Link>
          {action ? (
            <Button
              type="button"
              className="rounded-full"
              disabled={disabled}
              onClick={() => onAdvance(action.next)}
            >
              {action.label}
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              {order.status === "pending_rider"
                ? "Waiting for a rider to be assigned."
                : "No kitchen action available for this status."}
            </p>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
