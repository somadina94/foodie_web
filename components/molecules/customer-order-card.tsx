import type { Order } from "@/services/orderService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  formatOrderDate,
  orderFulfillmentLabel,
  paymentStatusLabel,
} from "@/lib/orders/order-labels";

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

function orderShortId(id: string) {
  return id.length > 10 ? id.slice(-8) : id;
}

function paymentBadgeVariant(
  ps: string,
): "default" | "secondary" | "destructive" | "outline" {
  if (ps === "paid") return "default";
  if (ps === "unpaid") return "outline";
  if (ps === "failed" || ps === "refunded") return "destructive";
  return "secondary";
}

/** Summary row for accordion triggers on the orders list. */
export function CustomerOrderAccordionSummary({ order }: { order: Order }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2 text-left sm:flex-row sm:items-center sm:justify-between sm:pr-2">
      <div className="min-w-0">
        <p className="font-semibold">Order #{orderShortId(order._id)}</p>
        <p className="text-sm text-muted-foreground">{formatOrderDate(order.createdAt)}</p>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <div className="flex flex-wrap gap-2">
          <Badge variant={paymentBadgeVariant(order.paymentStatus)}>
            {paymentStatusLabel(order.paymentStatus)}
          </Badge>
          <Badge variant="outline">{orderFulfillmentLabel(order.status)}</Badge>
        </div>
        <span className="text-base font-semibold tabular-nums">{money(order.total)}</span>
      </div>
    </div>
  );
}

/** Line items, totals, and delivery address — shared by the card and accordion list. */
export function CustomerOrderDetailsBody({ order }: { order: Order }) {
  return (
    <div className="space-y-4">
      <ul className="space-y-2 text-sm">
        {order.items.map((line, i) => (
          <li key={`${String(line.mealId)}-${i}`} className="flex justify-between gap-4">
            <span className="min-w-0">
              <span className="font-medium">{line.name}</span>
              <span className="text-muted-foreground"> × {line.quantity}</span>
            </span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {money(line.price * line.quantity)}
            </span>
          </li>
        ))}
      </ul>
      <Separator />
      <div className="space-y-1 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="tabular-nums">{money(order.subtotal)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Delivery</span>
          <span className="tabular-nums">{money(order.deliveryFee)}</span>
        </div>
      </div>
      <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Deliver to
        </p>
        <p className="mt-1 leading-snug">{order.deliveryAddress}</p>
      </div>
    </div>
  );
}

export function CustomerOrderCard({ order }: { order: Order }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-3 pb-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Order #{orderShortId(order._id)}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatOrderDate(order.createdAt)}
            </p>
          </div>
          <p className="text-lg font-semibold tabular-nums sm:text-right">{money(order.total)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={paymentBadgeVariant(order.paymentStatus)}>
            {paymentStatusLabel(order.paymentStatus)}
          </Badge>
          <Badge variant="outline">{orderFulfillmentLabel(order.status)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CustomerOrderDetailsBody order={order} />
      </CardContent>
    </Card>
  );
}
