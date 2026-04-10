import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment received",
  description: "Your Foodie checkout completed.",
};

export default function CheckoutSuccessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
