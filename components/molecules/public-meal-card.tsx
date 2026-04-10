"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Meal } from "@/services/mealService";

type PublicMealCardProps = {
  meal: Meal;
  index: number;
  onAddToCart: (meal: Meal) => void;
};

export function PublicMealCard({ meal, index, onAddToCart }: PublicMealCardProps) {
  const canOrder = meal.isAvailable;

  return (
    <li className="flex h-full">
      <Card className="group flex w-full flex-col gap-0 overflow-hidden border-border/60 p-0 shadow-sm transition-shadow hover:border-border hover:shadow-md">
        <Link
          href={`/menu/${meal._id}`}
          className="block min-h-0 flex-1 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-muted">
            <Image
              src={meal.imageUrl}
              alt={meal.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 33vw"
              unoptimized
              priority={index === 0}
              loading={index === 0 ? "eager" : "lazy"}
            />
            {!canOrder && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
                <Badge variant="secondary" className="text-xs font-medium">
                  Unavailable
                </Badge>
              </div>
            )}
          </div>
          <div className="flex min-h-0 flex-1 flex-col justify-center gap-3 px-4 py-4">
            <CardHeader className="space-y-1 p-0">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="font-heading text-base leading-snug sm:text-lg">{meal.name}</CardTitle>
                <Badge variant="secondary" className="shrink-0 tabular-nums">
                  ${meal.price.toFixed(2)}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2 text-pretty">
                {meal.description?.trim() || " "}
              </CardDescription>
            </CardHeader>
          </div>
        </Link>
        <div className="border-t border-border/60 bg-muted/20 px-4 pb-4 pt-3">
          <CardFooter className="border-0 bg-transparent p-0">
            <Button
              type="button"
              className="w-full rounded-full"
              size="sm"
              disabled={!canOrder}
              onClick={() => onAddToCart(meal)}
            >
              {canOrder ? "Add to cart" : "Unavailable"}
            </Button>
          </CardFooter>
        </div>
      </Card>
    </li>
  );
}
