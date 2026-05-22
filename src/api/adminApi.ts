import { apiRequest } from "./client";

export type AdminAccount = {
  id: number;
  username: string;
  email: string;
  role: "USER" | "BREWER";
  status: "PENDING_EMAIL" | "PENDING_APPROVAL" | "ACTIVE" | "SUSPENDED";
  statusReason?: string | null;
  emailVerifiedAt?: string | null;
  createdAt?: string;
  brewery?: {
    id: number;
    name: string;
    vatNumber?: string | null;
    country?: string | null;
    city?: string | null;
    websiteUrl?: string | null;
  } | null;
};

export type AdminPendingGlass = {
  id: number;
  name: string;
  description?: string | null;
  status: "EN_ATTENTE" | "VALIDE" | "REJETE";
  rejectReason?: string | null;
  createdAt?: string;
  Manufacturer?: { id: number; name: string };
  beer?: { id: number; name: string } | null;
  createdBy?: { id: number; username: string; email: string; role: string };
  images?: { id: number; url: string; isPrimary?: boolean }[];
};

export type AdminProduct = {
  id: number;
  name: string;
  description?: string | null;
  price?: number | null;
  currency?: string | null;
  imageUrl?: string | null;
  isAvailable: boolean;
  status: "EN_ATTENTE" | "VALIDE" | "REJETE";
  rejectReason?: string | null;
  createdAt?: string;
  Manufacturer?: { id: number; name: string };
};

export type AdminPendingEvent = {
  id: number;
  title: string;
  content: string;
  address?: string | null;
  imageUrl?: string | null;
  startAt?: string | null;
  endAt?: string | null;
  registrationDeadline?: string | null;
  status: "EN_ATTENTE" | "VALIDE" | "REJETE";
  rejectReason?: string | null;
  createdAt?: string;
  isCancelled?: boolean;
  cancellationReason?: string | null;
  cancelledAt?: string | null;
  Manufacturer?: { id: number; name: string };
};

export type AdminDurationMetrics = {
  avgSeconds: number | null;
};

export type AdminActiveProfile = {
  id: number;
  username: string;
  role: "USER" | "BREWER" | "ADMIN";
  avatarUrl?: string | null;
  proposalsCount: number;
  collectionCount: number;
  ratingsCount: number;
  messagesCount: number;
  participationsCount: number;
  activityScore: number;
};

export type AdminTopPublication = {
  id: number;
  name: string;
  creatorUsername: string;
  manufacturerName?: string | null;
  avgRating: number;
  ratingsCount: number;
};

export type AdminTopEvent = {
  id: number;
  title: string;
  startAt?: string | null;
  breweryName?: string | null;
  participantsCount: number;
};

export type AdminStatsResponse = {
  responseMetrics: AdminDurationMetrics;
  processingMetrics: AdminDurationMetrics;
  activeProfiles: AdminActiveProfile[];
  topRatedPublications: AdminTopPublication[];
  topEvents: AdminTopEvent[];
};

export async function listAdminAccountsApi(status?: string) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiRequest<{ items: AdminAccount[] }>(`/api/admin/accounts${query}`, "GET");
}

export async function reviewAdminAccountApi(id: number, payload: { action: "validate" | "suspend"; reason?: string }) {
  return apiRequest<AdminAccount>(`/api/admin/accounts/${id}/review`, "PATCH", payload);
}

export async function listAdminGlassesApi(status?: string) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiRequest<{ items: AdminPendingGlass[] }>(`/api/admin/glasses${query}`, "GET");
}

export async function listPendingAdminGlassesApi() {
  return apiRequest<{ items: AdminPendingGlass[] }>("/api/admin/pending/glasses", "GET");
}

export async function reviewAdminGlassApi(id: number, payload: { action: "validate" | "reject"; rejectReason?: string }) {
  return apiRequest<AdminPendingGlass>(`/api/admin/glasses/${id}/review`, "PATCH", payload);
}

export async function updateAdminGlassApi(id: number, payload: { name: string; description?: string | null }) {
  return apiRequest<AdminPendingGlass>(`/api/admin/glasses/${id}`, "PATCH", payload);
}

export async function deleteAdminGlassApi(id: number) {
  return apiRequest<{ success: boolean }>(`/api/admin/glasses/${id}`, "DELETE");
}

export async function listAdminProductsApi(status?: string) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiRequest<{ items: AdminProduct[] }>(`/api/admin/products${query}`, "GET");
}

export async function reviewAdminProductApi(id: number, payload: { action: "validate" | "reject"; rejectReason?: string }) {
  return apiRequest<AdminProduct>(`/api/admin/products/${id}/review`, "PATCH", payload);
}

export async function updateAdminProductApi(id: number, payload: {
  name: string;
  description?: string | null;
  price?: number | null;
  imageUrl?: string | null;
  isAvailable?: boolean;
}) {
  return apiRequest<AdminProduct>(`/api/admin/products/${id}`, "PATCH", payload);
}

export async function deleteAdminProductApi(id: number) {
  return apiRequest<{ success: boolean }>(`/api/admin/products/${id}`, "DELETE");
}

export async function listAdminPostsApi(status?: string) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiRequest<{ items: AdminPendingEvent[] }>(`/api/admin/posts${query}`, "GET");
}

export async function listPendingAdminPostsApi() {
  return apiRequest<{ items: AdminPendingEvent[] }>("/api/admin/pending/posts", "GET");
}

export async function reviewAdminPostApi(id: number, payload: { action: "validate" | "reject"; rejectReason?: string }) {
  return apiRequest<AdminPendingEvent>(`/api/admin/posts/${id}/review`, "PATCH", payload);
}

export async function updateAdminPostApi(id: number, payload: {
  title: string;
  content: string;
  address: string;
  startAt: string;
  endAt: string;
  registrationDeadline: string;
  imageUrl?: string | null;
}) {
  return apiRequest<AdminPendingEvent>(`/api/admin/posts/${id}`, "PATCH", payload);
}

export async function cancelAdminPostApi(id: number, payload?: { reason?: string }) {
  return apiRequest<AdminPendingEvent>(`/api/admin/posts/${id}/cancel`, "PATCH", payload || {});
}

export async function deleteAdminPostApi(id: number) {
  return apiRequest<{ success: boolean }>(`/api/admin/posts/${id}`, "DELETE");
}

export async function createAdminPostApi(payload: {
  title: string;
  content: string;
  address: string;
  startAt: string;
  endAt: string;
  registrationDeadline: string;
  imageUrl?: string;
}) {
  return apiRequest<AdminPendingEvent>("/api/admin/posts", "POST", payload);
}

export async function getAdminStatsApi() {
  return apiRequest<AdminStatsResponse>("/api/admin/stats", "GET");
}
