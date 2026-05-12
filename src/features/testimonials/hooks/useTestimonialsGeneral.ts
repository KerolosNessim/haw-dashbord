import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getTestimonialsGeneral, updateTestimonialsGeneral } from "../services/testimonials";
import type { AxiosError } from "axios";

export const useTestimonialsGeneral = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const getGeneralQuery = useQuery({
    queryKey: ["testimonials-general"],
    queryFn: getTestimonialsGeneral,
  });

  const { mutate: updateGeneral, isPending } = useMutation({
    mutationFn: updateTestimonialsGeneral,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["testimonials-general"] });
      toast.success(res.message || t("toasts.generic_updated"));
    },
    onError: (error: AxiosError<{message: string}>) => {
      toast.error(error?.response?.data?.message || t("toasts.generic_update_failed"));
    },
  });

  return {
    getGeneralQuery,
    updateGeneral,
    isPending,
  };
};
