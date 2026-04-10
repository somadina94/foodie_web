import type { Metadata } from "next";
import { VendorOverviewSection } from "@/components/dashboard/overview-sections";

export const metadata: Metadata = {
  title: "Kitchen",
  description: "Vendor dashboard — incoming orders and prep status.",
};

export default function VendorDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Kitchen overview</h1>
        <p className="mt-1 max-w-xl text-muted-foreground">
          Order volume, revenue trend, and pipeline for your kitchen. Live queue and status updates are on Orders.
        </p>
      </div>
      <VendorOverviewSection />
    </div>
  );
}
