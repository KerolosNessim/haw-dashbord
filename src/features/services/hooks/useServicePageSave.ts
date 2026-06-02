import type { GetServiceResponse } from "../type";
import { resolveApiToastMessage } from "@/lib/api-toast-message";
import { getHttpErrorMessage } from "@/lib/http-error-message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { BasicInfoValues } from "../components/builder/basic-info-form";
import type { ServiceSectionsPayload } from "../service-section-types";
import { saveServicePageApi } from "../services/service-page-api";
import { getServiceQueryNamespace } from "../services/service-resource-config";

export function useServicePageSave() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const scope = getServiceQueryNamespace();

  const { mutateAsync: saveServicePage, isPending } = useMutation({
    mutationFn: ({
      basic,
      sections,
      serviceId,
    }: {
      basic: BasicInfoValues;
      sections: ServiceSectionsPayload;
      serviceId?: number;
    }) => saveServicePageApi(basic, sections, serviceId),
    onSuccess: (data, variables) => {
      toast.success(
        resolveApiToastMessage(data, t("toasts.create_success")),
      );
      const id = variables.serviceId ?? data?.data?.id;
      queryClient.invalidateQueries({ queryKey: ["services", scope] });
      if (id) {
        queryClient.invalidateQueries({ queryKey: ["admin-service", scope, id] });
      }
      return data;
    },
    onError: (error: AxiosError<GetServiceResponse>) => {
      toast.error(
        getHttpErrorMessage(error, {
          403: t("toasts.forbidden"),
          default: t("toasts.service_save_error"),
        }),
      );
    },
  });

  return { saveServicePage, isPending };
}
