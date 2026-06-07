import { api } from "@/lib/api";
import type { ServiceBooking, ServiceBookingsResponse, SingleBookingResponse } from "../types/index";

type LocaleString = { ar: string; en: string };

function localeString(raw: unknown): LocaleString {
  if (raw == null) return { ar: "", en: "" };
  if (typeof raw === "string") return { ar: raw, en: raw };
  if (typeof raw !== "object" || Array.isArray(raw)) return { ar: "", en: "" };
  const row = raw as { ar?: unknown; en?: unknown };
  return {
    ar: row.ar != null ? String(row.ar) : "",
    en: row.en != null ? String(row.en) : "",
  };
}

export function bookingServiceTitle(booking: ServiceBooking, lang: "ar" | "en"): string {
  const title = booking.service?.title;
  if (!title) return "";
  return title[lang]?.trim() || title.ar?.trim() || title.en?.trim() || "";
}

function normalizeService(raw: unknown, fallbackServiceId?: unknown): ServiceBooking["service"] {
  const id = Number(
    (raw && typeof raw === "object" ? (raw as Record<string, unknown>).id : undefined) ??
      fallbackServiceId ??
      0,
  );

  if (!raw || typeof raw !== "object") {
    return { id: Number.isFinite(id) ? id : 0, title: { ar: "", en: "" } };
  }

  const row = raw as Record<string, unknown>;
  return {
    id: Number(row.id ?? fallbackServiceId ?? 0) || 0,
    title: localeString(row.title),
  };
}

export function normalizeServiceBooking(raw: unknown): ServiceBooking | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = Number(row.id);
  if (!Number.isFinite(id) || id <= 0) return null;

  return {
    id,
    service_id: Number(row.service_id ?? row.serviceId ?? row.service?.id ?? 0) || 0,
    service: normalizeService(row.service, row.service_id),
    name: typeof row.name === "string" ? row.name : "",
    email: typeof row.email === "string" ? row.email : "",
    phone: typeof row.phone === "string" ? row.phone : "",
    message: typeof row.message === "string" ? row.message : "",
    status: typeof row.status === "string" ? row.status : "new",
    created_at: typeof row.created_at === "string" ? row.created_at : "",
  };
}

function normalizeListMeta(raw: unknown): ServiceBookingsResponse["data"]["meta"] {
  const row = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    current_page: Number(row.current_page ?? 1) || 1,
    last_page: Number(row.last_page ?? 1) || 1,
    per_page: Number(row.per_page ?? 10) || 10,
    total: Number(row.total ?? 0) || 0,
  };
}

function normalizeBookingsListPayload(body: unknown): ServiceBookingsResponse["data"] {
  const root = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const data = root.data ?? body;

  let rows: unknown[] = [];
  let metaRaw: unknown = root.meta;

  if (Array.isArray(data)) {
    rows = data;
  } else if (data && typeof data === "object" && !Array.isArray(data)) {
    const rec = data as Record<string, unknown>;
    if (Array.isArray(rec.data)) rows = rec.data;
    metaRaw = rec.meta ?? metaRaw;
  }

  return {
    data: rows
      .map(normalizeServiceBooking)
      .filter((item): item is ServiceBooking => item != null),
    meta: normalizeListMeta(metaRaw),
  };
}

export const getServiceBookings = async (page: number = 1): Promise<ServiceBookingsResponse> => {
  const response = await api.get<ServiceBookingsResponse>("/v1/admin/service-bookings", {
    params: { page },
  });
  return {
    status: String((response.data as ServiceBookingsResponse)?.status ?? "true"),
    message: String((response.data as ServiceBookingsResponse)?.message ?? ""),
    data: normalizeBookingsListPayload(response.data),
  };
};

export const getServiceBookingById = async (id: number): Promise<SingleBookingResponse> => {
  const response = await api.get<SingleBookingResponse>(`/v1/admin/service-bookings/${id}`);
  const root = response.data as SingleBookingResponse;
  const normalized = normalizeServiceBooking(root.data);
  if (!normalized) throw new Error("Invalid booking response");
  return { ...root, data: normalized };
};

export const deleteServiceBooking = async (id: number): Promise<void> => {
  await api.delete(`/v1/admin/service-bookings/${id}`);
};
