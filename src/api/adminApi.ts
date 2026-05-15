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
  Manufacturer?: { id: number; name: string };
};

export async function listAdminAccountsApi(status?: string) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiRequest<{ items: AdminAccount[] }>(`/api/admin/accounts${query}`, "GET");
}

export async function reviewAdminAccountApi(id: number, payload: { action: "validate" | "suspend"; reason?: string }) {
  return apiRequest<AdminAccount>(`/api/admin/accounts/${id}/review`, "PATCH", payload);
}

export async function listPendingAdminGlassesApi() {
  return apiRequest<{ items: AdminPendingGlass[] }>("/api/admin/pending/glasses", "GET");
}

export async function reviewAdminGlassApi(id: number, payload: { action: "validate" | "reject"; rejectReason?: string }) {
  return apiRequest<AdminPendingGlass>(`/api/admin/glasses/${id}/review`, "PATCH", payload);
}

export async function listPendingAdminPostsApi() {
  return apiRequest<{ items: AdminPendingEvent[] }>("/api/admin/pending/posts", "GET");
}

export async function reviewAdminPostApi(id: number, payload: { action: "validate" | "reject"; rejectReason?: string }) {
  return apiRequest<AdminPendingEvent>(`/api/admin/posts/${id}/review`, "PATCH", payload);
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
