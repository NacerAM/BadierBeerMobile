import { apiRequest } from "./client";
import { API_BASE_URL } from "../config/api";

export type PublicManufacturer = {
  id: number;
  name: string;
  ownerUserId?: number;
  country?: string | null;
  city?: string | null;
  websiteUrl?: string | null;
};

export type PublicBreweryProduct = {
  id: number;
  name: string;
  description?: string | null;
  price?: string | number | null;
  currency: string;
  imageUrl?: string | null;
  isAvailable: boolean;
  Manufacturer?: PublicManufacturer;
  createdAt?: string;
};

export type ParticipationStatus = "EN_ATTENTE" | "VALIDE" | "REJETE";

export type PublicBreweryEvent = {
  id: number;
  title: string;
  content: string;
  imageUrl?: string | null;
  publishedAt?: string | null;
  startAt?: string | null;
  endAt?: string | null;
  address?: string | null;
  registrationDeadline?: string | null;
  participantsCount?: number;
  registrationClosed?: boolean;
  myParticipationStatus?: ParticipationStatus | null;
  myParticipationRejectReason?: string | null;
  Manufacturer?: PublicManufacturer;
  createdAt?: string;
};

export async function listPublicProductsApi() {
  return apiRequest<{ items: PublicBreweryProduct[] }>("/api/breweries/products", "GET");
}

export async function listUpcomingEventsApi() {
  return apiRequest<{ items: PublicBreweryEvent[] }>("/api/breweries/events", "GET");
}

export async function getPublicEventApi(eventId: number) {
  return apiRequest<PublicBreweryEvent>(`/api/breweries/events/${eventId}`, "GET");
}

export async function participateInEventApi(eventId: number) {
  return apiRequest<{ status: ParticipationStatus }>(`/api/breweries/events/${eventId}/participate`, "POST");
}

export async function listMyValidatedEventsApi() {
  return apiRequest<{ items: PublicBreweryEvent[] }>("/api/breweries/events/me/validated", "GET");
}

export function buildMyEventInvitationPdfUrl(eventId: number, token: string) {
  return `${API_BASE_URL}/api/breweries/events/${eventId}/invitation?token=${encodeURIComponent(token)}`;
}
