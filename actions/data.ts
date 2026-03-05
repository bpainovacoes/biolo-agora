"use server";
/**
 * actions/data.ts
 * Server Actions for all data mutations.
 *
 * Pattern:
 *   1. Call the backend API
 *   2. Call revalidateTag("tag-name") to bust the Next.js cache
 *   3. Every Server Component that fetches with that tag auto-refreshes
 *
 * This replaces react-query's invalidateQueries() — but entirely server-side,
 * with zero client JavaScript for the update cycle.
 */

import { revalidateTag } from "next/cache";
import { api } from "@/lib/api";
import type { GeoLocation, ServiceProgress, ChatMessage, User } from "@/lib/bioloTypes";
import type { ActionResult } from "./auth";

import { TAGS } from "@/lib/cache-tags";
export { TAGS };

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function updateProfileAction(
  data: Partial<Pick<User, "name" | "phone" | "bio" | "pricePerHour" | "skills" | "profession">>
): Promise<ActionResult> {
  try {
    await api.patch("/me/profile", data);
    revalidateTag(TAGS.me);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function updateLocationAction(
  location: GeoLocation
): Promise<ActionResult> {
  try {
    await api.patch("/me/location", location);
    revalidateTag(TAGS.me);
    revalidateTag(TAGS.professionals);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function setAvailabilityAction(
  available: boolean
): Promise<ActionResult> {
  try {
    await api.patch("/me/availability", { available });
    revalidateTag(TAGS.me);
    revalidateTag(TAGS.professionals);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ─── Service Requests ─────────────────────────────────────────────────────────

export interface ServiceRequestPayload {
  workerId: string;
  title: string;
  description: string;
  categoryId: string;
  latitude: number;
  longitude: number;
  address: string;
  proposedPrice: number;
  preferredDate: string;
}

export async function sendServiceRequestAction(
  payload: ServiceRequestPayload
): Promise<ActionResult<{ requestId: string }>> {
  try {
    const res = await api.post<{ id: string }>("/service-requests", payload);
    revalidateTag(TAGS.activeRequest);
    return { ok: true, data: { requestId: res.id } };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function acceptRequestAction(
  requestId: string
): Promise<ActionResult> {
  try {
    await api.patch(`/service-requests/${requestId}/accept`);
    revalidateTag(TAGS.serviceRequest(requestId));
    revalidateTag(TAGS.activeRequest);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function declineRequestAction(
  requestId: string
): Promise<ActionResult> {
  try {
    await api.patch(`/service-requests/${requestId}/decline`);
    revalidateTag(TAGS.serviceRequest(requestId));
    revalidateTag(TAGS.activeRequest);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function confirmServiceAction(
  requestId: string
): Promise<ActionResult> {
  try {
    await api.patch(`/service-requests/${requestId}/confirm`);
    revalidateTag(TAGS.serviceRequest(requestId));
    revalidateTag(TAGS.activeRequest);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function updateProgressAction(
  requestId: string,
  progress: ServiceProgress
): Promise<ActionResult> {
  try {
    await api.patch(`/service-requests/${requestId}/progress`, progress);
    revalidateTag(TAGS.serviceRequest(requestId));
    revalidateTag(TAGS.activeRequest);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function finalizeServiceAction(
  requestId: string
): Promise<ActionResult> {
  try {
    await api.patch(`/service-requests/${requestId}/finalize`);
    revalidateTag(TAGS.serviceRequest(requestId));
    revalidateTag(TAGS.activeRequest);
    revalidateTag(TAGS.workerHistory);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function rateServiceAction(
  requestId: string,
  rating: number,
  comment?: string
): Promise<ActionResult> {
  try {
    await api.post(`/service-requests/${requestId}/rate`, { rating, comment });
    revalidateTag(TAGS.serviceRequest(requestId));
    revalidateTag(TAGS.activeRequest);
    revalidateTag(TAGS.professionals); // rating average updates
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export async function sendMessageAction(
  requestId: string,
  text: string
): Promise<ActionResult<ChatMessage>> {
  try {
    const msg = await api.post<ChatMessage>(
      `/service-requests/${requestId}/messages`,
      { text }
    );
    revalidateTag(TAGS.chatMessages(requestId));
    return { ok: true, data: msg };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function updateUserStatusAction(
  userId: string,
  status: "active" | "blocked" | "suspended"
): Promise<ActionResult> {
  try {
    await api.patch(`/admin/users/${userId}/status`, { status });
    revalidateTag(TAGS.adminUsers);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}
