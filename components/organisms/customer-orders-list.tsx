"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import { orderService } from "@/services/orderService";
import { ApiError } from "@/services/apiClient";
import {
  CustomerOrderAccordionSummary,
  CustomerOrderDetailsBody,
} from "@/components/molecules/customer-order-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { sortOrdersNewestFirst } from "@/lib/orders/sort-orders";

function OrdersListSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1].map((i) => (
        <div key={i} className="rounded-xl border border-border/60 p-4">
          <div className="flex justify-between gap-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="mt-3 h-4 w-32" />
          <Skeleton className="mt-4 h-16 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function CustomerOrdersList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const placed = searchParams.get("placed");
  const [showPlacedBanner, setShowPlacedBanner] = useState(false);

  useEffect(() => {
    setShowPlacedBanner(placed === "1");
  }, [placed]);

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["orders", "mine"],
    queryFn: () => orderService.listMine(),
  });

  const orders = useMemo(
    () => sortOrdersNewestFirst(data?.data.orders ?? []),
    [data?.data.orders],
  );

  function dismissPlaced() {
    setShowPlacedBanner(false);
    router.replace("/customer/orders", { scroll: false });
  }

  const errMsg =
    error instanceof ApiError ? error.message : error instanceof Error ? error.message : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="mt-1 text-muted-foreground">
          Orders you have paid for (and cash on delivery). Track status here.
        </p>
      </div>

      {showPlacedBanner && (
        <div
          className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm"
          role="status"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>Your order was placed.</span>
            <Button type="button" variant="outline" size="sm" onClick={dismissPlaced}>
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {isPending && <OrdersListSkeleton />}

      {isError && (
        <p className="text-sm text-destructive">{errMsg ?? "Could not load orders."}</p>
      )}

      {!isPending && !isError && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/80 bg-muted/20 px-6 py-14 text-center">
          <Package className="size-10 text-muted-foreground" aria-hidden />
          <div className="space-y-1">
            <p className="font-medium">No orders yet</p>
            <p className="text-sm text-muted-foreground">
              After you check out, your orders appear here.
            </p>
          </div>
          <Link
            href="/customer/dashboard"
            className={cn(buttonVariants({ variant: "default" }), "inline-flex rounded-full")}
          >
            Browse meals
          </Link>
        </div>
      )}

      {!isPending && !isError && orders.length > 0 && (
        <Accordion multiple className="w-full rounded-xl border border-border/80 bg-card shadow-sm">
          {orders.map((o) => (
            <AccordionItem key={o._id} value={o._id}>
              <AccordionTrigger className="px-4 py-3 hover:no-underline sm:px-5">
                <CustomerOrderAccordionSummary order={o} />
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 sm:px-5">
                <CustomerOrderDetailsBody order={o} />
                <Link
                  href={`${ROUTES.customerOrders}/${o._id}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "mt-4 inline-flex w-full rounded-full sm:w-auto",
                  )}
                >
                  View details & tracking
                </Link>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
