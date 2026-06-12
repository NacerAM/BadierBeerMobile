import { apiRequest } from "./client";

export type ProposeGlassPayload = {
  name: string;
  description: string;
  manufacturerName: string;
  imageUrls: string[]; // pour l’instant on fait simple : URL
};

export type ProposeGlassResponse = {
  message?: string;
  glassId?: number;
  id?: number;
  status?: string;
};

export type MyProposal = {
  id: number;
  name: string;
  description?: string | null;
  status: "EN_ATTENTE" | "VALIDE" | "REJETE";
  rejectReason?: string | null;
  Manufacturer?: { id: number; name: string };
  beer?: { id: number; name: string } | null;
  images?: { id: number; url: string; isPrimary?: boolean }[];
  avgRating?: number | null;
  ratingsCount?: number;
  createdAt?: string;
};

export type MyProposalsResponse = {
  items: MyProposal[];
};

export async function proposeGlassApi(payload: ProposeGlassPayload) {
  return apiRequest<ProposeGlassResponse>("/api/glasses/propose", "POST", payload);
}

export async function listMyProposalsApi() {
  return apiRequest<MyProposalsResponse>("/api/my/proposals", "GET");
}

export async function updateMyProposalApi(id: number, payload: ProposeGlassPayload) {
  return apiRequest<MyProposal>(`/api/my/proposals/${id}`, "PATCH", payload);
}

export async function deleteMyProposalApi(id: number, password: string) {
  return apiRequest<{ message: string }>(`/api/my/proposals/${id}`, "DELETE", { password });
}
