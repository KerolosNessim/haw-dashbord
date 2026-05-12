import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getWhyUs, updateWhyUs } from "../services/why-us";
import type { AxiosError } from "axios";

export const useWhyUs = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const getWhyUsQuery = useQuery({
    queryKey: ["why-us"],
    queryFn: getWhyUs,
  });

  const { mutate: updateWhyUsMutation, isPending } = useMutation({
    mutationFn: updateWhyUs,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["why-us"] });
      toast.success(res.message || t("toasts.generic_updated"));
    },
    onError: (error: AxiosError<{message: string}>) => {
      toast.error(error?.response?.data?.message || t("toasts.generic_update_failed"));
    },
  });

  return {
    getWhyUsQuery,
    updateWhyUs: updateWhyUsMutation,
    isPending,
  };
};
