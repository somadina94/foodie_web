import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your profile, password, and account.",
};

export default function CustomerSettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
