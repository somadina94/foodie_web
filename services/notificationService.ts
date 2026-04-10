import { ApiClient } from "./apiClient";

export type AppNotification = {
  _id: string;
  title: string;
  body: string;
  orderId: string | null;
  type: string;
  readAt: string | null;
  createdAt?: string;
  updatedAt?: string;
};

class NotificationService extends ApiClient {
  async list(): Promise<{
    status: string;
    results: number;
    data: { notifications: AppNotification[]; unreadCount: number };
  }> {
    return this.request("/notifications", { method: "GET" });
  }

  async getById(id: string): Promise<{ status: string; data: { notification: AppNotification } }> {
    return this.request(`/notifications/${id}`, { method: "GET" });
  }

  async markRead(id: string): Promise<{ status: string }> {
    return this.request(`/notifications/${id}/read`, { method: "PATCH" });
  }

  async markAllRead(): Promise<{ status: string; data: { modifiedCount: number } }> {
    return this.request("/notifications/read-all", { method: "PATCH" });
  }
}

export const notificationService = new NotificationService();
