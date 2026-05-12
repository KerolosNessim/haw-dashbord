import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getFaqGeneral, updateFaqGeneral } from "../services/faq";
import type { AxiosError } from "axios";

export const useFaqGeneral = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const getGeneralQuery = useQuery({
    queryKey: ["faq-general"],
    queryFn: getFaqGeneral,
  });

  const { mutate: updateGeneral, isPending: isUpdating } = useMutation({
    mutationFn: updateFaqGeneral,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["faq-general"] });
      toast.success(res.message || t("toasts.generic_updated"));
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || t("toasts.generic_update_failed"));
    },
  });

  return {
    getGeneralQuery,
    updateGeneral,
    isUpdating,
  };
};
