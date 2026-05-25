import { useQuery } from "@tanstack/react-query";
import { getAdminServicesApi } from "../services/admin-services";
import { getServicesApi } from "../services/get-services";
import { isAxiosError } from "axios";

export const useGetServices = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      try {
        return await getAdminServicesApi();
      } catch (e) {
        if (isAxiosError(e) && (e.response?.status === 403 || e.response?.status === 404)) {
          return getServicesApi();
        }
        throw e;
      }
    },
  });

  return { data, isLoading, error };
}; 