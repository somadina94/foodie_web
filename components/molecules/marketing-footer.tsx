import Link from "next/link";
import { MARKETING_LEGAL_LINKS } from "@/lib/marketing-legal-links";

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border/60 bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="space-y-1">
          <p className="font-heading text-sm font-semibold text-foreground">Foodie</p>
          <p className="text-sm text-muted-foreground">
            Fresh meals from one kitchen — order, pay, and track your delivery.
          </p>
          <p className="text-xs text-muted-foreground">© {year} Foodie. All rights reserved.</p>
        </div>
        <nav aria-label="Legal and company" className="flex flex-wrap gap-x-6 gap-y-2">
          {MARKETING_LEGAL_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
