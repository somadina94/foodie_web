import type { Metadata } from "next";
import { RiderOverviewSection } from "@/components/dashboard/overview-sections";

export const metadata: Metadata = {
  title: "Rider",
  description: "Dispatcher dashboard — deliveries and map.",
};

export default function RiderDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">On the road</h1>
        <p className="mt-1 max-w-xl text-muted-foreground">
          Use the <span className="font-medium text-foreground">Available</span> switch in the top bar so you can be
          assigned deliveries. Charts below summarize your assigned runs; open Deliveries for maps and status.
        </p>
      </div>
      <RiderOverviewSection />
    </div>
  );
}
