"use client";

import Image from "next/image";
import Link from "next/link";
import { Apple, Play } from "lucide-react";
import heroImage from "@/assets/hero.jpg";
import { buttonVariants } from "@/components/ui/button";
import { dashboardPathForRole } from "@/lib/constants";
import { useAppSelector } from "@/lib/hooks";
import { cn } from "@/lib/utils";

function StoreBadge({
  href,
  icon: Icon,
  title,
  subtitle,
}: {
  href: string;
  icon: typeof Play;
  title: string;
  subtitle: string;
}) {
  return (
    <a
      href={href}
      onClick={(e) => {
        if (href === "#") e.preventDefault();
      }}
      className={cn(
        "group flex min-w-[200px] items-center gap-3 rounded-2xl border border-white/25 bg-background/85 px-4 py-3 shadow-lg backdrop-blur-md transition-all",
        "hover:border-primary/40 hover:bg-background/95 hover:shadow-xl",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
      )}
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-foreground/5 text-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
        <Icon className="size-6" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 text-left">
        <span className="block text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
          {subtitle}
        </span>
        <span className="font-heading text-sm font-semibold text-foreground">{title}</span>
      </span>
    </a>
  );
}

export function MarketingHero() {
  const { isAuthenticated, role } = useAppSelector((s) => s.auth);
  const dashboardHref =
    isAuthenticated && role ? dashboardPathForRole(role) : null;

  return (
    <section className="relative flex min-h-[calc(100svh-4rem)] items-center border-b border-border/60">
      <Image
        src={heroImage}
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
        placeholder="blur"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/15 via-transparent via-50% to-background/55"
        aria-hidden
      />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto] lg:gap-12 xl:gap-16">
          <div className="max-w-2xl space-y-6">
            <p className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              One kitchen · Fresh · Fast
            </p>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Crave-worthy meals,{" "}
              <span className="text-primary">delivered with care</span>.
            </h1>
            <p className="max-w-lg text-lg text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
              Order from our curated menu, pay securely with Stripe, and track your order status on
              the Orders page when your meal is on the way.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/menu"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "rounded-full px-8",
                )}
              >
                Browse menu
              </Link>
              {dashboardHref ? (
                <Link
                  href={dashboardHref}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "rounded-full bg-background/80 backdrop-blur-sm",
                  )}
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/signup"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "rounded-full bg-background/80 backdrop-blur-sm",
                  )}
                >
                  Create account
                </Link>
              )}
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-end lg:flex-col lg:items-end">
            <p className="sr-only">Mobile apps coming soon</p>
            <StoreBadge
              href="#"
              icon={Play}
              subtitle="Get it on"
              title="Google Play"
            />
            <StoreBadge
              href="#"
              icon={Apple}
              subtitle="Download on the"
              title="App Store"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
