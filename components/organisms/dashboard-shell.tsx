"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/atoms/logo";
import { ThemeToggle } from "@/components/molecules/theme-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  Bike,
  ChefHat,
  ClipboardList,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Settings,
  ShoppingCart,
  UtensilsCrossed,
  Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { notificationService } from "@/services/notificationService";
import { orderService } from "@/services/orderService";
import { countActiveOrders, formatTabBadge } from "@/lib/orderCounts";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";
import { performLogout } from "@/lib/logout";
import { CustomerCartHeader } from "@/components/molecules/customer-cart-header";
import { DashboardLegalLinks } from "@/components/molecules/dashboard-legal-links";
import { RiderAvailabilityToggle } from "@/components/molecules/rider-availability-toggle";
import { useAppSelector } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type NavItem = { href: string; label: string; icon: LucideIcon };

type NavConfig = {
  title: string;
  /** Customer only: Overview + Browse under the Meals group. */
  mealsItems?: NavItem[];
  items: NavItem[];
};

const NAV: Record<"customer" | "admin" | "vendor" | "rider", NavConfig> = {
  customer: {
    title: "Customer",
    mealsItems: [
      { href: "/customer/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/customer/dashboard/meals", label: "Browse", icon: LayoutGrid },
    ],
    items: [
      { href: "/customer/cart", label: "Cart", icon: ShoppingCart },
      { href: "/customer/orders", label: "Orders", icon: ClipboardList },
      { href: "/customer/settings", label: "Settings", icon: Settings },
      { href: ROUTES.notifications, label: "Notifications", icon: Bell },
    ],
  },
  admin: {
    title: "Admin",
    items: [
      { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/admin/users", label: "Users", icon: Users },
      { href: ROUTES.notifications, label: "Notifications", icon: Bell },
    ],
  },
  vendor: {
    title: "Kitchen",
    items: [
      { href: "/vendor/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/vendor/meals", label: "Meals", icon: UtensilsCrossed },
      { href: "/vendor/orders", label: "Orders", icon: ChefHat },
      { href: ROUTES.notifications, label: "Notifications", icon: Bell },
    ],
  },
  rider: {
    title: "Rider",
    items: [
      { href: "/rider/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/rider/deliveries", label: "Deliveries", icon: Bike },
      { href: ROUTES.notifications, label: "Notifications", icon: Bell },
    ],
  },
};

export function DashboardShell({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: keyof typeof NAV;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { title, items: navItems, mealsItems } = NAV[variant];
  const userName = useAppSelector((s) => s.auth.user?.name);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const firstName = userName?.trim().split(/\s+/)[0];

  const { data: unreadData } = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: () => notificationService.list(),
    enabled: isAuthenticated,
    select: (r) => r.data.unreadCount,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const { data: customerOrdersData } = useQuery({
    queryKey: ["orders", "mine"],
    queryFn: () => orderService.listMine(),
    enabled: isAuthenticated && variant === "customer",
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
  const { data: vendorOrdersData } = useQuery({
    queryKey: ["orders", "kitchen"],
    queryFn: () => orderService.listKitchen(),
    enabled: isAuthenticated && variant === "vendor",
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
  const { data: riderOrdersData } = useQuery({
    queryKey: ["orders", "delivery"],
    queryFn: () => orderService.listDelivery(),
    enabled: isAuthenticated && variant === "rider",
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const activeOrderCount = useMemo(() => {
    if (variant === "customer") return countActiveOrders(customerOrdersData?.data.orders);
    if (variant === "vendor") return countActiveOrders(vendorOrdersData?.data.orders);
    if (variant === "rider") return countActiveOrders(riderOrdersData?.data.orders);
    return 0;
  }, [variant, customerOrdersData, vendorOrdersData, riderOrdersData]);

  const headerSubtitle =
    variant === "customer" && firstName ? `Hello, ${firstName}` : title;

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-border/80">
        <SidebarHeader className="gap-3 p-4 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-2">
          <Logo className="group-data-[collapsible=icon]:text-base" />
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground group-data-[collapsible=icon]:hidden">
            {headerSubtitle}
          </p>
        </SidebarHeader>
        <SidebarContent>
          {mealsItems && mealsItems.length > 0 ? (
            <>
              <SidebarGroup>
                <SidebarGroupLabel>Meals</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {mealsItems.map((item) => {
                      const Icon = item.icon;
                      const active =
                        item.href === "/customer/dashboard"
                          ? pathname === "/customer/dashboard"
                          : pathname.startsWith("/customer/dashboard/meals") ||
                            pathname.startsWith("/customer/meals");
                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton
                            render={<Link href={item.href} />}
                            isActive={active}
                            className="rounded-lg"
                          >
                            <Icon className="size-4" />
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              <SidebarGroup>
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navItems.map((item) => {
                      const active =
                        pathname === item.href || pathname.startsWith(`${item.href}/`);
                      const Icon = item.icon;
                      const showUnread =
                        item.href === ROUTES.notifications &&
                        typeof unreadData === "number" &&
                        unreadData > 0;
                      const showActiveOrders =
                        activeOrderCount > 0 &&
                        ((variant === "customer" && item.href === ROUTES.customerOrders) ||
                          (variant === "vendor" && item.href === "/vendor/orders") ||
                          (variant === "rider" && item.href === "/rider/deliveries"));

                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton
                            render={<Link href={item.href} />}
                            isActive={active}
                            className="rounded-lg"
                          >
                            {showUnread ? (
                              <span className="relative inline-flex shrink-0">
                                <Icon className="size-4" />
                                <span
                                  className={cn(
                                    "absolute -right-1 -top-0.5 hidden h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-0.5 text-[0.55rem] font-semibold text-primary-foreground",
                                    "group-data-[collapsible=icon]:flex",
                                  )}
                                  aria-hidden
                                >
                                  {unreadData > 9 ? "9+" : unreadData}
                                </span>
                              </span>
                            ) : showActiveOrders ? (
                              <span className="relative inline-flex shrink-0">
                                <Icon className="size-4" />
                                <span
                                  className={cn(
                                    "absolute -right-1 -top-0.5 hidden h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-0.5 text-[0.55rem] font-semibold text-primary-foreground",
                                    "group-data-[collapsible=icon]:flex",
                                  )}
                                  aria-hidden
                                >
                                  {activeOrderCount > 9 ? "9+" : activeOrderCount}
                                </span>
                              </span>
                            ) : (
                              <Icon className="size-4" />
                            )}
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                          {showUnread ? (
                            <SidebarMenuBadge
                              className="border-0 bg-primary text-[0.65rem] font-semibold text-primary-foreground"
                            >
                              {unreadData > 99 ? "99+" : unreadData}
                            </SidebarMenuBadge>
                          ) : showActiveOrders ? (
                            <SidebarMenuBadge className="border-0 bg-primary text-[0.65rem] font-semibold text-primary-foreground">
                              {formatTabBadge(activeOrderCount)}
                            </SidebarMenuBadge>
                          ) : null}
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </>
          ) : (
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => {
                    const active =
                      pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const Icon = item.icon;
                    const showUnread =
                      item.href === ROUTES.notifications &&
                      typeof unreadData === "number" &&
                      unreadData > 0;
                    const showActiveOrders =
                      activeOrderCount > 0 &&
                      ((variant === "customer" && item.href === ROUTES.customerOrders) ||
                        (variant === "vendor" && item.href === "/vendor/orders") ||
                        (variant === "rider" && item.href === "/rider/deliveries"));

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          render={<Link href={item.href} />}
                          isActive={active}
                          className="rounded-lg"
                        >
                          {showUnread ? (
                            <span className="relative inline-flex shrink-0">
                              <Icon className="size-4" />
                              <span
                                className={cn(
                                  "absolute -right-1 -top-0.5 hidden h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-0.5 text-[0.55rem] font-semibold text-primary-foreground",
                                  "group-data-[collapsible=icon]:flex",
                                )}
                                aria-hidden
                              >
                                {unreadData > 9 ? "9+" : unreadData}
                              </span>
                            </span>
                          ) : showActiveOrders ? (
                            <span className="relative inline-flex shrink-0">
                              <Icon className="size-4" />
                              <span
                                className={cn(
                                  "absolute -right-1 -top-0.5 hidden h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-0.5 text-[0.55rem] font-semibold text-primary-foreground",
                                  "group-data-[collapsible=icon]:flex",
                                )}
                                aria-hidden
                              >
                                {activeOrderCount > 9 ? "9+" : activeOrderCount}
                              </span>
                            </span>
                          ) : (
                            <Icon className="size-4" />
                          )}
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                        {showUnread ? (
                          <SidebarMenuBadge
                            className="border-0 bg-primary text-[0.65rem] font-semibold text-primary-foreground"
                          >
                            {unreadData > 99 ? "99+" : unreadData}
                          </SidebarMenuBadge>
                        ) : showActiveOrders ? (
                          <SidebarMenuBadge className="border-0 bg-primary text-[0.65rem] font-semibold text-primary-foreground">
                            {formatTabBadge(activeOrderCount)}
                          </SidebarMenuBadge>
                        ) : null}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>
        <SidebarFooter className="gap-2 p-4 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-2">
          <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
            <span className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">Theme</span>
            <ThemeToggle />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0"
            onClick={() => {
              void performLogout().then(() => {
                toast.success("Signed out");
                router.push("/");
              });
            }}
          >
            <LogOut className="size-4" />
            <span className="group-data-[collapsible=icon]:sr-only">Log out</span>
          </Button>
          <DashboardLegalLinks />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/60 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="min-w-0 flex-1 font-medium">{title}</span>
          <Link
            href={ROUTES.notifications}
            className="relative flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
            {typeof unreadData === "number" && unreadData > 0 ? (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.65rem] font-semibold text-primary-foreground">
                {unreadData > 99 ? "99+" : unreadData}
              </span>
            ) : null}
          </Link>
          {variant === "customer" && (
            <div className="flex shrink-0 items-center gap-2">
              <CustomerCartHeader />
            </div>
          )}
          {variant === "rider" && (
            <div className="flex shrink-0 items-center">
              <RiderAvailabilityToggle />
            </div>
          )}
        </header>
        <div className="flex flex-1 flex-col p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
