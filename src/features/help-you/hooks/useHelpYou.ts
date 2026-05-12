import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getHelpYou, updateHelpYou } from "../services/help-you";

export const useHelpYou = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const getHelpYouQuery = useQuery({
    queryKey: ["help-you"],
    queryFn: getHelpYou,
  });

  const { mutate: updateHelpYouMutation, isPending } = useMutation({
    mutationFn: updateHelpYou,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["help-you"] });
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
  };
};
