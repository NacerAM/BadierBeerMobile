import { apiRequest } from "./client";
import type { Glass } from "./glassesApi";

export type PublicUser = { id: number; username: string; avatarUrl?: string | null; bio?: string | null; createdAt?: string };
export type MyStats = { totalPublications: number; averageRating: number | null; bestRating: number | null };

export async function getPublicUserApi(id: number) {
  return apiRequest<PublicUser>(`/api/users/${id}/public`, "GET");
}

export async function getMyStatsApi() {
  return apiRequest<MyStats>("/api/users/me/stats", "GET");
}

export async function listUserCollectionApi(id: number) {
  return apiRequest<{ items: { id: number; userId: number; glassId: number; createdAt: string; Glass: Glass }[] }>(`/api/users/${id}/collection`, "GET");
}
