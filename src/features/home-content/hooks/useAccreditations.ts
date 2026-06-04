import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { getAccreditations, updateAccreditation } from "../services/dependacies";
import { useHomeContentCountry } from "../context/home-content-country-context";

export const useAccreditations = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { countryId, isCountryReady } = useHomeContentCountry();

  const getAccreditationsQuery = useQuery({
    queryKey: ["accreditations", countryId],
    queryFn: () => getAccreditations(countryId!),
    enabled: isCountryReady,
  });

  const { mutate: updateAccred, isPending } = useMutation({
    mutationFn: ({ data }: { data: FormData }) => {
      if (!isCountryReady || countryId == null) {
        return Promise.reject(new Error("country_required"));
      }
      return updateAccreditation(countryId, data);
    },
    onSuccess: (res) => {
      toast.success(res?.message || t("toasts.accreditation_updated"));
      queryClient.invalidateQueries({ queryKey: ["accreditations", countryId] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || t("toasts.accreditation_update_failed"));
    },
  });

  return {
    getAccreditationsQuery,
    updateAccred,
    isPending,
    isCountryReady,
  };
};
