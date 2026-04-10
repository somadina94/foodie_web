"use client";

import Link from "next/link";
import { useAppSelector } from "@/lib/hooks";
import { Logo } from "@/components/atoms/logo";
import { ThemeToggle } from "@/components/molecules/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { dashboardPathForRole, ROUTES } from "@/lib/constants";

const links = [
  { href: ROUTES.menu, label: "Menu" },
  { href: ROUTES.features, label: "Features" },
  { href: "/#meals", label: "Meals" },
  { href: "/#how-it-works", label: "How it works" },
  { href: ROUTES.about, label: "About us" },
];

export function PublicHeader() {
  const { isAuthenticated, role } = useAppSelector((s) => s.auth);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated && role ? (
            <Link
              href={dashboardPathForRole(role)}
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "rounded-full",
              )}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "rounded-full",
                )}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "rounded-full",
                )}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
