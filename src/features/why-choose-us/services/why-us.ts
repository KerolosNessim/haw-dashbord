import { api } from "@/lib/api";
import { countryIdsQuery } from "@/features/home-content/lib/country-scope";
import type { WhyUsItemsResponse, WhyUsResponse } from "../types";

export const getWhyUs = (countryIds?: number[]): Promise<WhyUsResponse> => {
  return api
    .get<WhyUsResponse>("/v1/admin/why-choose-us", {
      params: countryIdsQuery(countryIds),
    })
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const getWhyUsItems = (countryIds?: number[]): Promise<WhyUsItemsResponse> => {
  return api
    .get<WhyUsItemsResponse>("/v1/admin/why-choose-us/items", {
      params: countryIdsQuery(countryIds),
    })
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

export const updateWhyUsItems = (data: FormData): Promise<WhyUsItemsResponse> => {
  return api
    .post<WhyUsItemsResponse>("/v1/admin/why-choose-us/items", data, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};
