import { apiRequest } from "./client";

export type LoginResponse = {
  token: string;
  user: { id: number; username: string; email: string; role: string; avatarUrl?: string | null; bio?: string | null };
};

export async function loginApi(email: string, password: string) {
  return apiRequest<LoginResponse>("/api/auth/login", "POST", { email, password });
}

export type RegisterResponse = {
  id: number;
  breweryId?: number | null;
  message: string;
  previewUrl?: string;
};

export async function registerApi(username: string, email: string, password: string) {
  return apiRequest<RegisterResponse>("/api/auth/register", "POST", { username, email, password });
}

export async function registerBrewerApi(payload: {
  username: string;
  email: string;
  password: string;
  breweryName: string;
  vatNumber: string;
  country?: string;
  city?: string;
  breweryDescription?: string;
  websiteUrl?: string;
}) {
  return apiRequest<RegisterResponse>("/api/auth/register-brewer", "POST", payload);
}

export async function resendVerificationApi(email: string) {
  return apiRequest<{ message: string; previewUrl?: string }>("/api/auth/resend-verification", "POST", { email });
}

export async function forgotPasswordApi(email: string) {
  return apiRequest<{ message: string; previewUrl?: string }>("/api/auth/forgot-password", "POST", { email });
}

export async function updateMeApi(payload: { username?: string; avatarUrl?: string | null; bio?: string | null }) {
  return apiRequest<{ id: number; username: string; email: string; role: string; avatarUrl?: string | null; bio?: string | null }>("/api/auth/me", "PATCH", payload);
}

export async function changePasswordApi(oldPassword: string, newPassword: string) {
  return apiRequest<{ message: string }>("/api/auth/change-password", "POST", { oldPassword, newPassword });
}
