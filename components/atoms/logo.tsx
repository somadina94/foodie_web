import Link from "next/link";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`font-heading text-xl font-bold tracking-tight text-primary ${className ?? ""}`}
    >
      Foodie
    </Link>
  );
}
