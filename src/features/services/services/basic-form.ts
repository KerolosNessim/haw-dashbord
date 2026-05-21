import type { LoginResponse } from "@/features/auth/types";
import type { BasicInfoValues } from "../components/builder/basic-info-form";
import { api } from "@/lib/api";
import { htmlForMultipartApi } from "@/lib/html-for-multipart-api";

export const basicFormApi = (values: BasicInfoValues, id?: number): Promise<LoginResponse> => {
  const formData = new FormData();
  const url = id ? `/v1/admin/services/${id}?_method=PUT` : "/v1/admin/services";

  formData.append("slug[ar]", values.slug.ar);
  formData.append("slug[en]", values.slug.en);
  values.country_ids.forEach((countryId) => {
    formData.append("country_ids[]", countryId);
  });
  formData.append("is_active", values.is_active ? "1" : "0");
  formData.append("show_footer", values.show_footer ? "1" : "0");

  formData.append("title[ar]", values.title.ar);
  formData.append("title[en]", values.title.en);
  formData.append("description[ar]", values.description.ar);
  formData.append("description[en]", values.description.en);

  if (values.highlight_description?.ar) {
    formData.append(
      "highlight_description[ar]",
      htmlForMultipartApi(values.highlight_description.ar),
    );
  }
  if (values.highlight_description?.en) {
    formData.append(
      "highlight_description[en]",
      htmlForMultipartApi(values.highlight_description.en),
    );
  }

  if (values.meta_title?.ar) formData.append("meta_title[ar]", values.meta_title.ar);
  if (values.meta_title?.en) formData.append("meta_title[en]", values.meta_title.en);
  if (values.meta_description?.ar) {
    formData.append("meta_description[ar]", values.meta_description.ar);
  }
  if (values.meta_description?.en) {
    formData.append("meta_description[en]", values.meta_description.en);
  }

  formData.append("image_alt[ar]", values.image_alt.ar ?? "");
  formData.append("image_alt[en]", values.image_alt.en ?? "");

  if (values.image.ar instanceof File) {
    formData.append("image[ar]", values.image.ar);
  }
  if (values.image.en instanceof File) {
    formData.append("image[en]", values.image.en);
  }

  return api.post(url, formData).then((res) => res.data).catch((error) => {
    throw error;
  });
};
