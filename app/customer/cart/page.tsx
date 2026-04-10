"use client";

import Link from "next/link";
import { CustomerCartCheckout } from "@/components/organisms/customer-cart-checkout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CustomerCartPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Cart</h1>
        <p className="mt-1 text-muted-foreground">
          Review items, confirm delivery, and pay.{" "}
          <Link
            href="/customer/dashboard"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Back to meals
          </Link>
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
          <CardDescription>Delivery address and payment</CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerCartCheckout />
        </CardContent>
      </Card>
    </div>
  );
}
