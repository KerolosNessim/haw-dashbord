import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getHeroContent, updateHeroContent } from "../services/hero"
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { getHttpErrorMessage } from "@/lib/http-error-message";

export const useHero = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const heroErrorFallbacks = {
    403: t("toasts.forbidden"),
    401: t("toasts.unauthorized"),
    500: t("toasts.server_error"),
    network: t("toasts.network_error"),
  } as const;

  const getHero = useQuery({
    queryKey: ["hero"],
    queryFn: getHeroContent,
  })

  const { mutate: updateHero, isPending } = useMutation({
    mutationFn: updateHeroContent,
    onSuccess: (res) => {
      toast.success(res?.message || t("toasts.hero_updated"));
      queryClient.invalidateQueries({ queryKey: ["hero"] });
    },
    onError: (error: AxiosError<unknown>) => {
      toast.error(
        getHttpErrorMessage(error, {
          ...heroErrorFallbacks,
          default: t("toasts.hero_update_failed"),
        }),
      );
    },
  })

  return {
    getHero,
    updateHero,
    isPending,
    heroErrorFallbacks,
  }
}
