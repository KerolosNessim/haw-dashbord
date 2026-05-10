import { api } from "@/lib/api";
import type { 
  FaqGeneralData, 
  FaqResponse, 
  UpdateFaqGeneralInput, 
  CreateFaqItemInput,
  FaqItem
} from "../types";

export const getFaqGeneral = (): Promise<FaqResponse<FaqGeneralData>> => {
  return api
    .get<FaqResponse<FaqGeneralData>>("/v1/admin/faqs")
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const updateFaqGeneral = (data: UpdateFaqGeneralInput): Promise<FaqResponse<FaqGeneralData>> => {
  return api
    .post<FaqResponse<FaqGeneralData>>("/v1/admin/faqs", data)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const createFaqItem = (data: CreateFaqItemInput): Promise<FaqResponse<FaqItem>> => {
  return api
    .post<FaqResponse<FaqItem>>("/v1/admin/faqs/items", data)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const updateFaqItem = (id: number, data: CreateFaqItemInput): Promise<FaqResponse<FaqItem>> => {
  return api
    .put<FaqResponse<FaqItem>>(`/v1/admin/faqs/items/${id}`, data)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const deleteFaqItem = (id: number): Promise<FaqResponse<null>> => {
  return api
    .delete<FaqResponse<null>>(`/v1/admin/faqs/items/${id}`)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};
