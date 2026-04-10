import type { Metadata } from "next";
import Link from "next/link";
import { AdminOverviewSection } from "@/components/dashboard/overview-sections";

export const metadata: Metadata = {
  title: "Admin",
  description: "Foodie admin — roles, users, and operations.",
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin overview</h1>
        <p className="mt-1 max-w-xl text-muted-foreground">
          Platform-wide orders, revenue, and user mix. Manage roles on the{" "}
          <Link href="/admin/users" className="font-medium text-primary underline-offset-4 hover:underline">
            Users
          </Link>{" "}
          page.
        </p>
      </div>
      <AdminOverviewSection />
    </div>
  );
}
