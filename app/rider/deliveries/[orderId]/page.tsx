"use client";

import { useParams } from "next/navigation";
import { RiderOrderDetail } from "@/components/organisms/rider-order-detail";

export default function RiderOrderDetailPage() {
  const params = useParams();
  const orderId = typeof params.orderId === "string" ? params.orderId : "";

  if (!orderId) {
    return null;
  }

  return <RiderOrderDetail orderId={orderId} />;
}
