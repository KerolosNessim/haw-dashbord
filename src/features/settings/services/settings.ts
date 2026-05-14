import { api } from "@/lib/api";
import type {
  ContactSettings,
  Office,
  SeoSettings,
  SettingsResponse,
  SocialMedia,
  WorkingHours,
  ScriptsSettings,
  ScriptsResponse
} from "../types";

export const getSettingsApi = (): Promise<SettingsResponse> => {
  return api.get("/v1/admin/settings").then((res) => res.data);
};

export const getScriptsApi = (): Promise<ScriptsResponse> => {
  return api.get("/v1/admin/settings/scripts").then((res) => res.data);
};

export const updateScriptsApi = (data: ScriptsSettings): Promise<unknown> => {
  return api.post("/v1/admin/settings/scripts", data).then((res) => res.data);
};

export const updateGeneralSettingsApi = (data: FormData): Promise<unknown> => {
  return api.post("/v1/admin/settings/general", data, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((res) => res.data);
};

export const updateContactSettingsApi = (data: ContactSettings): Promise<unknown> => {
  return api.put("/v1/admin/settings/contact", data).then((res) => res.data);
};

export const updateWorkingHoursApi = (data: WorkingHours): Promise<unknown> => {
  return api.put("/v1/admin/settings/working-hours", data).then((res) => res.data);
};

// Offices CRUD
export const saveOfficeApi = (data: Partial<Office>): Promise<unknown> => {
  if (data.id) {
    return api.put(`/v1/admin/settings/offices/${data.id}`, data).then((res) => res.data);
  }
  return api.post("/v1/admin/settings/offices", data).then((res) => res.data);
};

export const deleteOfficeApi = (id: number): Promise<unknown> => {
  return api.delete(`/v1/admin/settings/offices/${id}`).then((res) => res.data);
};

// Social Media CRUD
export const saveSocialApi = (data: Partial<SocialMedia>): Promise<unknown> => {
  if (data.id) {
    return api.put(`/v1/admin/settings/social/${data.id}`, data).then((res) => res.data);
  }
  return api.post("/v1/admin/settings/social", data).then((res) => res.data);
};

export const deleteSocialApi = (id: number): Promise<unknown> => {
  return api.delete(`/v1/admin/settings/social/${id}`).then((res) => res.data);
};

// SEO CRUD
export const saveSeoApi = (data: Partial<SeoSettings>): Promise<unknown> => {
  if (data.id) {
    return api.put(`/v1/admin/settings/seo/${data.id}`, data).then((res) => res.data);
  }
  return api.post("/v1/admin/settings/seo", data).then((res) => res.data);
};

export const deleteSeoApi = (id: number): Promise<unknown> => {
  return api.delete(`/v1/admin/settings/seo/${id}`).then((res) => res.data);
};
