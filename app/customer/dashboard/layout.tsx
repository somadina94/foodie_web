import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your overview, browse meals, build your cart, and checkout.",
};

export default function CustomerDashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
