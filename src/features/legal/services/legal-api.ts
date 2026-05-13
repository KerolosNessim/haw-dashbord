import { api } from "@/lib/api";
import type { LegalPage, LegalPageType } from "../types";

export const getLegalPageApi = async (type: LegalPageType): Promise<LegalPage> => {
  const response = await api.get(`/v1/admin/${type}`);
  return response.data.data;
};

export const updateLegalPageApi = async (type: LegalPageType, data: FormData): Promise<any> => {
  const response = await api.post(`/v1/admin/${type}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const resData = response.data;
  if (resData.status === false || resData.status === "false" || resData.status === 0 || resData.status === "0") {
    throw new Error(resData.message || "Update failed");
  }

  return resData;
};
