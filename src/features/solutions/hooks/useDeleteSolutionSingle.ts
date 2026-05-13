import { SOLUTION_SINGLES_QUERY_KEY } from "@/features/solutions/query-keys";
import { deleteSolutionSingle } from "@/features/solutions/services/solution-singles-api";
import { axiosResponseErrorSummary } from "@/lib/api-error-message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function useDeleteSolutionSingle() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("translation", { keyPrefix: "solutions.api" });

  const { mutateAsync: deleteMutation, isPending } = useMutation({
    mutationFn: (id: string | number) => deleteSolutionSingle(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SOLUTION_SINGLES_QUERY_KEY });
      toast.success(t("delete_success"));
    },
    onError: (error: AxiosError<unknown>) => {
      toast.error(axiosResponseErrorSummary(error.response?.data) || t("delete_error"));
    },
  });

  return { deleteMutation, isPending };
}
