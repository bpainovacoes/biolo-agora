/**
 * lib/queries.ts
 * Server-side data fetching functions.
 *
 * Each function uses Next.js fetch with `tags` so that when a Server Action
 * calls revalidateTag("tag"), the next render of any component that used that
 * tag will fetch fresh data from the backend automatically.
 *
 * These are called from Server Components (no useEffect, no loading spinners
 * for initial data — the page streams in with fresh data already rendered).
 */

import { api } from "./api";
import { getSession } from "./session";
import { TAGS } from "@/lib/cache-tags";
import type { User, ServiceRequest, ChatMessage, GeoLocation, ResposeData, ResposeDataHistory, ResponseProfessionals, ResponseProfiles } from "./bioloTypes";
import { mapWorkerToUI } from "./mapper/workerData";
import { mapClientToUI, type ClientProfile } from "./mapper/clientData";


// ─── Types (backend response shapes) ─────────────────────────────────────────

export interface ProfessionalsResponse {
  professionals: User[];
  total: number;
}

export interface AdminStats {
  totalClients: number;
  totalWorkers: number;
  totalServicesThisMonth: number;
  totalCommissionsKz: number;
  pendingVerifications: number;
}

// ─── Current user ─────────────────────────────────────────────────────────────

export async function getMe(): Promise<User> {
  const session = await getSession();




  if (session?.role === "client") {
    const { data } = await api.get<{ data: ClientProfile }>("/clients/me", {
      tags: [TAGS.me],
      revalidate: 60,
    });
    return mapClientToUI(data);
  }

  // worker (default) — also used by complete-profile and available pages
  const { data } = await api.get<ResposeData>("/workers/me", {
    tags: [TAGS.me],
    revalidate: 60,
  });
  return mapWorkerToUI(data);
}

// ─── Professionals ────────────────────────────────────────────────────────────

export async function getProfessionals(params?: {
  category?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  available?: boolean;
}): Promise<ProfessionalsResponse> {
  const qs = new URLSearchParams();
  if (params?.category) qs.set("category", params.category);
  if (params?.lat)       qs.set("lat", String(params.lat));
  if (params?.lng)       qs.set("lng", String(params.lng));
  if (params?.radius)    qs.set("radius", String(params.radius));
  if (params?.available) qs.set("available", "true");



  const query = qs.toString() ? `?${qs}` : "";
  const { data } = await api.get<ResponseProfessionals>(`/professionals${query}`, {
    tags: [TAGS.professionals],
    revalidate: 30, // near-realtime for availability
  });
  return { professionals: data.professionals, total: data.total };
}

export async function getProfessional(id: string): Promise<User> {
  const { data } = await  api.get<ResponseProfiles>(`/professionals/${id}`, {
    tags: [TAGS.professionals, `professional-${id}`],
    revalidate: 60,
  });
  
  return data
}

// ─── Service Requests ─────────────────────────────────────────────────────────

export async function getActiveRequest(): Promise<ServiceRequest | null> {
  try {
    return await api.get<ServiceRequest>("/service-requests/active", {
      tags: [TAGS.activeRequest],
      revalidate: 10, // poll every 10s for status changes
    });
  } catch (e) {
    if (e.status === 404) return null;
    throw e;
  }
}

export async function getServiceRequest(id: string): Promise<ServiceRequest> {
  return api.get<ServiceRequest>(`/service-requests/${id}`, {
    tags: [TAGS.serviceRequest(id)],
    revalidate: 10,
  });
}

export async function getWorkerHistory(): Promise<ServiceRequest[]> {
  const { data } = await  api.get<ResposeDataHistory>("/services/worker/history", {
    tags: [TAGS.workerHistory],
    revalidate: 60,
  });
  return data;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export async function getChatMessages(requestId: string): Promise<ChatMessage[]> {
  return api.get<ChatMessage[]>(`/service-requests/${requestId}/messages`, {
    tags: [TAGS.chatMessages(requestId)],
    revalidate: 5, // near-realtime chat
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function getAdminStats(): Promise<AdminStats> {
  return api.get<AdminStats>("/admin/stats", {
    tags: [TAGS.adminStats],
    revalidate: 30,
  });
}

export async function getAdminUsers(): Promise<User[]> {
  return api.get<User[]>("/admin/users", {
    tags: [TAGS.adminUsers],
    revalidate: 30,
  });
}
