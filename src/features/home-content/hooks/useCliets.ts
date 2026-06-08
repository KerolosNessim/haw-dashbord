import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { getClients, updateClients as updateClientsApi } from "../services/clients";
import { useHomeContentCountry } from "../context/home-content-country-context";

export const useClients = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { countryId, isCountryReady } = useHomeContentCountry();

  const getClientsQuery = useQuery({
    queryKey: ["clients", countryId],
    queryFn: () => getClients(countryId!),
    enabled: isCountryReady,
  });

  const { mutate: updateClients, isPending } = useMutation({
    mutationFn: ({ data }: { data: FormData }) => {
      if (!isCountryReady || countryId == null) {
        return Promise.reject(new Error("country_required"));
      }
      return updateClientsApi(countryId, data);
    },
    onSuccess: (res) => {
      toast.success(res?.message || t("toasts.clients_updated"));
      queryClient.setQueryData(["clients", countryId], res);
      void queryClient.invalidateQueries({ queryKey: ["clients", countryId] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || t("toasts.clients_update_failed"));
    },
  });

  return {
    getClientsQuery,
    updateClients,
    isPending,
    isCountryReady,
  };
};
