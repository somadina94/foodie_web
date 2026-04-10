"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Package } from "lucide-react";
import { toast } from "sonner";
import { ensureLocationBeforeOutForDelivery } from "@/lib/geo/rider-start-delivery";
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

function riderAction(status: string): { next: OrderStatus; label: string } | null {
  if (status === "rider_assigned") {
    return { next: "out_for_delivery", label: "Start delivery" };
  }
  if (status === "out_for_delivery") {
    return { next: "delivered", label: "Mark delivered" };
  }
  return null;
}

function RiderDeliveriesSkeleton() {
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

export function RiderDeliveriesList() {
  const queryClient = useQueryClient();
  const [advancingId, setAdvancingId] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ["orders", "delivery"],
    queryFn: () => orderService.listDelivery(),
  });

  const mutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      orderService.updateStatus(orderId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders", "delivery"] });
      toast.success("Delivery updated");
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Could not update delivery.";
      toast.error("Update failed", { description: msg });
    },
  });

  async function advanceDelivery(orderId: string, next: OrderStatus) {
    if (next === "out_for_delivery") {
      setAdvancingId(orderId);
      try {
        const loc = await ensureLocationBeforeOutForDelivery(orderId);
        if (!loc.ok) {
          toast.error("Location required", { description: loc.message });
          return;
        }
        await mutation.mutateAsync({ orderId, status: next });
      } finally {
        setAdvancingId(null);
      }
      return;
    }
    mutation.mutate({ orderId, status: next });
  }

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
        <h1 className="text-2xl font-semibold tracking-tight">Deliveries</h1>
        <p className="mt-1 text-muted-foreground">
          Runs assigned to you. Start delivery when you leave the kitchen, then mark delivered when
          the customer receives the order.
        </p>
      </div>

      {query.isPending && <RiderDeliveriesSkeleton />}

      {query.isError && (
        <p className="text-sm text-destructive">{errMsg ?? "Could not load deliveries."}</p>
      )}

      {!query.isPending && !query.isError && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/80 bg-muted/20 px-6 py-14 text-center">
          <Package className="size-10 text-muted-foreground" aria-hidden />
          <div className="space-y-1">
            <p className="font-medium">No deliveries assigned</p>
            <p className="text-sm text-muted-foreground">
              When the kitchen marks an order ready, the dispatcher queue may assign it to you.
            </p>
          </div>
        </div>
      )}

      {!query.isPending && !query.isError && orders.length > 0 && (
        <Accordion multiple className="w-full rounded-xl border border-border/80 bg-card shadow-sm">
          {orders.map((o) => (
            <RiderDeliveryAccordionItem
              key={o._id}
              order={o}
              disabled={mutation.isPending || advancingId === o._id}
              onAdvance={(status) => void advanceDelivery(o._id, status)}
            />
          ))}
        </Accordion>
      )}
    </div>
  );
}

function RiderDeliveryAccordionItem({
  order,
  disabled,
  onAdvance,
}: {
  order: Order;
  disabled: boolean;
  onAdvance: (status: OrderStatus) => void;
}) {
  const action = riderAction(order.status);

  return (
    <AccordionItem value={order._id}>
      <AccordionTrigger className="px-4 py-3 hover:no-underline sm:px-5">
        <CustomerOrderAccordionSummary order={order} />
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 sm:px-5">
        <CustomerOrderDetailsBody order={order} />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link
            href={`/rider/deliveries/${order._id}`}
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
              "inline-flex rounded-full gap-1.5 shadow-sm",
            )}
          >
            <MessageCircle className="size-3.5" aria-hidden />
            Chat & map
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
              {order.status === "delivered"
                ? "This delivery is complete."
                : "No delivery action available for this status."}
            </p>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
