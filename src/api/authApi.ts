import { apiRequest } from "./client";

export type LoginResponse = {
  token: string;
  user: { id: number; username: string; email: string; role: string };
};

export async function loginApi(email: string, password: string) {
  return apiRequest<LoginResponse>("/api/auth/login", "POST", { email, password });
}
