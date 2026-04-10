"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, Trash2 } from "lucide-react";
import { orderService } from "@/services/orderService";
import { ApiError } from "@/services/apiClient";
import {
  clearCart,
  removeItem,
  selectCartItems,
  selectCartSubtotal,
  setQuantity,
} from "@/lib/features/cart/cartSlice";
import { toast } from "sonner";
import { deliveryFeeEstimate } from "@/lib/orders/delivery-fee";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function CustomerCartCheckout() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const qc = useQueryClient();
  const cartItems = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const user = useAppSelector((s) => s.auth.user);

  const suggestedAddress = useMemo(() => {
    if (!user) return "";
    const parts = [user.address, user.city, user.state, user.zip].filter(
      (p): p is string => Boolean(p && String(p).trim()),
    );
    return parts.length ? parts.join(", ") : "";
  }, [user]);
  const [addressOverride, setAddressOverride] = useState<string | null>(null);
  const deliveryAddress = addressOverride ?? suggestedAddress;
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const fee = deliveryFeeEstimate();
  const estimatedTotal = subtotal + fee;

  const codMutation = useMutation({
    mutationFn: async () => {
      setCheckoutError(null);
      const items = cartItems.map((i) => ({
        mealId: i.mealId,
        quantity: i.quantity,
      }));
      return orderService.create({
        items,
        deliveryAddress: deliveryAddress.trim(),
      });
    },
    onSuccess: () => {
      dispatch(clearCart());
      void qc.invalidateQueries({ queryKey: ["orders", "mine"] });
      toast.success("Order placed", {
        description: "Cash on delivery — we will send it to the kitchen.",
      });
      router.push("/customer/orders?placed=1");
    },
    onError: (e) => {
      const msg = e instanceof ApiError ? e.message : "Order failed.";
      setCheckoutError(msg);
      toast.error("Could not place order", { description: msg });
    },
  });

  const stripeMutation = useMutation({
    mutationFn: async () => {
      setCheckoutError(null);
      const items = cartItems.map((i) => ({
        mealId: i.mealId,
        quantity: i.quantity,
      }));
      const { data } = await orderService.create({
        items,
        deliveryAddress: deliveryAddress.trim(),
        paymentMethod: "stripe",
      });
      const session = await orderService.createCheckoutSession(data.order._id);
      return session.data.url;
    },
    onSuccess: (url) => {
      toast.message("Opening secure checkout…", { duration: 2000 });
      window.location.href = url;
    },
    onError: (e) => {
      const msg =
        e instanceof ApiError ? e.message : "Could not start card checkout.";
      setCheckoutError(msg);
      toast.error("Checkout failed", { description: msg });
    },
  });

  const busy = codMutation.isPending || stripeMutation.isPending;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Label htmlFor="cart-delivery">Delivery address</Label>
        <Input
          id="cart-delivery"
          className="mt-1.5"
          placeholder="Street, city, state, ZIP"
          value={deliveryAddress}
          onChange={(e) => setAddressOverride(e.target.value)}
        />
      </div>

      {cartItems.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Your cart is empty. Add meals from the menu.
        </p>
      ) : (
        <ul className="space-y-3">
          {cartItems.map((line) => (
            <li
              key={line.mealId}
              className="flex gap-3 rounded-lg border border-border/60 bg-muted/30 p-3"
            >
              <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                <Image
                  src={line.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                  unoptimized
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{line.name}</p>
                <p className="text-sm text-muted-foreground">
                  ${line.price.toFixed(2)} each
                </p>
                <div className="mt-2 flex items-center gap-1">
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="outline"
                    className="size-8"
                    onClick={() =>
                      dispatch(
                        setQuantity({
                          mealId: line.mealId,
                          quantity: line.quantity - 1,
                        }),
                      )
                    }
                  >
                    <Minus className="size-3" />
                  </Button>
                  <span className="w-8 text-center text-sm tabular-nums">{line.quantity}</span>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="outline"
                    className="size-8"
                    onClick={() =>
                      dispatch(
                        setQuantity({
                          mealId: line.mealId,
                          quantity: line.quantity + 1,
                        }),
                      )
                    }
                  >
                    <Plus className="size-3" />
                  </Button>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    className="ml-auto size-8 text-destructive"
                    onClick={() => {
                      dispatch(removeItem(line.mealId));
                      toast("Removed from cart", { description: line.name });
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {cartItems.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span className="tabular-nums">${fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>Estimated total</span>
              <span className="tabular-nums">${estimatedTotal.toFixed(2)}</span>
            </div>
          </div>
        </>
      )}

      {checkoutError && <p className="text-sm text-destructive">{checkoutError}</p>}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          className="flex-1 rounded-full"
          disabled={cartItems.length === 0 || !deliveryAddress.trim() || busy}
          onClick={() => stripeMutation.mutate()}
        >
          {stripeMutation.isPending ? "Redirecting…" : "Pay with card"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1 rounded-full"
          disabled={cartItems.length === 0 || !deliveryAddress.trim() || busy}
          onClick={() => codMutation.mutate()}
        >
          {codMutation.isPending ? "Placing order…" : "Cash on delivery"}
        </Button>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Card checkout uses Stripe. Cash orders go to the kitchen right away.
      </p>
    </div>
  );
}
