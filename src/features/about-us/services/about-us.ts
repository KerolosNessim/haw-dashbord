import { api } from "@/lib/api";
import { appendLocalizedDescriptionHtml } from "@/lib/localized-html-form";
import type {
  AboutUsData,
  AboutUsResponse,
  UpdateAboutUsInput,
  UpdateWhoWeAreSectionInput,
} from "../types";

export const getAboutUs = (): Promise<AboutUsResponse<AboutUsData>> => {
  return api
    .get<AboutUsResponse<AboutUsData>>("/v1/admin/about-us")
    .then((res) => res.data);
};

export const updateAboutUs = (data: UpdateAboutUsInput): Promise<AboutUsResponse<AboutUsData>> => {
  // Using FormData because of potential image upload
  const formData = new FormData();
  
  if (data.title) {
    formData.append("title[ar]", data.title.ar);
    formData.append("title[en]", data.title.en);
  }
  
  if (data.description) {
    appendLocalizedDescriptionHtml(formData, "description", data.description.ar, data.description.en);
  }
  
  if (data.image) {
    formData.append("image", data.image);
  }
  
  if (data.video_url) {
    formData.append("video_url", data.video_url);
  }

  if (data.meta_title) {
    formData.append("meta_title[ar]", data.meta_title.ar);
    formData.append("meta_title[en]", data.meta_title.en);
  }

  if (data.meta_description) {
    formData.append("meta_description[ar]", data.meta_description.ar);
    formData.append("meta_description[en]", data.meta_description.en);
  }

  formData.append("slug[ar]", "من_نحن");
  formData.append("slug[en]", "about_us");



  return api
    .post<AboutUsResponse<AboutUsData>>("/v1/admin/about-us", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res.data);
};
export const updateIntroSection = (data: UpdateAboutUsInput): Promise<AboutUsResponse<AboutUsData>> => {
  // Using FormData because of potential image upload
  const formData = new FormData();
  
  if (data.title) {
    formData.append("title[ar]", data.title.ar);
    formData.append("title[en]", data.title.en);
  }
  
  if (data.description) {
    appendLocalizedDescriptionHtml(formData, "description", data.description.ar, data.description.en);
  }
  
  if (data.image) {
    formData.append("image", data.image);
  }


  return api
    .post<AboutUsResponse<AboutUsData>>("/v1/admin/about-us/section", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res.data);
};

export const updateVisionSection = (data: UpdateAboutUsInput): Promise<AboutUsResponse<AboutUsData>> => {
  const formData = new FormData();
  
  if (data.vision_title) {
    formData.append("vision_title[ar]", data.vision_title.ar);
    formData.append("vision_title[en]", data.vision_title.en);
  }
  if (data.vision_description) {
    appendLocalizedDescriptionHtml(
      formData,
      "vision_description",
      data.vision_description.ar,
      data.vision_description.en,
    );
  }
  if (data.vision_image) {
    formData.append("vision_image", data.vision_image);
  }

  if (data.message_title) {
    formData.append("message_title[ar]", data.message_title.ar);
    formData.append("message_title[en]", data.message_title.en);
  }
  if (data.message_description) {
    appendLocalizedDescriptionHtml(
      formData,
      "message_description",
      data.message_description.ar,
      data.message_description.en,
    );
  }
  if (data.message_image) {
    formData.append("message_image", data.message_image);
  }

  return api
    .post<AboutUsResponse<AboutUsData>>("/v1/admin/about-us/vision", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res.data);
};

export const updateWhyUsSection = (data: UpdateAboutUsInput): Promise<AboutUsResponse<AboutUsData>> => {
  const formData = new FormData();
  
  if (data.why_us_title) {
    formData.append("title[ar]", data.why_us_title.ar);
    formData.append("title[en]", data.why_us_title.en);
  }
  if (data.why_us_description) {
    appendLocalizedDescriptionHtml(formData, "description", data.why_us_description.ar, data.why_us_description.en);
  }
  if (data.why_us_values_title) {
    formData.append("values_title[ar]", data.why_us_values_title.ar);
    formData.append("values_title[en]", data.why_us_values_title.en);
  }
  if (data.why_us_values_description) {
    appendLocalizedDescriptionHtml(
      formData,
      "values_description",
      data.why_us_values_description.ar,
      data.why_us_values_description.en,
    );
  }
  if (data.why_us_image) {
    formData.append("image", data.why_us_image);
  }

  

  return api
    .post<AboutUsResponse<AboutUsData>>("/v1/admin/about-us/why-us", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res.data);
};

export const upsertWhoWeAreSection = (
  data: UpdateWhoWeAreSectionInput,
): Promise<AboutUsResponse<AboutUsData>> => {
  return api
    .post<AboutUsResponse<AboutUsData>>("/v1/admin/about-us/who-we-are", {
      title: { ar: data.title.ar, en: data.title.en },
      description: { ar: data.description.ar, en: data.description.en },
      is_active: data.is_active,
    })
    .then((res) => res.data);
};

export const deleteWhoWeAreSection = (id: number): Promise<AboutUsResponse<AboutUsData>> => {
  return api
    .delete<AboutUsResponse<AboutUsData>>(`/v1/admin/about-us/who-we-are/${id}`)
    .then((res) => res.data);
};

export const updateContactSection = (data: UpdateAboutUsInput): Promise<AboutUsResponse<AboutUsData>> => {
  const formData = new FormData();
  
  if (data.contact_title) {
    formData.append("title[ar]", data.contact_title.ar);
    formData.append("title[en]", data.contact_title.en);
  }
  if (data.contact_description) {
    appendLocalizedDescriptionHtml(formData, "description", data.contact_description.ar, data.contact_description.en);
  }
  if (data.contact_phone) {
    formData.append("phone", data.contact_phone);
  }



  return api
    .post<AboutUsResponse<AboutUsData>>("/v1/admin/about-us/contact", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res.data);
};
