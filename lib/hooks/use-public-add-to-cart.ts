"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addItem } from "@/lib/features/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { ROUTES } from "@/lib/constants";
import type { Meal } from "@/services/mealService";

/** Redirects to login with `callbackUrl` when not authenticated. */
export function usePublicAddToCart(callbackPath: string) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  return function addToCart(meal: Meal) {
    if (!isAuthenticated) {
      router.push(`${ROUTES.login}?callbackUrl=${encodeURIComponent(callbackPath)}`);
      return;
    }
    dispatch(
      addItem({
        mealId: meal._id,
        name: meal.name,
        price: meal.price,
        imageUrl: meal.imageUrl,
        quantity: 1,
      }),
    );
    toast.success("Added to cart", { description: meal.name });
  };
}
