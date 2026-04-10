import type { Order } from "@/services/orderService";

function timeMs(iso: string | undefined): number {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : 0;
}

/** Prefer creation time; fall back to updatedAt when createdAt is missing (stable tie-break on _id). */
function sortKey(o: Pick<Order, "createdAt" | "updatedAt">): number {
  const c = o.createdAt ? timeMs(o.createdAt) : 0;
  if (c > 0) return c;
  return timeMs(o.updatedAt);
}

/** Newest placed orders first (stable tie-break on id). */
export function sortOrdersNewestFirst<
  T extends Pick<Order, "_id" | "createdAt" | "updatedAt">,
>(orders: T[]): T[] {
  return [...orders].sort((a, b) => {
    const ka = sortKey(a);
    const kb = sortKey(b);
    if (kb !== ka) return kb - ka;
    const ua = timeMs(a.updatedAt);
    const ub = timeMs(b.updatedAt);
    if (ub !== ua) return ub - ua;
    return b._id.localeCompare(a._id);
  });
}
