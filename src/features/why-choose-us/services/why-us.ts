import { api } from "@/lib/api";
import type { WhyUsItemsResponse, WhyUsResponse } from "../types";

export const getWhyUs = (): Promise<WhyUsResponse> => {
  return api
    .get<WhyUsResponse>("/v1/admin/why-choose-us")
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const getWhyUsItems = (): Promise<WhyUsItemsResponse> => {
  return api
    .get<WhyUsItemsResponse>("/v1/admin/why-choose-us/items")
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const updateWhyUs = (data: FormData): Promise<WhyUsResponse> => {
  return api
    .post<WhyUsResponse>("/v1/admin/why-choose-us", data, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};
export const updateWhyUsItems = (data: FormData): Promise<WhyUsResponse> => {
  return api
    .post<WhyUsResponse>("/v1/admin/why-choose-us/items", data, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};
