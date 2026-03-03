import { apiRequest } from "./client";

export type Manufacturer = {
  id: number;
  name: string;
  country?: string | null;
};

export type GlassImage = {
  id: number;
  url: string;
  isPrimary: boolean;
};

export type Glass = {
  id: number;
  name: string;
  description?: string | null;
  status: "EN_ATTENTE" | "VALIDE" | "REJETE";
  Manufacturer?: Manufacturer;
  images?: GlassImage[];
  avgRating?: number | null;
  ratingsCount?: number;
};

export type GlassListResponse = {
  page: number;
  limit: number;
  total: number;
  items: Glass[];
};

export async function listGlassesApi(page = 1, limit = 20, sort?: "rating" | "recent") {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (sort === "rating") params.set("sort", "rating");
  return apiRequest<GlassListResponse>(`/api/glasses?${params.toString()}`, "GET");
}

export async function getGlassApi(id: number) {
  return apiRequest<Glass>(`/api/glasses/${id}`, "GET");
}

export async function rateGlassApi(id: number, rating: number) {
  return apiRequest<{ myRating: number; avgRating: number | null; ratingsCount: number }>(`/api/glasses/${id}/rating`, "PUT", { rating });
}
