import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getCountriesApi, getAdminCountriesApi, saveCountryApi, deleteCountryApi } from "@/features/countries/services/countries"


export const useCountries = () => {
  return useQuery({
    queryKey: ["countries"],
    queryFn: getCountriesApi,
  })
}

export const useAdminCountries = () => {
  return useQuery({
    queryKey: ["admin-countries"],
    queryFn: getAdminCountriesApi,
  })
}

export const useSaveCountry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveCountryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-countries"] });
      queryClient.invalidateQueries({ queryKey: ["countries"] });
    },
  });
}

export const useDeleteCountry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCountryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-countries"] });
      queryClient.invalidateQueries({ queryKey: ["countries"] });
    },
  });
}