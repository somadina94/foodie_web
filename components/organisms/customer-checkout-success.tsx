"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { CheckoutSuccessHero } from "@/components/molecules/checkout-success-hero";
import { CheckoutSuccessReceipt } from "@/components/molecules/checkout-success-receipt";
import { CheckoutSuccessSkeleton } from "@/components/molecules/checkout-success-skeleton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { clearCart } from "@/lib/features/cart/cartSlice";
import { useAppDispatch } from "@/lib/hooks";
import { persistor } from "@/lib/store";
import { isStripeCheckoutSessionId } from "@/lib/orders/order-labels";
import { ROUTES } from "@/lib/constants";
import { orderService } from "@/services/orderService";
import { ApiError } from "@/services/apiClient";

export function CustomerCheckoutSuccess() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const pollStartRef = useRef(Date.now());

  useEffect(() => {
    const checkoutOk = searchParams.get("checkout") === "success";
    const sid = searchParams.get("session_id");
    if (checkoutOk || isStripeCheckoutSessionId(sid)) {
      dispatch(clearCart());
      void persistor.flush();
    }
  }, [dispatch, searchParams]);

  const query = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderService.getById(orderId!),
    enabled: Boolean(orderId),
    retry: 1,
    refetchInterval: (q) => {
      if (q.state.status === "error" || q.state.status === "pending") return false;
      const order = q.state.data?.data?.order;
      if (!order) return false;
      if (order.paymentStatus === "paid") return false;
      if (Date.now() - pollStartRef.current > 40000) return false;
      return 2000;
    },
  });

  useEffect(() => {
    if (query.data?.data?.order.paymentStatus === "paid") {
      void queryClient.invalidateQueries({ queryKey: ["orders", "mine"] });
    }
  }, [query.data?.data?.order.paymentStatus, queryClient]);

  if (!orderId) {
    return (
      <div className="mx-auto max-w-lg space-y-8">
        <CheckoutSuccessHero
          title="Payment received"
          description="Thank you. Your card payment went through. You can track the order under Orders."
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/customer/orders"
            className={cn(buttonVariants({ variant: "default" }), "inline-flex rounded-full")}
          >
            View orders
          </Link>
          <Link
            href="/customer/dashboard"
            className={cn(buttonVariants({ variant: "outline" }), "inline-flex rounded-full")}
          >
            Browse meals
          </Link>
        </div>
      </div>
    );
  }

  if (query.isPending) {
    return <CheckoutSuccessSkeleton />;
  }

  if (query.isError) {
    const msg =
      query.error instanceof ApiError && query.error.statusCode === 403
        ? "We could not load this order. Open Orders to see purchases on your account."
        : "We could not load order details. If you were charged, your order will appear under Orders shortly.";
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <CheckoutSuccessHero title="Payment received" description={msg} />
        <Link
          href="/customer/orders"
          className={cn(buttonVariants({ variant: "default" }), "inline-flex rounded-full")}
        >
          View orders
        </Link>
      </div>
    );
  }

  const order = query.data.data.order;
  const confirming = order.paymentStatus !== "paid";

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <CheckoutSuccessHero
        title={confirming ? "Confirming payment…" : "Payment successful"}
        description={
          confirming
            ? "Hang tight—we’re confirming your payment with your bank. This usually takes a few seconds."
            : "Your order is paid and heading to the kitchen. We’ll notify you as it progresses."
        }
      />
      {confirming && (
        <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground sm:justify-start">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Waiting for confirmation…
        </p>
      )}
      <CheckoutSuccessReceipt order={order} />
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Link
          href={`${ROUTES.customerOrders}/${order._id}`}
          className={cn(buttonVariants({ variant: "default" }), "inline-flex rounded-full")}
        >
          Order details
        </Link>
        <Link
          href={ROUTES.customerOrders}
          className={cn(buttonVariants({ variant: "outline" }), "inline-flex rounded-full")}
        >
          All orders
        </Link>
        <Link
          href="/customer/dashboard"
          className={cn(buttonVariants({ variant: "outline" }), "inline-flex rounded-full")}
        >
          Browse meals
        </Link>
      </div>
    </div>
  );
}
