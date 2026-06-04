import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  fetchPromoBannerSection,
  updatePromoBannerSection,
} from "../services/promo-banners-api";
import { useHomeContentCountry } from "@/features/home-content/context/home-content-country-context";

export function usePromoBannerSection() {
  const { t } = useTranslation("translation", { keyPrefix: "promo_banners" });
  const queryClient = useQueryClient();
  const { countryIds, isCountryReady } = useHomeContentCountry();
  const queryKey = ["promo-banners", "section", countryIds] as const;

  const sectionQuery = useQuery({
    queryKey,
    queryFn: () => fetchPromoBannerSection(countryIds),
    enabled: isCountryReady,
  });

  const updateMutation = useMutation({
    mutationFn: (values: Parameters<typeof updatePromoBannerSection>[0]) =>
      updatePromoBannerSection(values, countryIds),
    onSuccess: (res) => {
      toast.success(res?.message || t("section.toast_saved"));
      void queryClient.invalidateQueries({ queryKey });
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
    isCountryReady,
  };
}
