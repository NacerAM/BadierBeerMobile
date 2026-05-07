import { apiRequest } from "./client";
import { API_BASE_URL } from "../config/api";

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
  startAt?: string | null;
  endAt?: string | null;
  address?: string | null;
  registrationDeadline?: string | null;
  status: "EN_ATTENTE" | "VALIDE" | "REJETE";
  rejectReason?: string | null;
  createdAt?: string;
};

export type BreweryEventParticipant = {
  id: number;
  status: "VALIDE";
  createdAt?: string;
  participant?: {
    id: number;
    username: string;
    email: string;
  } | null;
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

export async function listBreweryPostParticipantsApi(postId: number) {
  return apiRequest<{
    event: { id: number; title: string; registrationDeadline?: string | null; status: string };
    items: BreweryEventParticipant[];
  }>(`/api/brewer/posts/${postId}/participants`, "GET");
}

export async function createBreweryPostApi(payload: {
  title: string;
  content: string;
  imageUrl?: string | null;
  publishedAt?: string;
  startAt: string;
  endAt: string;
  address: string;
  registrationDeadline: string;
}) {
  return apiRequest<BreweryPost>("/api/brewer/posts", "POST", payload);
}

export function buildBreweryEventParticipantsPdfUrl(postId: number, token: string) {
  return `${API_BASE_URL}/api/brewer/posts/${postId}/participants/export?token=${encodeURIComponent(token)}`;
}
