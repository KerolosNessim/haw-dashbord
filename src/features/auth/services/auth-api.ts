import { api } from "@/lib/api"
import type { LoginValues } from "../components/login-form"
import type { LoginResponse } from "../types"


export const loginApi = (values: LoginValues): Promise<LoginResponse> => {
  return api.post("/v1/admin/login", values)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const logoutApi = (): Promise<LoginResponse> => {
  return api.post("/v1/admin/logout")
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};
    
