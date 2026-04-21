import { useQuery } from "@tanstack/react-query"
import { getServicesApi } from "../services/get-services"

export const useGetServices = () => {
  const {data, isLoading, error} = useQuery({
    queryKey: ["services"],
    queryFn: getServicesApi,
  })

  return {data, isLoading, error}
} 