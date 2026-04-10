import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meals",
  description: "Create and manage menu items for your kitchen.",
};

export default function VendorMealsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
