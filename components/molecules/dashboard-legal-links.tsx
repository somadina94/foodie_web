"use client";

import Link from "next/link";
import { MARKETING_LEGAL_LINKS } from "@/lib/marketing-legal-links";

/** Small legal links in app sidebar footers (hidden when sidebar is icon-collapsed). */
export function DashboardLegalLinks() {
  return (
    <nav
      aria-label="Legal"
      className="flex flex-wrap justify-center gap-x-3 gap-y-1 border-t border-border/50 pt-3 text-[0.65rem] text-muted-foreground group-data-[collapsible=icon]:hidden"
    >
      {MARKETING_LEGAL_LINKS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="transition-colors hover:text-foreground"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
