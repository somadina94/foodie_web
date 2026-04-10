"use client";

import { useParams } from "next/navigation";
import { VendorOrderDetail } from "@/components/organisms/vendor-order-detail";

export default function VendorOrderDetailPage() {
  const params = useParams();
  const orderId = typeof params.orderId === "string" ? params.orderId : "";

  if (!orderId) {
    return null;
  }

  return <VendorOrderDetail orderId={orderId} />;
}
