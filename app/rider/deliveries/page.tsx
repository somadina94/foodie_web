import type { Metadata } from "next";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RiderDeliveriesList } from "@/components/organisms/rider-deliveries-list";

export const metadata: Metadata = {
  title: "Deliveries",
  description: "Your assigned delivery runs.",
};

export default function RiderDeliveriesPage() {
  return (
    <div className="space-y-8">
      <RiderDeliveriesList />
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Live map & route</CardTitle>
          <CardDescription>
            Open a delivery to see your position, the customer&apos;s address on the map, the road
            route, and distance. Location is shared automatically while the order is assigned or out
            for delivery.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
