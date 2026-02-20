import { apiRequest } from "./client";

export type ProposeGlassPayload = {
  name: string;
  description?: string;
  manufacturerName: string;
  imageUrls?: string[]; // pour l’instant on fait simple : URL
};

export type ProposeGlassResponse = {
  message?: string;
  glassId?: number;
  id?: number;
  status?: string;
};

export type MyProposalsResponse = {
  items: any[];
};

export async function proposeGlassApi(payload: ProposeGlassPayload) {
  return apiRequest<ProposeGlassResponse>("/api/glasses/propose", "POST", payload);
}

export async function listMyProposalsApi() {
  return apiRequest<MyProposalsResponse>("/api/my/proposals", "GET");
}