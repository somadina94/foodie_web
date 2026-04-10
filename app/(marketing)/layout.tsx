import type { Metadata } from "next";
import { MarketingFooter } from "@/components/molecules/marketing-footer";
import { PublicHeader } from "@/components/organisms/public-header";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Order fresh meals from Foodie — one kitchen, Stripe checkout, and live delivery tracking.",
  openGraph: {
    title: "Foodie — Fresh food delivery",
    description: "Order, pay, and track — one kitchen, zero hassle.",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <PublicHeader />
      <div className="flex flex-1 flex-col">{children}</div>
      <MarketingFooter />
    </div>
  );
}
