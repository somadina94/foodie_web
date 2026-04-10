"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { mealService } from "@/services/mealService";
import { PublicMealCard } from "@/components/molecules/public-meal-card";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { usePublicAddToCart } from "@/lib/hooks/use-public-add-to-cart";

const PREVIEW_COUNT = 3;
const HOME_CALLBACK = "/";

export function MarketingMealsSection() {
  const addToCart = usePublicAddToCart(HOME_CALLBACK);

  const { data: mealsRes, isPending, isError, error } = useQuery({
    queryKey: ["meals"],
    queryFn: () => mealService.list(),
  });

  const { previewMeals, hasMore } = useMemo(() => {
    const list = (mealsRes?.data.meals ?? []).filter((m) => m.isAvailable);
    return {
      previewMeals: list.slice(0, PREVIEW_COUNT),
      hasMore: list.length > PREVIEW_COUNT,
    };
  }, [mealsRes]);

  return (
    <section id="meals" className="border-b border-border/60 bg-muted/20 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">Meals</h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              A taste of our menu. Sign in to add items to your cart — see everything on the full
              menu.
            </p>
          </div>
          <Link
            href={ROUTES.menu}
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "w-fit shrink-0 rounded-full px-6",
            )}
          >
            Full menu
          </Link>
        </div>

        {isPending && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: PREVIEW_COUNT }).map((_, i) => (
              <Skeleton key={i} className="h-[22rem] rounded-2xl" />
            ))}
          </div>
        )}

        {isError && (
          <p className="text-destructive">
            {error instanceof Error ? error.message : "Could not load meals."}
          </p>
        )}

        {!isPending && !isError && previewMeals.length === 0 && (
          <p className="text-muted-foreground">No meals available right now. Check back soon.</p>
        )}

        {previewMeals.length > 0 && (
          <>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {previewMeals.map((meal, index) => (
                <PublicMealCard
                  key={meal._id}
                  meal={meal}
                  index={index}
                  onAddToCart={addToCart}
                />
              ))}
            </ul>
            {hasMore && (
              <div className="mt-10 flex justify-center">
                <Link
                  href={ROUTES.menu}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "inline-flex rounded-full px-8",
                  )}
                >
                  See all meals
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
