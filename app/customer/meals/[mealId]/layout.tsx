import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meal",
};

export default function CustomerMealLayout({ children }: { children: React.ReactNode }) {
  return children;
}
