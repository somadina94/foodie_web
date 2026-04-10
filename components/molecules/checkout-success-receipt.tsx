import Image from "next/image";
import type { Order } from "@/services/orderService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

function orderShortId(id: string) {
  return id.length > 10 ? id.slice(-8) : id;
}

export function CheckoutSuccessReceipt({ order }: { order: Order }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Order summary</CardTitle>
        <CardDescription className="font-mono text-xs">
          #{orderShortId(order._id)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {order.items.map((line, i) => (
            <li
              key={`${String(line.mealId)}-${i}`}
              className="flex gap-3 rounded-lg border border-border/60 bg-muted/30 p-3"
            >
              <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                {line.imageUrl ? (
                  <Image
                    src={line.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                    Meal
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium leading-snug">{line.name}</p>
                <p className="text-sm text-muted-foreground">
                  {money(line.price)} × {line.quantity}
                </p>
              </div>
              <p className="shrink-0 tabular-nums font-medium">
                {money(line.price * line.quantity)}
              </p>
            </li>
          ))}
        </ul>
        <Separator />
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums">{money(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery</span>
            <span className="tabular-nums">{money(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{money(order.total)}</span>
          </div>
        </div>
        <div className="rounded-lg border border-border/60 bg-background/80 p-3 text-sm">
          <p className="text-muted-foreground">Deliver to</p>
          <p className="mt-1 leading-snug">{order.deliveryAddress}</p>
        </div>
      </CardContent>
    </Card>
  );
}
