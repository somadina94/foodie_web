import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders",
  description: "Your Foodie order history and delivery status.",
};

export default function CustomerOrdersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
