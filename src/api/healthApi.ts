import { apiRequest } from "./client";

export async function healthApi() {
  return apiRequest<{ ok: boolean }>("/health", "GET");
}
