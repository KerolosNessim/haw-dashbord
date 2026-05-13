import { useQuery } from "@tanstack/react-query";
import { getAdminServiceByIdApi } from "../services/admin-services";

export const useAdminService = (id?: number | string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-service", id],
    queryFn: () => getAdminServiceByIdApi(id!),
    enabled: !!id,
  });

  return { 
    service: data?.data, // Unwrapping the first layer
    isLoading, 
    error,
    refetch 
  };
};
