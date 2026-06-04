import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { getStatsApi, updateStatApi, type UpdateStatPayload } from "../services/stats";
import { useHomeContentCountry } from "../context/home-content-country-context";

export const useStats = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { countryId, isCountryReady } = useHomeContentCountry();

  const getStats = useQuery({
    queryKey: ["stats", countryId],
    queryFn: () => getStatsApi(countryId!),
    enabled: isCountryReady,
  });

  const { mutate: updateStat, isPending } = useMutation({
    mutationFn: (data: UpdateStatPayload) => {
      if (!isCountryReady || countryId == null) {
        return Promise.reject(new Error("country_required"));
      }
      return updateStatApi(countryId, data);
    },
    onSuccess: (res) => {
      toast.success(res?.message || t("toasts.stat_updated"));
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || t("toasts.stat_update_failed"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["stats", countryId] });
    },
  });

  return {
    getStats,
    updateStat,
    isPending,
    isCountryReady,
  };
};
