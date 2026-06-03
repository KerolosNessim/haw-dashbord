import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  fetchPromoBannerSection,
  updatePromoBannerSection,
} from "../services/promo-banners-api";

const QUERY_KEY = ["promo-banners", "section"];

export function usePromoBannerSection() {
  const { t } = useTranslation("translation", { keyPrefix: "promo_banners" });
  const queryClient = useQueryClient();

  const sectionQuery = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchPromoBannerSection,
  });

  const updateMutation = useMutation({
    mutationFn: updatePromoBannerSection,
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
