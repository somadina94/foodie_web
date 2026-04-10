"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { mealService, type Meal } from "@/services/mealService";
import { addItem } from "@/lib/features/cart/cartSlice";
import { useAppDispatch } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function CustomerMealsBrowse() {
  const dispatch = useAppDispatch();

  const { data: mealsRes, isPending, isError, error } = useQuery({
    queryKey: ["meals"],
    queryFn: () => mealService.list(),
  });

  const meals = useMemo(() => {
    const list = mealsRes?.data.meals ?? [];
    return list.filter((m) => m.isAvailable);
  }, [mealsRes]);

  function addToCart(meal: Meal) {
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
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-medium">Available now</h2>
      {isPending && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      )}
      {isError && (
        <p className="text-destructive">
          {error instanceof Error ? error.message : "Could not load menu."}
        </p>
      )}
      {meals.length === 0 && !isPending && !isError && (
        <p className="text-muted-foreground">No meals available right now. Check back soon.</p>
      )}
      {meals.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {meals.map((meal, index) => (
            <li key={meal._id} className="flex h-full">
              <Card className="flex w-full flex-col gap-0 overflow-hidden p-0">
                <Link
                  href={`/customer/meals/${meal._id}`}
                  className="block min-h-0 flex-1 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <div className="relative aspect-[4/3] w-full shrink-0 bg-muted">
                    <Image
                      src={meal.imageUrl}
                      alt={meal.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      unoptimized
                      priority={index === 0}
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                  </div>
                  <div className="flex min-h-0 flex-1 flex-col justify-center gap-3 px-4 py-4">
                    <CardHeader className="space-y-1 p-0">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base leading-snug">{meal.name}</CardTitle>
                        <Badge variant="secondary" className="shrink-0">
                          ${meal.price.toFixed(2)}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {meal.description || " "}
                      </CardDescription>
                    </CardHeader>
                  </div>
                </Link>
                <div className="border-t border-border/60 px-4 pb-4 pt-3">
                  <CardFooter className="border-0 bg-transparent p-0">
                    <Button
                      type="button"
                      className="w-full rounded-full"
                      size="sm"
                      onClick={() => addToCart(meal)}
                    >
                      Add to cart
                    </Button>
                  </CardFooter>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
