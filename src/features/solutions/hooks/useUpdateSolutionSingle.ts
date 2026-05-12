import { SOLUTION_SINGLES_QUERY_KEY } from "@/features/solutions/query-keys";
import {
  updateSolutionSingle,
  type SolutionSingleFormPayload,
} from "@/features/solutions/services/solution-singles-api";
import { axiosResponseErrorSummary } from "@/lib/api-error-message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function useUpdateSolutionSingle() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("translation", { keyPrefix: "solutions.api" });

  const { mutateAsync: updateMutation, isPending } = useMutation({
    mutationFn: ({
      id,
      payload,
      imageFile,
    }: {
      id: string | number;
      payload: SolutionSingleFormPayload;
      imageFile: File | null;
    }) => updateSolutionSingle(id, payload, imageFile),
    onSuccess: (res) => {
      void queryClient.invalidateQueries({ queryKey: SOLUTION_SINGLES_QUERY_KEY });
      const msg = typeof (res as { message?: string })?.message === "string" ? (res as { message: string }).message : "";
      toast.success(msg || t("update_success"));
    },
    onError: (error: AxiosError<unknown>) => {
      toast.error(axiosResponseErrorSummary(error.response?.data) || t("update_error"));
    },
  });

  return { updateMutation, isPending };
}
