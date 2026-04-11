import type { Order } from "@/services/orderService";

/** Orders still moving through the pipeline (not terminal). */
export function countActiveOrders(orders: Order[] | undefined): number {
  if (!orders?.length) return 0;
  return orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled").length;
}

/** Hide when zero; cap at 99+ (sidebar / tab badges). */
export function formatTabBadge(count: number): string | undefined {
  if (count <= 0) return undefined;
  return count > 99 ? "99+" : String(count);
}
