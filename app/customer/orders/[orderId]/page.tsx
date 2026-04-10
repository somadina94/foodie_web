"use client";

import { useParams } from "next/navigation";
import { CustomerOrderDetail } from "@/components/organisms/customer-order-detail";

export default function CustomerOrderDetailPage() {
  const params = useParams();
  const orderId = typeof params.orderId === "string" ? params.orderId : "";

  if (!orderId) {
    return null;
  }

  return <CustomerOrderDetail orderId={orderId} />;
}
