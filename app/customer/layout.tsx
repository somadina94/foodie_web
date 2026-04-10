import { DashboardShell } from "@/components/organisms/dashboard-shell";
import { CustomerStripeSuccessHandler } from "@/components/providers/customer-stripe-success";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell variant="customer">
      <CustomerStripeSuccessHandler />
      {children}
    </DashboardShell>
  );
}
