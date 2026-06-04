import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  bulkSyncPromoBannerSlides,
  fetchPromoBannerSlides,
} from "../services/promo-banners-api";
import { useHomeContentCountry } from "@/features/home-content/context/home-content-country-context";

export function usePromoBannerSlides() {
  const { t } = useTranslation("translation", { keyPrefix: "promo_banners" });
  const queryClient = useQueryClient();
  const { countryIds, isCountryReady } = useHomeContentCountry();
  const queryKey = ["promo-banners", "slides", countryIds] as const;

  const slidesQuery = useQuery({
    queryKey,
    queryFn: () => fetchPromoBannerSlides(countryIds),
    enabled: isCountryReady,
  });

  const bulkSyncMutation = useMutation({
    mutationFn: (values: Parameters<typeof bulkSyncPromoBannerSlides>[0]) =>
      bulkSyncPromoBannerSlides(values, countryIds),
    onSuccess: (res) => {
      toast.success(res?.message || t("slides.toast_saved"));
      void queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error?.response?.data?.message || t("slides.toast_error"));
    },
  });

  return {
    slidesQuery,
    bulkSync: bulkSyncMutation.mutate,
    isSaving: bulkSyncMutation.isPending,
    saveError: bulkSyncMutation.error,
    isCountryReady,
  };
}
