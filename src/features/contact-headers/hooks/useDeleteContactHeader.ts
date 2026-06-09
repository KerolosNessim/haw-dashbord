import { axiosResponseErrorSummary } from "@/lib/api-error-message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { CONTACT_HEADERS_QUERY_KEY } from "../query-keys";
import { deleteContactHeader } from "../services/contact-headers-api";

export function useDeleteContactHeader() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("translation", { keyPrefix: "contact_headers.api" });

  return useMutation({
    mutationFn: deleteContactHeader,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CONTACT_HEADERS_QUERY_KEY });
      toast.success(t("delete_success"));
    },
    onError: (error: AxiosError<unknown>) => {
      toast.error(axiosResponseErrorSummary(error.response?.data) || t("delete_error"));
    },
  });
}
