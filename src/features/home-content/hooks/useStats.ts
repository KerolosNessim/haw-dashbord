import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { getStatsApi, updateStatApi, type UpdateStatPayload } from "../services/stats";

export const useStats = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const getStats = useQuery({
    queryKey: ["stats"],
    queryFn: getStatsApi,
  });
  

  const { mutate: updateStat, isPending } = useMutation({
    mutationFn: (data: UpdateStatPayload) => updateStatApi(data),
    onSuccess: (res) => {
      toast.success(res?.message || t("toasts.stat_updated"));
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || t("toasts.stat_update_failed"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    }
  });

  return {
    getStats,
    updateStat,
    isPending,
  };
};