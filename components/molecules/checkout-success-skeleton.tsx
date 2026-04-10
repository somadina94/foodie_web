import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CheckoutSuccessSkeleton() {
  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div className="flex flex-col items-center gap-4 sm:items-start">
        <Skeleton className="size-14 shrink-0 rounded-full" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-4 w-3/4 max-w-sm" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}
