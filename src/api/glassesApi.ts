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
};

export type GlassListResponse = {
  page: number;
  limit: number;
  total: number;
  items: Glass[];
};

export async function listGlassesApi(page = 1, limit = 20) {
  return apiRequest<GlassListResponse>(`/api/glasses?page=${page}&limit=${limit}`, "GET");
}

export async function getGlassApi(id: number) {
  return apiRequest<Glass>(`/api/glasses/${id}`, "GET");
}
