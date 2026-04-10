"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ApiError } from "@/services/apiClient";
import { userService } from "@/services/userService";

export function RiderAvailabilityToggle() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["rider", "availability"],
    queryFn: () => userService.getRiderAvailability(),
  });

  const mutation = useMutation({
    mutationFn: (available: boolean) => userService.setRiderAvailability(available),
    onSuccess: (res) => {
      const available = res.data.available;
      queryClient.setQueryData(["rider", "availability"], {
        status: "success",
        data: { available },
      });
      toast.success(available ? "You’re online for new deliveries" : "You’re offline");
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Could not update availability.";
      toast.error("Update failed", { description: msg });
    },
  });

  const available = query.data?.data.available ?? false;
  const busy = query.isPending || mutation.isPending;

  if (query.isPending) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-7 w-28 rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
          Dispatch
        </p>
        <p className="text-xs font-medium text-foreground">
          {available ? (
            <span className="text-emerald-600 dark:text-emerald-400">Available</span>
          ) : (
            <span className="text-muted-foreground">Unavailable</span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="rider-availability" className="sr-only">
          Available for delivery assignments
        </Label>
        <button
          id="rider-availability"
          type="button"
          role="switch"
          aria-checked={available}
          disabled={busy}
          onClick={() => mutation.mutate(!available)}
          className={cn(
            "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
            available
              ? "border-primary bg-primary"
              : "border-input bg-muted/80 dark:bg-input/40",
          )}
        >
          <span
            className={cn(
              "pointer-events-none block size-5 rounded-full bg-background shadow-sm ring-1 ring-border transition-transform",
              available ? "translate-x-6" : "translate-x-1",
            )}
          />
        </button>
        {busy && (
          <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden />
        )}
      </div>
    </div>
  );
}
