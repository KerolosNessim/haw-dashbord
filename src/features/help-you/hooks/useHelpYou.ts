import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getHelpYou, updateHelpYou } from "../services/help-you";
import { appendCountryIdsToFormData } from "@/features/home-content/lib/country-scope";
import { useHomeContentCountry } from "@/features/home-content/context/home-content-country-context";

export const useHelpYou = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { countryIds, isCountryReady } = useHomeContentCountry();
  const queryKey = ["help-you", countryIds] as const;

  const getHelpYouQuery = useQuery({
    queryKey,
    queryFn: () => getHelpYou(countryIds),
    enabled: isCountryReady,
  });

  const { mutate: updateHelpYouMutation, isPending } = useMutation({
    mutationFn: (formData: FormData) => {
      appendCountryIdsToFormData(formData, countryIds);
      return updateHelpYou(formData);
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
    getHelpYouQuery,
    updateHelpYou: updateHelpYouMutation,
    isPending,
    isCountryReady,
  };
};
