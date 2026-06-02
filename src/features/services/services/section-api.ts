import { api } from "@/lib/api";
import { appendLocalizedDescriptionHtml } from "@/lib/localized-html-form";
import { getAdminServicesBasePath } from "./service-resource-config";

/**
 * Service to handle saving different types of service sections.
 * Each section type has its own endpoint.
 */

export const saveImageTextSection = async (serviceId: number, data: any) => {
  const base = getAdminServicesBasePath();
  const formData = new FormData();
  formData.append("title[ar]", data.title.ar);
  formData.append("title[en]", data.title.en);
  appendLocalizedDescriptionHtml(formData, "description", data.description.ar, data.description.en);
  
  if (data.image instanceof File) {
    formData.append("image", data.image);
  }
  
  return api.post(`${base}/${serviceId}/benefits`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const saveCardsSection = async (serviceId: number, data: any) => {
  return api.post(`${getAdminServicesBasePath()}/${serviceId}/offerings`, data);
};

export const saveFAQSection = async (serviceId: number, data: any) => {
  return api.post(`${getAdminServicesBasePath()}/${serviceId}/faqs`, data);
};

export const saveFullSection = async (serviceId: number, data: any) => {
  const base = getAdminServicesBasePath();
  const formData = new FormData();
  formData.append("title[ar]", data.title.ar);
  formData.append("title[en]", data.title.en);
  appendLocalizedDescriptionHtml(formData, "description", data.description.ar, data.description.en);
  
  if (data.image instanceof File) {
    formData.append("image", data.image);
  }
  
  // Handling array of items with localized titles and descriptions
  data.items?.forEach((item: any, index: number) => {
    formData.append(`items[${index}][title][ar]`, item.title.ar);
    formData.append(`items[${index}][title][en]`, item.title.en);
    formData.append(`items[${index}][description][ar]`, item.description.ar);
    formData.append(`items[${index}][description][en]`, item.description.en);
    formData.append(`items[${index}][sort_order]`, String(item.sort_order ?? 0));
    
    if (item.image instanceof File) {
      formData.append(`items[${index}][image]`, item.image);
    }
  });

  return api.post(`${base}/${serviceId}/steps`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const saveDualDescSection = async (serviceId: number, data: any) => {
  return api.post(`${getAdminServicesBasePath()}/${serviceId}/tools`, data);
};

export const saveContactSection = async (serviceId: number, data: any) => {
  return api.post(`${getAdminServicesBasePath()}/${serviceId}/ctas`, data);
};
