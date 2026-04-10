"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatOrderStatus } from "@/lib/orderStatusLabels";

const tickDate = (isoDate: string) => {
  const d = new Date(`${isoDate}T12:00:00.000Z`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const roleLabel = (role: string) => {
  const map: Record<string, string> = {
    user: "Customers",
    admin: "Admins",
    vendor: "Vendors",
    rider: "Riders",
  };
  return map[role] ?? role;
};

type StatusRow = { status: string; count: number };

const statusChartConfig = {
  count: {
    label: "Orders",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function OrdersByStatusChart({
  rows,
  title = "Orders by status",
  description = "Current pipeline across all workflow stages.",
}: {
  rows: StatusRow[];
  title?: string;
  description?: string;
}) {
  const data = rows.map((r) => ({
    label: formatOrderStatus(r.status),
    count: r.count,
  }));

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No order data yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pl-0">
        <ChartContainer config={statusChartConfig} className="h-[240px] w-full">
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ left: 12, right: 12, top: 8, bottom: 64 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              angle={-32}
              textAnchor="end"
              height={72}
              interval={0}
              tick={{ fontSize: 11 }}
            />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const trendChartConfig = {
  orders: {
    label: "Orders",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function OrdersTrendChart({
  data,
  title = "Order volume",
  description = "New orders per day (UTC).",
}: {
  data: { date: string; orders: number }[];
  title?: string;
  description?: string;
}) {
  const empty = data.every((d) => d.orders === 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {empty ? (
          <p className="text-sm text-muted-foreground">No orders in this window yet.</p>
        ) : (
          <ChartContainer config={trendChartConfig} className="h-[240px] w-full">
            <AreaChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={tickDate}
                minTickGap={16}
              />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
              <ChartTooltip
                content={<ChartTooltipContent labelFormatter={(_, p) => tickDate(p?.[0]?.payload?.date)} />}
              />
              <Area
                dataKey="orders"
                type="monotone"
                fill="var(--color-orders)"
                fillOpacity={0.25}
                stroke="var(--color-orders)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

const spendChartConfig = {
  spend: {
    label: "Spend",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function SpendTrendChart({
  data,
  title = "Spend over time",
  description = "Order totals by day (excludes cancelled).",
}: {
  data: { date: string; spend: number }[];
  title?: string;
  description?: string;
}) {
  const empty = data.every((d) => d.spend === 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {empty ? (
          <p className="text-sm text-muted-foreground">No spend in this window yet.</p>
        ) : (
          <ChartContainer config={spendChartConfig} className="h-[240px] w-full">
            <AreaChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={tickDate}
                minTickGap={16}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={44}
                tickFormatter={(v) =>
                  typeof v === "number" ? `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0)}` : String(v)
                }
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, p) => tickDate(p?.[0]?.payload?.date)}
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, "Spend"]}
                  />
                }
              />
              <Area
                dataKey="spend"
                type="monotone"
                fill="var(--color-spend)"
                fillOpacity={0.25}
                stroke="var(--color-spend)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

const revenueChartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function RevenueTrendChart({
  data,
  title = "Kitchen revenue",
  description = "Order totals by day for your kitchen (excludes cancelled).",
}: {
  data: { date: string; revenue: number }[];
  title?: string;
  description?: string;
}) {
  const empty = data.every((d) => d.revenue === 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {empty ? (
          <p className="text-sm text-muted-foreground">No revenue in this window yet.</p>
        ) : (
          <ChartContainer config={revenueChartConfig} className="h-[240px] w-full">
            <AreaChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={tickDate}
                minTickGap={16}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={44}
                tickFormatter={(v) =>
                  typeof v === "number" ? `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0)}` : String(v)
                }
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, p) => tickDate(p?.[0]?.payload?.date)}
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
                  />
                }
              />
              <Area
                dataKey="revenue"
                type="monotone"
                fill="var(--color-revenue)"
                fillOpacity={0.25}
                stroke="var(--color-revenue)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

const usersChartConfig = {
  count: {
    label: "Users",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function UsersByRoleChart({
  rows,
}: {
  rows: { role: string; label: string; count: number }[];
}) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Users by role</CardTitle>
          <CardDescription>Accounts in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No users yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users by role</CardTitle>
        <CardDescription>Accounts in the system.</CardDescription>
      </CardHeader>
      <CardContent className="pl-0">
        <ChartContainer config={usersChartConfig} className="h-[220px] w-full">
          <BarChart
            accessibilityLayer
            data={rows}
            margin={{ left: 12, right: 12, top: 8, bottom: 8 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function buildUsersByRoleRows(usersByRole: Record<string, number>) {
  return Object.entries(usersByRole).map(([role, count]) => ({
    role,
    label: roleLabel(role),
    count,
  }));
}

export function buildAdminStatusRows(ordersByStatus: Record<string, number>): StatusRow[] {
  return Object.entries(ordersByStatus).map(([status, count]) => ({ status, count }));
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

export function KpiCards({
  items,
}: {
  items: { label: string; value: string; hint?: string }[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="pb-2">
            <CardDescription>{item.label}</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{item.value}</CardTitle>
            {item.hint ? <CardDescription className="pt-1">{item.hint}</CardDescription> : null}
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
