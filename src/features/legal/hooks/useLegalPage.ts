import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getLegalPageApi, updateLegalPageApi } from "../services/legal-api";
import type { LegalPageType } from "../types";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const useLegalPage = (type: LegalPageType) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["legal-page", type],
    queryFn: () => getLegalPageApi(type),
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => updateLegalPageApi(type, data),
    onSuccess: () => {
      toast.success(t("toasts.generic_updated"));
      queryClient.invalidateQueries({ queryKey: ["legal-page", type] });
    },
    onError: (error: any) => {
      toast.error(error.message || t("toasts.generic_update_failed"));
    },
  });

  return {
    ...query,
    updatePage: mutation.mutate,
    isUpdating: mutation.isPending,
  };
};
