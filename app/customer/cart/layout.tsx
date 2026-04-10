import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your cart and checkout.",
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
