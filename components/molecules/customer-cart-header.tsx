"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import {
  selectCartCount,
  selectCartItems,
  selectCartSubtotal,
} from "@/lib/features/cart/cartSlice";
import { deliveryFeeEstimate } from "@/lib/orders/delivery-fee";
import { useAppSelector } from "@/lib/hooks";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function CustomerCartHeader() {
  const router = useRouter();
  const items = useAppSelector(selectCartItems);
  const count = useAppSelector(selectCartCount);
  const subtotal = useAppSelector(selectCartSubtotal);
  const fee = deliveryFeeEstimate();
  const estimated = subtotal + fee;
  const preview = items.slice(0, 4);
  const more = items.length - preview.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        className={cn(
          "relative inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-3 text-sm font-medium shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          count > 0
            ? "border-primary/40 bg-primary/15 text-primary hover:bg-primary/25"
            : "border-border bg-background hover:bg-muted",
        )}
        aria-label="Open cart menu"
      >
        <ShoppingBag className="size-4" />
        <span className="hidden sm:inline">Cart</span>
        {count > 0 && (
          <Badge
            className="h-5 min-w-5 justify-center rounded-full px-1.5 text-[0.65rem] tabular-nums"
            variant="default"
          >
            {count}
          </Badge>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-[min(100vw-2rem,22rem)] p-0">
        <DropdownMenuGroup>
          <div className="border-b border-primary/20 bg-primary/10 px-3 py-2.5">
            <DropdownMenuLabel className="p-0 text-xs font-normal text-muted-foreground">
              Your cart
            </DropdownMenuLabel>
            <p className="mt-1 text-lg font-semibold tabular-nums text-primary">
              ${subtotal.toFixed(2)}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                subtotal
              </span>
            </p>
            {count > 0 && (
              <p className="text-xs text-muted-foreground">
                ~${estimated.toFixed(2)} with delivery
              </p>
            )}
          </div>
        </DropdownMenuGroup>

        <div className="max-h-64 overflow-y-auto p-2">
          {items.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              Nothing in your cart yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {preview.map((line) => (
                <li
                  key={line.mealId}
                  className="flex gap-2 rounded-md border border-border/50 bg-muted/40 p-2"
                >
                  <div className="relative size-11 shrink-0 overflow-hidden rounded bg-muted">
                    <Image
                      src={line.imageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="44px"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium leading-tight">{line.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ×{line.quantity} · ${(line.price * line.quantity).toFixed(2)}
                    </p>
                  </div>
                </li>
              ))}
              {more > 0 && (
                <li className="px-2 py-1 text-center text-xs text-muted-foreground">
                  +{more} more {more === 1 ? "item" : "items"}
                </li>
              )}
            </ul>
          )}
        </div>

        <DropdownMenuSeparator className="m-0" />
        <DropdownMenuGroup className="p-2 pt-0">
          <DropdownMenuItem
            className="cursor-pointer justify-center rounded-lg bg-primary py-2.5 font-medium text-primary-foreground focus:bg-primary/90 focus:text-primary-foreground data-highlighted:bg-primary/90"
            onClick={() => router.push("/customer/cart")}
          >
            View full cart
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
