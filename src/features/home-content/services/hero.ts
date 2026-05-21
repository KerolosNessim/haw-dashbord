import { api } from "@/lib/api";
import type {  HeroResponse } from "../types";

export const getHeroContent = (): Promise<HeroResponse> => {
  return api
    .get<HeroResponse>("/v1/admin/hero")
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const updateHeroContent = (data: FormData): Promise<HeroResponse> => {
  return api
    .post<HeroResponse>("/v1/admin/hero", data)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};



