import { DashboardShell } from "@/components/organisms/dashboard-shell";

export default function RiderLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell variant="rider">{children}</DashboardShell>;
}
