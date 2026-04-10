import { ApiClient } from "./apiClient";
import type { AuthUser } from "./authService";

type UpdatePasswordResponse = {
  status: string;
  message?: string;
  token: string;
  data: { user: AuthUser };
};

class UserService extends ApiClient {
  async updateMe(
    body: Partial<
      Pick<AuthUser, "name" | "email" | "phone" | "address" | "city" | "state" | "zip">
    >,
  ): Promise<{ status: string; data: { user: AuthUser } }> {
    return this.request("/users/updateMe", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  async updatePassword(body: {
    passwordCurrent: string;
    password: string;
    passwordConfirm: string;
  }): Promise<UpdatePasswordResponse> {
    return this.request("/users/updatePassword", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  async deleteMe(): Promise<{ status: string; message?: string }> {
    return this.request("/users/me", { method: "DELETE" });
  }

  async setExpoPushToken(expoPushToken: string): Promise<void> {
    await this.request("/users/expoPushToken", {
      method: "PATCH",
      body: JSON.stringify({ expoPushToken }),
    });
  }

  async setWebPushToken(webPushToken: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  }): Promise<void> {
    await this.request("/users/webPushToken", {
      method: "PATCH",
      body: JSON.stringify({ webPushToken }),
    });
  }

  async getRiderAvailability(): Promise<{ status: string; data: { available: boolean } }> {
    return this.request("/users/rider/availability", { method: "GET" });
  }

  async setRiderAvailability(available: boolean): Promise<{ status: string; data: { available: boolean } }> {
    return this.request("/users/rider/availability", {
      method: "PATCH",
      body: JSON.stringify({ available }),
    });
  }
}

export const userService = new UserService();
