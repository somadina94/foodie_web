/** Human-readable labels for order workflow statuses (charts, tables). */
export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending_payment: "Pending payment",
  pending_kitchen: "Pending kitchen",
  kitchen_assigned: "Kitchen assigned",
  preparing: "Preparing",
  pending_rider: "Pending rider",
  rider_assigned: "Rider assigned",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function formatOrderStatus(status: string): string {
  return ORDER_STATUS_LABEL[status] ?? status.replace(/_/g, " ");
}
