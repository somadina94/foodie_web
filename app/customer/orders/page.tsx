"use client";

import { Suspense } from "react";
import { CustomerOrdersList } from "@/components/organisms/customer-orders-list";
import { Skeleton } from "@/components/ui/skeleton";

function OrdersPageFallback() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}

export default function CustomerOrdersPage() {
  return (
    <Suspense fallback={<OrdersPageFallback />}>
      <CustomerOrdersList />
    </Suspense>
  );
}
