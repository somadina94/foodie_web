import type { UserRole } from "./constants";

export const ROLE_SELECT_OPTIONS: { value: UserRole; label: string; hint: string }[] = [
  { value: "user", label: "Customer", hint: "Browse menu and place orders" },
  { value: "vendor", label: "Vendor", hint: "Kitchen and order prep" },
  { value: "rider", label: "Rider", hint: "Pickup and delivery runs" },
  { value: "admin", label: "Admin", hint: "Users, analytics, operations" },
];
