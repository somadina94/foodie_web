import type { UserRole } from "@/lib/constants";
import { ApiClient } from "./apiClient";
import type { AuthUser } from "./authService";

export type AdminDashboardData = {
  totalOrders: number;
  revenueDelivered: number;
  ordersByStatus: Record<string, number>;
  usersByRole: Record<string, number>;
  dailyOrders: { date: string; orders: number }[];
};

/** User document fields returned from admin list (no password). */
export type AdminListedUser = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  city?: string;
  state?: string;
  createdAt?: string;
};

class AdminService extends ApiClient {
  async getDashboard(): Promise<{ status: string; data: AdminDashboardData }> {
    return this.request("/admin/dashboard", { method: "GET" });
  }

  async getAllUsers(): Promise<{ status: string; data: { users: AdminListedUser[] } }> {
    return this.request("/users/getAllUsers", { method: "GET" });
  }

  async updateUserRole(
    userId: string,
    role: UserRole,
  ): Promise<{ status: string; data: { user: AuthUser } }> {
    return this.request(`/users/role/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  }
}

export const adminService = new AdminService();
