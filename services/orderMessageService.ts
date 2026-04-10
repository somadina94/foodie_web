import { ApiClient } from "./apiClient";

export type OrderChatMessage = {
  _id: string;
  order: string;
  text: string;
  createdAt: string;
  sender: { _id: string; name: string; role: string };
  deliveredTo: string[];
  readBy: string[];
};

class OrderMessageService extends ApiClient {
  async list(orderId: string): Promise<{ status: string; data: { messages: OrderChatMessage[] } }> {
    return this.request(`/orders/${orderId}/messages`, { method: "GET" });
  }

  async send(
    orderId: string,
    text: string,
  ): Promise<{ status: string; data: { message: OrderChatMessage } }> {
    return this.request(`/orders/${orderId}/messages`, {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  }
}

export const orderMessageService = new OrderMessageService();
