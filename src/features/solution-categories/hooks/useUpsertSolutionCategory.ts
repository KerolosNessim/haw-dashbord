import { SOLUTION_TAXONOMY_CATEGORIES_KEY } from "@/features/solution-categories/query-keys";
import { SOLUTION_SINGLES_QUERY_KEY } from "@/features/solutions/query-keys";
import {
  upsertSolutionCategory,
  type SolutionCategoryFormValues,
} from "@/features/solution-categories/services/taxonomy-categories-api";
import { axiosResponseErrorSummary } from "@/lib/api-error-message";
import { resolveApiToastMessage } from "@/lib/api-toast-message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function useUpsertSolutionCategory() {
  const queryClient = useQueryClient();
  const { t: tRoot } = useTranslation();
  const { t } = useTranslation("translation", { keyPrefix: "solution_categories.api" });

  const { mutateAsync: upsertMutation, isPending } = useMutation({
    mutationFn: ({
      values,
      categoryId,
    }: {
      values: SolutionCategoryFormValues;
      categoryId?: string | null;
    }) => upsertSolutionCategory(values, categoryId),
    onSuccess: (res, vars) => {
      void queryClient.invalidateQueries({ queryKey: SOLUTION_TAXONOMY_CATEGORIES_KEY });
      void queryClient.invalidateQueries({ queryKey: SOLUTION_SINGLES_QUERY_KEY });
      const isUpdate = Boolean(vars.categoryId?.trim());
      const fallback = isUpdate ? t("update_success") : t("create_success");
      toast.success(resolveApiToastMessage(res, fallback, tRoot));
    },
    onError: (error: AxiosError<unknown>, vars) => {
      const isUpdate = Boolean(vars.categoryId?.trim());
      toast.error(axiosResponseErrorSummary(error.response?.data) || (isUpdate ? t("update_error") : t("create_error")));
    },
  });

  return { upsertMutation, isPending };
}
