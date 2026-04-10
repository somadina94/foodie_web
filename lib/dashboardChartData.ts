import type { Order } from "@/services/orderService";

const DASHBOARD_DAYS = 14;

function utcDateLabels(days: number): string[] {
  const labels: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    d.setUTCHours(0, 0, 0, 0);
    labels.push(d.toISOString().slice(0, 10));
  }
  return labels;
}

export function ordersToStatusChartRows(orders: Order[]) {
  const map = new Map<string, number>();
  for (const o of orders) {
    map.set(o.status, (map.get(o.status) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([status, count]) => ({
    status,
    count,
  }));
}

export function ordersToDailyOrderCounts(orders: Order[], days = DASHBOARD_DAYS) {
  const labels = utcDateLabels(days);
  const map = new Map<string, number>();
  for (const o of orders) {
    if (!o.createdAt) continue;
    const d = o.createdAt.slice(0, 10);
    map.set(d, (map.get(d) ?? 0) + 1);
  }
  return labels.map((date) => ({ date, orders: map.get(date) ?? 0 }));
}

/** Sum order totals per UTC day (excludes cancelled). */
export function ordersToDailySpend(orders: Order[], days = DASHBOARD_DAYS) {
  const labels = utcDateLabels(days);
  const map = new Map<string, number>();
  for (const o of orders) {
    if (!o.createdAt || o.status === "cancelled") continue;
    const d = o.createdAt.slice(0, 10);
    map.set(d, (map.get(d) ?? 0) + o.total);
  }
  return labels.map((date) => ({ date, spend: map.get(date) ?? 0 }));
}

export function ordersToDailyRevenue(orders: Order[], days = DASHBOARD_DAYS) {
  const labels = utcDateLabels(days);
  const map = new Map<string, number>();
  for (const o of orders) {
    if (!o.createdAt || o.status === "cancelled") continue;
    const d = o.createdAt.slice(0, 10);
    map.set(d, (map.get(d) ?? 0) + o.total);
  }
  return labels.map((date) => ({ date, revenue: map.get(date) ?? 0 }));
}

export function sumOrderTotals(orders: Order[]) {
  return orders.reduce((acc, o) => (o.status === "cancelled" ? acc : acc + o.total), 0);
}
