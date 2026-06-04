import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getTestimonialsList, updateTestimonialsList } from "../services/testimonials";
import { appendCountryIdsToFormData } from "@/features/home-content/lib/country-scope";
import { useHomeContentCountry } from "@/features/home-content/context/home-content-country-context";
import type { AxiosError } from "axios";

export const useTestimonialsList = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { countryIds, isCountryReady } = useHomeContentCountry();
  const queryKey = ["testimonials-list", countryIds] as const;

  const getListQuery = useQuery({
    queryKey,
    queryFn: () => getTestimonialsList(countryIds),
    enabled: isCountryReady,
  });

  const { mutate: updateList, isPending } = useMutation({
    mutationFn: (formData: FormData) => {
      appendCountryIdsToFormData(formData, countryIds);
      return updateTestimonialsList(formData);
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
    getListQuery,
    updateList,
    isPending,
    isCountryReady,
  };
};
