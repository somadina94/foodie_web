import { DashboardShell } from "@/components/organisms/dashboard-shell";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell variant="vendor">{children}</DashboardShell>;
}
