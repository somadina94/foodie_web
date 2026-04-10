"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { adminService } from "@/services/adminService";
import { orderService } from "@/services/orderService";
import {
  ordersToDailyOrderCounts,
  ordersToDailyRevenue,
  ordersToDailySpend,
  ordersToStatusChartRows,
  sumOrderTotals,
} from "@/lib/dashboardChartData";
import {
  buildAdminStatusRows,
  buildUsersByRoleRows,
  DashboardStatsSkeleton,
  KpiCards,
  OrdersByStatusChart,
  OrdersTrendChart,
  RevenueTrendChart,
  SpendTrendChart,
  UsersByRoleChart,
} from "@/components/dashboard/overview-charts";

function fmtMoney(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export function AdminOverviewSection() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => adminService.getDashboard(),
  });

  if (isPending) {
    return (
      <div className="space-y-6">
        <DashboardStatsSkeleton />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-[320px] rounded-xl border bg-muted/30" />
          <div className="h-[320px] rounded-xl border bg-muted/30" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-muted-foreground">
        {error instanceof Error ? error.message : "Could not load dashboard stats."}
      </p>
    );
  }

  const d = data!.data;
  const totalUsers = Object.values(d.usersByRole).reduce((a, b) => a + b, 0);
  const statusRows = buildAdminStatusRows(d.ordersByStatus);
  const roleRows = buildUsersByRoleRows(d.usersByRole);

  return (
    <div className="space-y-6">
      <KpiCards
        items={[
          { label: "Total orders", value: String(d.totalOrders) },
          { label: "Delivered revenue", value: fmtMoney(d.revenueDelivered) },
          { label: "Registered users", value: String(totalUsers) },
          {
            label: "Open pipeline",
            value: String(
              Object.entries(d.ordersByStatus)
                .filter(([s]) => s !== "delivered" && s !== "cancelled")
                .reduce((acc, [, n]) => acc + n, 0),
            ),
            hint: "Orders not yet delivered or cancelled",
          },
        ]}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <OrdersTrendChart data={d.dailyOrders} />
        <OrdersByStatusChart rows={statusRows} />
      </div>
      <UsersByRoleChart rows={roleRows} />
    </div>
  );
}

export function CustomerOverviewSection() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["orders", "mine"],
    queryFn: () => orderService.listMine(),
  });

  if (isPending) {
    return (
      <div className="space-y-6">
        <DashboardStatsSkeleton />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-[280px] rounded-xl border bg-muted/30" />
          <div className="h-[280px] rounded-xl border bg-muted/30" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-muted-foreground">
        {error instanceof Error ? error.message : "Could not load your orders."}
      </p>
    );
  }

  const orders = data!.data.orders;
  const statusRows = ordersToStatusChartRows(orders);
  const dailySpend = ordersToDailySpend(orders);
  const dailyOrders = ordersToDailyOrderCounts(orders);
  const lifetimeSpend = sumOrderTotals(orders);
  const delivered = orders.filter((o) => o.status === "delivered").length;

  return (
    <div className="space-y-6">
      <KpiCards
        items={[
          { label: "Your orders", value: String(orders.length) },
          { label: "Delivered", value: String(delivered) },
          { label: "Lifetime spend", value: fmtMoney(lifetimeSpend) },
          {
            label: "Open orders",
            value: String(
              orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled").length,
            ),
          },
        ]}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <SpendTrendChart data={dailySpend} title="Spend (last 14 days)" />
        <OrdersTrendChart data={dailyOrders} title="Orders (last 14 days)" description="Your orders per day (UTC)." />
      </div>
      <OrdersByStatusChart
        rows={statusRows}
        title="Your orders by status"
        description="Where your current and past orders sit in the workflow."
      />
    </div>
  );
}

export function VendorOverviewSection() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["orders", "kitchen"],
    queryFn: () => orderService.listKitchen(),
  });

  if (isPending) {
    return (
      <div className="space-y-6">
        <DashboardStatsSkeleton />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-[280px] rounded-xl border bg-muted/30" />
          <div className="h-[280px] rounded-xl border bg-muted/30" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-muted-foreground">
        {error instanceof Error ? error.message : "Could not load kitchen orders."}
      </p>
    );
  }

  const orders = data!.data.orders;
  const statusRows = ordersToStatusChartRows(orders);
  const dailyOrders = ordersToDailyOrderCounts(orders);
  const dailyRevenue = ordersToDailyRevenue(orders);
  const pipeline = orders.filter(
    (o) => o.status !== "delivered" && o.status !== "cancelled",
  ).length;

  return (
    <div className="space-y-6">
      <KpiCards
        items={[
          { label: "Kitchen orders", value: String(orders.length) },
          { label: "In progress", value: String(pipeline) },
          { label: "14-day revenue", value: fmtMoney(dailyRevenue.reduce((a, s) => a + s.revenue, 0)) },
          {
            label: "Delivered (all time)",
            value: String(orders.filter((o) => o.status === "delivered").length),
          },
        ]}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueTrendChart data={dailyRevenue} />
        <OrdersTrendChart
          data={dailyOrders}
          title="Orders (last 14 days)"
          description="Orders assigned to your kitchen per day (UTC)."
        />
      </div>
      <OrdersByStatusChart
        rows={statusRows}
        title="Orders by status"
        description="Pipeline for your kitchen."
      />
      <p className="text-sm text-muted-foreground">
        Manage live orders on the{" "}
        <Link href="/vendor/orders" className="font-medium text-primary underline-offset-4 hover:underline">
          Orders
        </Link>{" "}
        page.
      </p>
    </div>
  );
}

export function RiderOverviewSection() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["orders", "delivery"],
    queryFn: () => orderService.listDelivery(),
  });

  if (isPending) {
    return (
      <div className="space-y-6">
        <DashboardStatsSkeleton />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-[280px] rounded-xl border bg-muted/30" />
          <div className="h-[280px] rounded-xl border bg-muted/30" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-muted-foreground">
        {error instanceof Error ? error.message : "Could not load deliveries."}
      </p>
    );
  }

  const orders = data!.data.orders;
  const statusRows = ordersToStatusChartRows(orders);
  const dailyOrders = ordersToDailyOrderCounts(orders);
  const delivered = orders.filter((o) => o.status === "delivered").length;

  return (
    <div className="space-y-6">
      <KpiCards
        items={[
          { label: "Assigned runs", value: String(orders.length) },
          { label: "Completed", value: String(delivered) },
          {
            label: "Active deliveries",
            value: String(
              orders.filter((o) => o.status === "out_for_delivery" || o.status === "rider_assigned")
                .length,
            ),
          },
          {
            label: "In pipeline",
            value: String(orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled").length),
          },
        ]}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <OrdersTrendChart
          data={dailyOrders}
          title="Deliveries (last 14 days)"
          description="Orders assigned to you per day (UTC)."
        />
        <OrdersByStatusChart
          rows={statusRows}
          title="Deliveries by status"
          description="Your delivery workload."
        />
      </div>
      <p className="text-sm text-muted-foreground">
        Open{" "}
        <Link href="/rider/deliveries" className="font-medium text-primary underline-offset-4 hover:underline">
          Deliveries
        </Link>{" "}
        for maps and status updates.
      </p>
    </div>
  );
}
