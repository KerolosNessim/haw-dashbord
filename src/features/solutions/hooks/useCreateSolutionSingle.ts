import { SOLUTION_SINGLES_QUERY_KEY } from "@/features/solutions/query-keys";
import {
  createSolutionSingle,
  type SolutionSingleFormPayload,
} from "@/features/solutions/services/solution-singles-api";
import { axiosResponseErrorSummary } from "@/lib/api-error-message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function useCreateSolutionSingle() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("translation", { keyPrefix: "solutions.api" });

  const { mutateAsync: createMutation, isPending } = useMutation({
    mutationFn: ({ payload, imageFile }: { payload: SolutionSingleFormPayload; imageFile: File | null }) =>
      createSolutionSingle(payload, imageFile),
    onSuccess: (res) => {
      void queryClient.invalidateQueries({ queryKey: SOLUTION_SINGLES_QUERY_KEY });
      const msg = typeof (res as { message?: string })?.message === "string" ? (res as { message: string }).message : "";
      toast.success(msg || t("create_success"));
    },
    onError: (error: AxiosError<unknown>) => {
      toast.error(axiosResponseErrorSummary(error.response?.data) || t("create_error"));
    },
  });

  return { createMutation, isPending };
}
