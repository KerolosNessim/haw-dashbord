import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  fetchPortfolioSection,
  updatePortfolioSection,
} from "../services/client-portfolio-api";

const QUERY_KEY = ["client-portfolio", "section"] as const;

export function useClientPortfolioSection() {
  const { t } = useTranslation("translation", { keyPrefix: "client_portfolio" });
  const queryClient = useQueryClient();

  const sectionQuery = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchPortfolioSection,
  });

  const updateMutation = useMutation({
    mutationFn: updatePortfolioSection,
    onSuccess: (res) => {
      toast.success(res?.message || t("section.toast_saved"));
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error?.response?.data?.message || t("section.toast_error"));
    },
  });

  return {
    sectionQuery,
    updateSection: updateMutation.mutate,
    isSaving: updateMutation.isPending,
    saveError: updateMutation.error,
  };
}
