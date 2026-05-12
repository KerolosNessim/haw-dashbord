import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getHeroContent, updateHeroContent } from "../services/hero"
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { AxiosError } from "axios";

export const useHero = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const getHero = useQuery({
    queryKey: ["hero"],
    queryFn: getHeroContent,
  })

  const {mutate:updateHero,isPending} = useMutation({
    mutationFn: updateHeroContent,
    onSuccess: (res) => {
      toast.success(res?.message || t("toasts.hero_updated"));
      queryClient.invalidateQueries({ queryKey: ["hero"] });
    },
    onError: (error:AxiosError<{message:string}>) => {
      toast.error(error?.response?.data?.message || t("toasts.hero_update_failed"));
    },
  })
  return {
    getHero,
    updateHero,
    isPending
  }
} 