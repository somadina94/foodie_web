import Link from "next/link";
import { MARKETING_LEGAL_LINKS } from "@/lib/marketing-legal-links";

/** Compact legal links for auth and other minimal layouts. */
export function AuthLegalLinks() {
  return (
    <nav
      aria-label="Legal"
      className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground"
    >
      {MARKETING_LEGAL_LINKS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="underline-offset-4 hover:text-foreground hover:underline"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
