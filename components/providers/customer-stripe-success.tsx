"use client";

import { useEffect } from "react";
import { clearCart } from "@/lib/features/cart/cartSlice";
import { useAppDispatch } from "@/lib/hooks";
import { persistor } from "@/lib/store";
import { isStripeCheckoutSessionId } from "@/lib/orders/order-labels";

/** Clears cart after Stripe checkout: `checkout=success` and/or `session_id=cs_*` (any customer route). */
export function CustomerStripeSuccessHandler() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (typeof window === "undefined") return;
    const u = new URL(window.location.href);
    const checkoutOk = u.searchParams.get("checkout") === "success";
    const sessionId = u.searchParams.get("session_id");
    const stripeReturn = isStripeCheckoutSessionId(sessionId);
    if (!checkoutOk && !stripeReturn) return;

    dispatch(clearCart());
    void persistor.flush();

    if (checkoutOk) u.searchParams.delete("checkout");
    if (stripeReturn && sessionId) u.searchParams.delete("session_id");
    const qs = u.searchParams.toString();
    window.history.replaceState({}, "", u.pathname + (qs ? `?${qs}` : ""));
  }, [dispatch]);
  return null;
}
