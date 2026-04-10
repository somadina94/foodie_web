import { CheckCircle2 } from "lucide-react";

export function CheckoutSuccessHero({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
      <div className="mb-4 flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CheckCircle2 className="size-8" strokeWidth={1.75} aria-hidden />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 max-w-lg text-muted-foreground">{description}</p>
    </div>
  );
}
