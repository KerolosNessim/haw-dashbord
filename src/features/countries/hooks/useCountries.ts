import { useQuery } from "@tanstack/react-query"
import { getCountriesApi } from "../services/countries"

export const useCountries = () => {
  const {data, isLoading, error} = useQuery({
    queryKey: ["countries"],
    queryFn: getCountriesApi,
  })

  return {data, isLoading, error}
}