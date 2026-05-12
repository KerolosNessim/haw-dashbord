import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getTestimonialsList, updateTestimonialsList } from "../services/testimonials";
import type { AxiosError } from "axios";

export const useTestimonialsList = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const getListQuery = useQuery({
    queryKey: ["testimonials-list"],
    queryFn: getTestimonialsList,
  });

  const { mutate: updateList, isPending } = useMutation({
    mutationFn: updateTestimonialsList,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["testimonials-list"] });
      toast.success(res.message || t("toasts.generic_updated"));
    },
    onError: (error: AxiosError<{message: string}>) => {
      toast.error(error?.response?.data?.message || t("toasts.generic_update_failed"));
    },
  });

  return {
    getListQuery,
    updateList,
    isPending,
  };
};
