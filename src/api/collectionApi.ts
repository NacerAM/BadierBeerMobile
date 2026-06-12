import { apiRequest } from "./client";
import { Glass } from "./glassesApi";

export type CollectionListResponse = {
  items: Array<{
    id: number;
    userId: number;
    glassId: number;
    createdAt: string;
    Glass: Glass;
  }>;
};

export async function addToCollectionApi(glassId: number) {
  return apiRequest<{ message: string }>(`/api/collection/${glassId}`, "POST");
}

export async function removeFromCollectionApi(glassId: number) {
  return apiRequest<{ message: string }>(`/api/collection/${glassId}`, "DELETE");
}

export async function listMyCollectionApi() {
  return apiRequest<CollectionListResponse>(`/api/collection`, "GET");
}
