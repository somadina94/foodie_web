import type { Metadata } from "next";
import NotificationsClientLayout from "./client-layout";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Order updates and alerts",
};

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NotificationsClientLayout>{children}</NotificationsClientLayout>;
}
