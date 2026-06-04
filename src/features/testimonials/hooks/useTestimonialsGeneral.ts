import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getTestimonialsGeneral, updateTestimonialsGeneral } from "../services/testimonials";
import { appendCountryIdsToFormData } from "@/features/home-content/lib/country-scope";
import { useHomeContentCountry } from "@/features/home-content/context/home-content-country-context";
import type { AxiosError } from "axios";

export const useTestimonialsGeneral = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { countryIds, isCountryReady } = useHomeContentCountry();
  const queryKey = ["testimonials-general", countryIds] as const;

  const getGeneralQuery = useQuery({
    queryKey,
    queryFn: () => getTestimonialsGeneral(countryIds),
    enabled: isCountryReady,
  });

  const { mutate: updateGeneral, isPending } = useMutation({
    mutationFn: (formData: FormData) => {
      appendCountryIdsToFormData(formData, countryIds);
      return updateTestimonialsGeneral(formData);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(res.message || t("toasts.generic_updated"));
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || t("toasts.generic_update_failed"));
    },
  });

  return {
    getGeneralQuery,
    updateGeneral,
    isPending,
    isCountryReady,
  };
};
