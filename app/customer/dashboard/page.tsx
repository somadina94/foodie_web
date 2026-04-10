"use client";

import Link from "next/link";
import { CustomerOverviewSection } from "@/components/dashboard/overview-sections";

export default function CustomerDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 max-w-xl text-muted-foreground">
          Your order activity and spend. Details for each order live on{" "}
          <Link
            href="/customer/orders"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            My orders
          </Link>
          . Browse dishes under{" "}
          <Link
            href="/customer/dashboard/meals"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Meals → Browse
          </Link>
          .
        </p>
      </div>
      <CustomerOverviewSection />
    </div>
  );
}
