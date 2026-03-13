import { apiRequest } from "./client";
import type { Glass } from "./glassesApi";

export type PublicUser = { id: number; username: string; avatarUrl?: string | null; bio?: string | null; createdAt?: string };

export async function getPublicUserApi(id: number) {
  return apiRequest<PublicUser>(`/api/users/${id}/public`, 'GET');
}

export async function listUserCollectionApi(id: number) {
  return apiRequest<{ items: { id: number; userId: number; glassId: number; createdAt: string; Glass: Glass }[] }>(`/api/users/${id}/collection`, 'GET');
}

