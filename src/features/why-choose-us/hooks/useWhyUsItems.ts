import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getWhyUsItems, updateWhyUsItems } from "../services/why-us";
import { appendCountryIdsToFormData } from "@/features/home-content/lib/country-scope";
import { useHomeContentCountry } from "@/features/home-content/context/home-content-country-context";

export const useWhyUsItems = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { countryIds, isCountryReady } = useHomeContentCountry();
  const queryKey = ["why-us-items", countryIds] as const;

  const getWhyUsItemsQuery = useQuery({
    queryKey,
    queryFn: () => getWhyUsItems(countryIds),
    enabled: isCountryReady,
  });

  const { mutate: updateWhyUsItemsMutation, isPending } = useMutation({
    mutationFn: (formData: FormData) => {
      appendCountryIdsToFormData(formData, countryIds);
      return updateWhyUsItems(formData);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(res.message || t("toasts.items_updated"));
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || t("toasts.generic_update_failed"));
    },
  });

  return {
    getWhyUsItemsQuery,
    updateWhyUsItems: updateWhyUsItemsMutation,
    isPending,
    isCountryReady,
  };
};
