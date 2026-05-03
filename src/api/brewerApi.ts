import { apiRequest } from "./client";

export type BrewerySummary = {
  id: number;
  name: string;
  country?: string | null;
  city?: string | null;
  websiteUrl?: string | null;
  description?: string | null;
};

export type BreweryProduct = {
  id: number;
  name: string;
  description?: string | null;
  price?: string | number | null;
  currency: string;
  imageUrl?: string | null;
  isAvailable: boolean;
  status: "EN_ATTENTE" | "VALIDE" | "REJETE";
  rejectReason?: string | null;
  createdAt?: string;
};

export type BreweryPost = {
  id: number;
  title: string;
  content: string;
  imageUrl?: string | null;
  publishedAt?: string | null;
  status: "EN_ATTENTE" | "VALIDE" | "REJETE";
  rejectReason?: string | null;
  createdAt?: string;
};

export async function getMyBreweryApi() {
  return apiRequest<BrewerySummary>("/api/brewer/brewery", "GET");
}

export async function listMyBreweryProductsApi() {
  return apiRequest<{ items: BreweryProduct[] }>("/api/brewer/products", "GET");
}

export async function createBreweryProductApi(payload: {
  name: string;
  description?: string | null;
  price?: number | null;
  currency?: string;
  imageUrl?: string | null;
  isAvailable?: boolean;
}) {
  return apiRequest<BreweryProduct>("/api/brewer/products", "POST", payload);
}

export async function listMyBreweryPostsApi() {
  return apiRequest<{ items: BreweryPost[] }>("/api/brewer/posts", "GET");
}

export async function createBreweryPostApi(payload: {
  title: string;
  content: string;
  imageUrl?: string | null;
  publishedAt?: string;
}) {
  return apiRequest<BreweryPost>("/api/brewer/posts", "POST", payload);
}
