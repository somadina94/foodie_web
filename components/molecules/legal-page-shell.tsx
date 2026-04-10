import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

export function LegalPageShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href={ROUTES.home}
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "-ml-2 mb-8 inline-flex gap-1.5 rounded-full",
        )}
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to home
      </Link>
      <article>
        <header className="space-y-2 border-b border-border/60 pb-6">
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </header>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:first:mt-0 [&_strong]:font-medium [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_a]:font-medium [&_a]:text-primary [&_a]:underline-offset-4 hover:[&_a]:underline">
          {children}
        </div>
      </article>
    </div>
  );
}
