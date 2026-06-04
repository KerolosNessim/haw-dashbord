import { api } from "@/lib/api";
import { countryIdsQuery } from "@/features/home-content/lib/country-scope";
import type { TestimonialsGeneralData, TestimonialsListData, TestimonialsResponse } from "../types";

export const getTestimonialsGeneral = (
  countryIds?: number[],
): Promise<TestimonialsResponse<TestimonialsGeneralData>> => {
  return api
    .get<TestimonialsResponse<TestimonialsGeneralData>>("/v1/admin/testimonials/content", {
      params: countryIdsQuery(countryIds),
    })
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const updateTestimonialsGeneral = (
  data: FormData,
): Promise<TestimonialsResponse<TestimonialsGeneralData>> => {
  return api
    .post<TestimonialsResponse<TestimonialsGeneralData>>("/v1/admin/testimonials/content", data, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const getTestimonialsList = (
  countryIds?: number[],
): Promise<TestimonialsResponse<TestimonialsListData>> => {
  return api
    .get<TestimonialsResponse<TestimonialsListData>>("/v1/admin/testimonials", {
      params: countryIdsQuery(countryIds),
    })
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const updateTestimonialsList = (
  data: FormData,
): Promise<TestimonialsResponse<TestimonialsListData>> => {
  return api
    .post<TestimonialsResponse<TestimonialsListData>>("/v1/admin/testimonials/bulk-sync", data, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};
