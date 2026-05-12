import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getWhyUsItems, updateWhyUsItems } from "../services/why-us";

export const useWhyUsItems = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const getWhyUsItemsQuery  = useQuery({
    queryKey: ["why-us-items"],
    queryFn: getWhyUsItems,
  });

  const { mutate: updateWhyUsItemsMutation, isPending } = useMutation({
    mutationFn: updateWhyUsItems,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["why-us-items"] });
      toast.success(res.message || t("toasts.items_updated"));
    },
    onError: (error: AxiosError<{message: string}>) => {
      toast.error(error?.response?.data?.message || t("toasts.generic_update_failed"));
    },
  });

  return {
    getWhyUsItemsQuery,
    updateWhyUsItems: updateWhyUsItemsMutation,
    isPending,
  };
};
