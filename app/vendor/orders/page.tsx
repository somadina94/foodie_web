import type { Metadata } from "next";
import { VendorOrdersList } from "@/components/organisms/vendor-orders-list";

export const metadata: Metadata = {
  title: "Kitchen orders",
  description: "Orders assigned to your restaurant — prepare and hand off to riders.",
};

export default function VendorOrdersPage() {
  return <VendorOrdersList />;
}
