import type { LoginResponse } from "@/features/auth/types";
import type { BasicInfoValues } from "../components/builder/basic-info-form";
import { api } from "@/lib/api";

export const basicFormApi = (values: BasicInfoValues): Promise<LoginResponse> => {
  const formData = new FormData();

  formData.append("slug", values.slug);
  values.country_ids.forEach((id) => {
    formData.append("country_ids[]", id);
  });
  formData.append("is_active", values.is_active ? "1" : "0");

  // Appending nested localized strings
  formData.append("title[ar]", values.title.ar);
  formData.append("title[en]", values.title.en);

  
  formData.append("description[ar]", values.description.ar);
  formData.append("description[en]", values.description.en);

  if (values.highlight_description?.ar) formData.append("highlight_description[ar]", values.highlight_description.ar);
  if (values.highlight_description?.en) formData.append("highlight_description[en]", values.highlight_description.en);

  if (values.meta_title?.ar) formData.append("meta_title[ar]", values.meta_title.ar);
  if (values.meta_title?.en) formData.append("meta_title[en]", values.meta_title.en);

  if (values.meta_description?.ar) formData.append("meta_description[ar]", values.meta_description.ar);
  if (values.meta_description?.en) formData.append("meta_description[en]", values.meta_description.en);

  // Appending files
  if (values.image instanceof File) {
    formData.append("image", values.image);
  }


  return api.post("/v1/admin/services", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  })
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};