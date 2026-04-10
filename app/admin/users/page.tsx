import type { Metadata } from "next";
import { AdminUsersPanel } from "@/components/organisms/admin-users-panel";

export const metadata: Metadata = {
  title: "Users",
  description: "Manage Foodie users and roles.",
};

export default function AdminUsersPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Users & roles</h1>
        <p className="max-w-2xl text-pretty text-muted-foreground">
          Search the directory and assign roles to route users to the right dashboard. Changes apply immediately.
        </p>
      </div>
      <AdminUsersPanel />
    </div>
  );
}
