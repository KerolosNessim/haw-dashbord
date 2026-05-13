import { api } from "@/lib/api";

export const getAdminServicesApi = () => {
  return api.get("/v1/admin/services")
    .then((res) => res.data);
};

export const getAdminServiceByIdApi = (id: number | string) => {
  return api.get(`/v1/admin/services/${id}`)
    .then((res) => res.data);
};

export const deleteAdminServiceApi = (id: number | string) => {
  return api.delete(`/v1/admin/services/${id}`)
    .then((res) => res.data);
};
