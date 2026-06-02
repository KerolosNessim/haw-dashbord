import { useQuery } from "@tanstack/react-query";
import { getAdminServiceByIdApi } from "../services/admin-services";
import { getServiceQueryNamespace } from "../services/service-resource-config";

export const useAdminService = (id?: number | string) => {
  const scope = getServiceQueryNamespace();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-service", scope, id],
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
