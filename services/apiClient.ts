import Cookies from "js-cookie";
import { COOKIE_TOKEN } from "@/lib/constants";

const base = () =>
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4800/api/v1";

export type ApiErrorBody = {
  status?: string;
  message?: string;
};

export class ApiError extends Error {
  statusCode: number;
  body?: ApiErrorBody;

  constructor(message: string, statusCode: number, body?: ApiErrorBody) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.body = body;
  }
}

function readTokenFromCookie(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return Cookies.get(COOKIE_TOKEN);
}

export class ApiClient {
  protected async request<T>(
    path: string,
    init: RequestInit & { token?: string } = {},
  ): Promise<T> {
    const url = `${base()}${path.startsWith("/") ? path : `/${path}`}`;
    const headers = new Headers(init.headers);
    if (!headers.has("Content-Type") && init.body && typeof init.body === "string") {
      headers.set("Content-Type", "application/json");
    }
    const token = init.token ?? readTokenFromCookie();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const res = await fetch(url, { ...init, headers });
    const text = await res.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      const body = data as ApiErrorBody | undefined;
      const msg =
        body && typeof body === "object" && "message" in body
          ? String((body as ApiErrorBody).message)
          : res.statusText;
      throw new ApiError(msg, res.status, body);
    }

    return data as T;
  }
}
