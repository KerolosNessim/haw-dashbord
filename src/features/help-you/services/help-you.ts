import { api } from "@/lib/api";
import { countryIdsQuery } from "@/features/home-content/lib/country-scope";
import type { HelpYouResponse } from "../types";

export const getHelpYou = (countryIds?: number[]): Promise<HelpYouResponse> => {
  return api
    .get<HelpYouResponse>("/v1/admin/help-you", {
      params: countryIdsQuery(countryIds),
    })
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const updateHelpYou = (data: FormData): Promise<HelpYouResponse> => {
  return api
    .post<HelpYouResponse>("/v1/admin/help-you/bulk", data, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};
