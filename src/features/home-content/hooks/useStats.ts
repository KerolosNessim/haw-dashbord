import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { getStatsApi, updateStatApi, type UpdateStatPayload } from "../services/stats";

export const useStats = () => {
  const queryClient = useQueryClient();

  const getStats = useQuery({
    queryKey: ["stats"],
    queryFn: getStatsApi,
  });

  const { mutate: updateStat, isPending } = useMutation({
    mutationFn: (data: UpdateStatPayload) => updateStatApi(data),
    onSuccess: (res) => {
      toast.success(res?.message || "Stat updated successfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || "Failed to update stat");
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