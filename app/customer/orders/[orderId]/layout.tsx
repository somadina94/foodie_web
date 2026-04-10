import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order details",
  description: "View your Foodie order and delivery tracking.",
};

export default function CustomerOrderDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
