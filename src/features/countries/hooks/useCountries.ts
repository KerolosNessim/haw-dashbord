import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  buildCountryIdAliasMap,
  dedupeCountries,
} from "@/features/countries/lib/dedupe-countries";
import { getCountriesApi, getAdminCountriesApi, saveCountryApi, deleteCountryApi } from "@/features/countries/services/countries"


export const useCountries = () => {
  const query = useQuery({
    queryKey: ["countries"],
    queryFn: getCountriesApi,
  });

  const activeCountries = useMemo(
    () => (query.data?.data ?? []).filter((country) => country.is_active),
    [query.data?.data],
  );
  const countries = useMemo(
    () => dedupeCountries(activeCountries),
    [activeCountries],
  );
  const idAlias = useMemo(
    () => buildCountryIdAliasMap(activeCountries),
    [activeCountries],
  );

  return {
    ...query,
    countries,
    idAlias,
  };
}

export const useAdminCountries = () => {
  return useQuery({
    queryKey: ["admin-countries"],
    queryFn: getAdminCountriesApi,
  })
}

/** Active countries with duplicate names collapsed (prefers flagged records). */
export function useActiveUniqueCountries() {
  const query = useAdminCountries();
  const activeCountries = useMemo(
    () => (query.data?.data ?? []).filter((country) => country.is_active),
    [query.data?.data],
  );
  const countries = useMemo(
    () => dedupeCountries(activeCountries),
    [activeCountries],
  );
  const idAlias = useMemo(
    () => buildCountryIdAliasMap(activeCountries),
    [activeCountries],
  );

  return {
    ...query,
    countries,
    idAlias,
  };
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