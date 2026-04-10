"use client";

import Link from "next/link";
import { CustomerMealsBrowse } from "@/components/organisms/customer-meals-browse";

export default function CustomerDashboardMealsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Browse meals</h1>
        <p className="mt-1 max-w-xl text-muted-foreground">
          Browse dishes and add them to your cart. Use the cart in the header for a quick preview, or open your{" "}
          <Link
            href="/customer/cart"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            full cart
          </Link>{" "}
          to pay and place an order.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          After checkout, see{" "}
          <Link
            href="/customer/orders"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            your orders
          </Link>
          . See charts and totals on{" "}
          <Link
            href="/customer/dashboard"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Overview
          </Link>
          .
        </p>
      </div>

      <CustomerMealsBrowse />
    </div>
  );
}
