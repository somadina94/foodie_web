"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { mealService, type Meal } from "@/services/mealService";
import { addItem } from "@/lib/features/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/services/apiClient";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";

type MealDetailViewProps = {
  mealId: string;
};

export function MealDetailView({ mealId }: MealDetailViewProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const fromCustomerShell = pathname.startsWith("/customer/meals");
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const canUseCart = useAppSelector(
    (s) => s.auth.isAuthenticated && s.auth.role === "user",
  );

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["meal", mealId],
    queryFn: () => mealService.getById(mealId),
    enabled: Boolean(mealId),
  });

  const meal = data?.data.meal;

  function handleAddToCart(m: Meal) {
    if (!isAuthenticated) {
      router.push(`${ROUTES.login}?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }
    dispatch(
      addItem({
        mealId: m._id,
        name: m.name,
        price: m.price,
        imageUrl: m.imageUrl,
        quantity: 1,
      }),
    );
    toast.success("Added to cart", { description: m.name });
  }

  if (isPending) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="aspect-[16/10] w-full rounded-xl" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (isError || !meal) {
    const notFound =
      error instanceof ApiError && error.statusCode === 404;
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <p className="text-lg font-medium">
          {notFound ? "This meal could not be found." : "Something went wrong."}
        </p>
        <p className="mt-2 text-muted-foreground">
          {error instanceof Error ? error.message : "Try again later."}
        </p>
        <Link
          href="/menu"
          className={cn(buttonVariants({ size: "default" }), "mt-6 inline-flex rounded-full")}
        >
          Back to menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link
          href={fromCustomerShell ? "/customer/dashboard/meals" : "/menu"}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "inline-flex gap-1 rounded-full",
          )}
        >
          <ArrowLeft className="size-4" />
          {fromCustomerShell ? "Back to meals" : "Back to menu"}
        </Link>
        <Link
          href="/menu"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex rounded-full")}
        >
          Full menu
        </Link>
      </div>

      <article className="space-y-6">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-muted ring-1 ring-border/60">
          <Image
            src={meal.imageUrl}
            alt={meal.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 48rem"
            priority
            unoptimized
          />
        </div>

        <header className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              {meal.name}
            </h1>
            <Badge variant="secondary" className="shrink-0 text-base tabular-nums">
              ${meal.price.toFixed(2)}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {meal.isAvailable ? (
              <Badge>Available</Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                Currently unavailable
              </Badge>
            )}
          </div>
        </header>

        <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-wrap">
          {meal.description?.trim() || "No description provided."}
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            type="button"
            size="lg"
            className="rounded-full"
            disabled={!meal.isAvailable}
            onClick={() => handleAddToCart(meal)}
          >
            Add to cart
          </Button>
          {canUseCart && (
            <Link
              href="/customer/cart"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "inline-flex rounded-full")}
            >
              View cart
            </Link>
          )}
        </div>
      </article>
    </div>
  );
}
