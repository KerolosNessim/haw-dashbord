import { axiosResponseErrorSummary } from "@/lib/api-error-message";
import { resolveApiToastMessage } from "@/lib/api-toast-message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { CONTACT_HEADERS_QUERY_KEY } from "../query-keys";
import {
  createContactHeader,
  updateContactHeader,
  type ContactHeaderFormValues,
} from "../services/contact-headers-api";

export function useUpsertContactHeader() {
  const queryClient = useQueryClient();
  const { t: tRoot } = useTranslation();
  const { t } = useTranslation("translation", { keyPrefix: "contact_headers.api" });

  const { mutateAsync: upsertMutation, isPending } = useMutation({
    mutationFn: ({
      values,
      headerId,
    }: {
      values: ContactHeaderFormValues;
      headerId?: number | null;
    }) =>
      headerId != null && headerId > 0
        ? updateContactHeader(headerId, values)
        : createContactHeader(values),
    onSuccess: (res, vars) => {
      void queryClient.invalidateQueries({ queryKey: CONTACT_HEADERS_QUERY_KEY });
      const isUpdate = vars.headerId != null && vars.headerId > 0;
      toast.success(
        resolveApiToastMessage(res, isUpdate ? t("update_success") : t("create_success"), tRoot),
      );
    },
    onError: (error: AxiosError<unknown>, vars) => {
      const isUpdate = vars.headerId != null && vars.headerId > 0;
      toast.error(
        axiosResponseErrorSummary(error.response?.data) ||
          (isUpdate ? t("update_error") : t("create_error")),
      );
    },
  });

  return { upsertMutation, isPending };
}
