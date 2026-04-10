import { ApiClient } from "./apiClient";

export type Meal = {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
};

class MealService extends ApiClient {
  async list(): Promise<{ status: string; results: number; data: { meals: Meal[] } }> {
    return this.request("/meals", { method: "GET" });
  }

  async getById(id: string): Promise<{ status: string; data: { meal: Meal } }> {
    return this.request(`/meals/${id}`, { method: "GET" });
  }

  /** Authenticated vendor (or admin): all meals you created, including unavailable. */
  async listMine(): Promise<{ status: string; results: number; data: { meals: Meal[] } }> {
    return this.request("/meals/vendor/mine", { method: "GET" });
  }

  async create(form: FormData): Promise<{ status: string; data: { meal: Meal } }> {
    return this.request("/meals", { method: "POST", body: form });
  }

  async update(id: string, form: FormData): Promise<{ status: string; data: { meal: Meal } }> {
    return this.request(`/meals/${id}`, { method: "PATCH", body: form });
  }

  async delete(id: string): Promise<void> {
    await this.request(`/meals/${id}`, { method: "DELETE" });
  }
}

export const mealService = new MealService();
