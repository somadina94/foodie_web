"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { mealService } from "@/services/mealService";
import { PublicMealCard } from "@/components/molecules/public-meal-card";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { usePublicAddToCart } from "@/lib/hooks/use-public-add-to-cart";

export default function MenuPage() {
  const addToCart = usePublicAddToCart("/menu");

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["meals"],
    queryFn: () => mealService.list(),
  });

  const meals = useMemo(() => data?.data.meals ?? [], [data]);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-gradient-to-b from-muted/40 via-background to-background">
      <div className="border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <Link
            href={ROUTES.home}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "mb-6 inline-flex gap-1.5 rounded-full text-muted-foreground hover:text-foreground",
            )}
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to home
          </Link>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Our kitchen</p>
          <h1 className="mt-2 font-heading text-4xl font-bold tracking-tight sm:text-5xl">Full menu</h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Every dish we serve right now — photos, prices, and details. Sign in to add to your cart.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        {isPending && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[22rem] rounded-2xl" />
            ))}
          </div>
        )}

        {isError && (
          <p className="text-center text-destructive">
            {error instanceof Error ? error.message : "Could not load menu."}
          </p>
        )}

        {data && meals.length === 0 && (
          <p className="text-center text-muted-foreground">No meals listed yet. Check back soon.</p>
        )}

        {data && meals.length > 0 && (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {meals.map((meal, index) => (
              <PublicMealCard
                key={meal._id}
                meal={meal}
                index={index}
                onAddToCart={addToCart}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
