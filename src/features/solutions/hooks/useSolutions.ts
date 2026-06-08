import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { SOLUTION_BLOCK_QUERY_KEY } from "../query-keys";
import { getSolutions, updateSolutions } from "../services/solutions";

export const useSolutions = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const getSolutionsQuery = useQuery({
    queryKey: SOLUTION_BLOCK_QUERY_KEY,
    queryFn: getSolutions,
  });

  const { mutate: updateSolutionsMutation, isPending } = useMutation({
    mutationFn: updateSolutions,
    onSuccess: (res) => {
      queryClient.setQueryData(SOLUTION_BLOCK_QUERY_KEY, res);
      void queryClient.invalidateQueries({ queryKey: SOLUTION_BLOCK_QUERY_KEY });
      toast.success(res.message || t("toasts.solutions_updated"));
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || t("toasts.solutions_update_failed"));
    },
  });

  return {
    getSolutionsQuery,
    updateSolutions: updateSolutionsMutation,
    isPending,
  };
};
