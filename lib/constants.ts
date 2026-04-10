export const COOKIE_TOKEN = "foodie_token";
export const COOKIE_ROLE = "foodie_role";

export const ROUTES = {
  home: "/",
  menu: "/menu",
  about: "/about",
  features: "/features",
  terms: "/terms",
  privacy: "/privacy",
  login: "/login",
  signup: "/signup",
  customerDashboard: "/customer/dashboard",
  /** Orders list (customer) */
  customerOrders: "/customer/orders",
  adminDashboard: "/admin/dashboard",
  vendorDashboard: "/vendor/dashboard",
  riderDashboard: "/rider/dashboard",
  notifications: "/notifications",
} as const;

export type UserRole = "user" | "admin" | "vendor" | "rider";

export function dashboardPathForRole(role: string | undefined | null): string {
  switch (role) {
    case "admin":
      return ROUTES.adminDashboard;
    case "vendor":
      return ROUTES.vendorDashboard;
    case "rider":
      return ROUTES.riderDashboard;
    case "user":
    default:
      return ROUTES.customerDashboard;
  }
}
