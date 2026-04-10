import { ApiClient } from "./apiClient";

export type OrderItem = {
  mealId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

export type OrderStatus =
  | "pending_payment"
  | "pending_kitchen"
  | "kitchen_assigned"
  | "preparing"
  | "pending_rider"
  | "rider_assigned"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type Order = {
  _id: string;
  customer: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
  /** Set after geocoding the address (for maps). */
  deliveryLat?: number | null;
  deliveryLng?: number | null;
  riderLat?: number | null;
  riderLng?: number | null;
  riderLocationUpdatedAt?: string | null;
  status: OrderStatus | string;
  paymentStatus: string;
  vendorUser?: string | null;
  riderUser?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

class OrderService extends ApiClient {
  async create(body: {
    items: { mealId: string; quantity: number }[];
    deliveryAddress: string;
    /** Card checkout via Stripe; omit for cash on delivery. */
    paymentMethod?: "stripe";
  }): Promise<{ status: string; data: { order: Order } }> {
    return this.request("/orders", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async createCheckoutSession(orderId: string): Promise<{
    status: string;
    data: { url: string; sessionId: string };
  }> {
    return this.request("/stripe/create-checkout-session", {
      method: "POST",
      body: JSON.stringify({ orderId }),
    });
  }

  async listMine(): Promise<{ status: string; results: number; data: { orders: Order[] } }> {
    return this.request("/orders/me", { method: "GET" });
  }

  async getById(orderId: string): Promise<{ status: string; data: { order: Order } }> {
    return this.request(`/orders/${orderId}`, { method: "GET" });
  }

  async listKitchen(): Promise<{ status: string; results: number; data: { orders: Order[] } }> {
    return this.request("/orders/kitchen", { method: "GET" });
  }

  async listDelivery(): Promise<{ status: string; results: number; data: { orders: Order[] } }> {
    return this.request("/orders/delivery", { method: "GET" });
  }

  async updateStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<{ status: string; data: { order: Order } }> {
    return this.request(`/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  async patchDeliveryLocation(
    orderId: string,
    lat: number,
    lng: number,
  ): Promise<{ status: string; data: { order: Order } }> {
    return this.request(`/orders/${orderId}/delivery-location`, {
      method: "PATCH",
      body: JSON.stringify({ lat, lng }),
    });
  }

  async patchRiderLocation(
    orderId: string,
    lat: number,
    lng: number,
  ): Promise<{ status: string; data: { order: Order } }> {
    return this.request(`/orders/${orderId}/rider-location`, {
      method: "PATCH",
      body: JSON.stringify({ lat, lng }),
    });
  }
}

export const orderService = new OrderService();
