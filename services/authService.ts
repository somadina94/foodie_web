import type { UserRole } from "@/lib/constants";
import { ApiClient } from "./apiClient";

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
};

export type LoginResponse = {
  status: string;
  token: string;
  data: { user: AuthUser };
};

export type SignUpBody = {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
};

class AuthService extends ApiClient {
  async login(email: string, password: string): Promise<LoginResponse> {
    return this.request<LoginResponse>("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async signUp(body: SignUpBody): Promise<LoginResponse> {
    return this.request<LoginResponse>("/users/signUp", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async getMe(token?: string): Promise<{ status: string; data: { user: AuthUser } }> {
    return this.request("/users/me", { method: "GET", token });
  }
}

export const authService = new AuthService();
