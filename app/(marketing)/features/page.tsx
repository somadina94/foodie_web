import type { Metadata } from "next";
import Link from "next/link";
import {
  BarChart3,
  Bell,
  Bike,
  ChefHat,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  Shield,
  ShoppingCart,
  Sparkles,
  Store,
  Truck,
  Users,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Explore Foodie — ordering, Stripe checkout, kitchen & rider workflows, in-app notifications, admin tools, and more.",
  openGraph: {
    title: "Foodie — Features",
    description: "Everything your kitchen, riders, customers, and admins need in one platform.",
  },
};

type Feature = {
  title: string;
  description: string;
  icon: typeof ShoppingCart;
  accent: string;
};

const customerFeatures: Feature[] = [
  {
    title: "Curated menu & meal pages",
    description: "Photos, pricing, and descriptions for every dish — browse on the web or from your customer dashboard.",
    icon: UtensilsCrossed,
    accent: "from-sky-500/20 to-sky-500/5",
  },
  {
    title: "Cart & checkout",
    description: "Build your cart, then pay with Stripe or choose cash on delivery when you place your order.",
    icon: ShoppingCart,
    accent: "from-emerald-500/20 to-emerald-500/5",
  },
  {
    title: "Order tracking",
    description: "Follow status from kitchen prep to rider assignment and out for delivery until it arrives.",
    icon: Truck,
    accent: "from-violet-500/20 to-violet-500/5",
  },
  {
    title: "Notifications",
    description: "In-app inbox plus optional web push so you never miss an update on your order.",
    icon: Bell,
    accent: "from-amber-500/20 to-amber-500/5",
  },
  {
    title: "Order chat",
    description: "Message everyone on the order — customer, kitchen, and rider — in one thread.",
    icon: MessageCircle,
    accent: "from-rose-500/20 to-rose-500/5",
  },
  {
    title: "Delivery on the map",
    description: "See geocoded addresses and live rider location when your order is on the move.",
    icon: MapPin,
    accent: "from-cyan-500/20 to-cyan-500/5",
  },
];

const vendorFeatures: Feature[] = [
  {
    title: "Kitchen dashboard",
    description: "Overview charts for your pipeline — revenue trends, order volume, and status at a glance.",
    icon: LayoutDashboard,
    accent: "from-orange-500/20 to-orange-500/5",
  },
  {
    title: "Order queue",
    description: "See incoming orders, advance prep stages, and hand off to riders when food is ready.",
    icon: ChefHat,
    accent: "from-red-500/20 to-red-500/5",
  },
  {
    title: "Meal catalog",
    description: "Manage what appears on the menu so customers always see what you offer.",
    icon: Store,
    accent: "from-yellow-500/20 to-yellow-500/5",
  },
];

const riderFeatures: Feature[] = [
  {
    title: "Availability toggle",
    description: "Go available when you’re ready to be assigned — stay in control of your runs.",
    icon: Bike,
    accent: "from-lime-500/20 to-lime-500/5",
  },
  {
    title: "Deliveries board",
    description: "Assigned orders, status updates from picked up to delivered, and maps for each run.",
    icon: ClipboardList,
    accent: "from-teal-500/20 to-teal-500/5",
  },
];

const adminFeatures: Feature[] = [
  {
    title: "User directory & roles",
    description: "Search users and assign Customer, Vendor, Rider, or Admin — with safeguards for your own account.",
    icon: Users,
    accent: "from-indigo-500/20 to-indigo-500/5",
  },
  {
    title: "Platform analytics",
    description: "Orders by status, revenue from completed deliveries, signups by role, and daily order trends.",
    icon: BarChart3,
    accent: "from-fuchsia-500/20 to-fuchsia-500/5",
  },
  {
    title: "Operational oversight",
    description: "Full visibility across the marketplace from one admin workspace.",
    icon: Shield,
    accent: "from-purple-500/20 to-purple-500/5",
  },
];

function FeatureCard({ item }: { item: Feature }) {
  const Icon = item.icon;
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-gradient-to-br opacity-60 blur-2xl transition-opacity group-hover:opacity-100",
          item.accent,
        )}
      />
      <div className="relative">
        <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
          <Icon className="size-6" strokeWidth={1.75} />
        </div>
        <h3 className="font-heading text-lg font-semibold tracking-tight">{item.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
      <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      <p className="mt-4 text-lg text-muted-foreground">{description}</p>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-muted/40 via-background to-background">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.18),transparent)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="size-4" />
              Platform tour
            </div>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Built for{" "}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                every role
              </span>{" "}
              in your delivery stack
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              From first browse to admin analytics — Foodie connects diners, the kitchen, riders, and your team in one
              cohesive experience.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href={ROUTES.menu}
                className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8")}
              >
                Browse menu
              </Link>
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-full border-primary/30 bg-background/80 backdrop-blur-sm",
                )}
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="Customers"
          title="Order, pay, and stay in the loop"
          description="Everything a diner needs to go from craving to doorstep — without leaving the app."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {customerFeatures.map((item) => (
            <FeatureCard key={item.title} item={item} />
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-muted/25">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionHeading
            eyebrow="Kitchen"
            title="Run the line with clarity"
            description="Vendors see what’s cooking and what’s next — so handoffs stay smooth."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {vendorFeatures.map((item) => (
              <FeatureCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="Riders"
          title="On the road, on the map"
          description="Turn on availability, pick up assignments, and update delivery status in real time."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {riderFeatures.map((item) => (
            <FeatureCard key={item.title} item={item} />
          ))}
        </div>
      </section>

      <section className="border-t border-border/60 bg-gradient-to-br from-primary/5 via-background to-violet-500/5">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionHeading
            eyebrow="Admins"
            title="Operate the marketplace"
            description="Roles, users, and charts — keep the business aligned from one place."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {adminFeatures.map((item) => (
              <FeatureCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xl ring-1 ring-foreground/5">
          <div className="grid gap-8 p-8 sm:grid-cols-2 sm:gap-12 sm:p-12 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Wallet className="size-7" strokeWidth={1.5} />
              </div>
              <h2 className="mt-6 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                Payments that fit how you sell
              </h2>
              <p className="mt-3 text-muted-foreground">
                Stripe Checkout for card payments, with a cash-on-delivery path when you want flexibility at the door.
              </p>
            </div>
            <div className="flex flex-col gap-4 rounded-2xl bg-muted/40 p-6 ring-1 ring-border/60">
              <div className="flex gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-background shadow-sm">
                  <CreditCard className="size-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Secure card checkout</p>
                  <p className="text-sm text-muted-foreground">
                    Customers complete payment through Stripe when they choose card at checkout.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-background shadow-sm">
                  <Shield className="size-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Role-based access</p>
                  <p className="text-sm text-muted-foreground">
                    Dashboards and APIs respect customer, vendor, rider, and admin boundaries — including JWT-protected
                    routes on the web app.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">Ready to dig in?</h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Open the menu or create an account — your dashboard adapts to your role automatically.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={ROUTES.menu} className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8")}>
              View menu
            </Link>
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-full bg-background",
              )}
            >
              Get started
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
