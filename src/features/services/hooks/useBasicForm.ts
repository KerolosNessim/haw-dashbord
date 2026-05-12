import type { LoginResponse } from "@/features/auth/types";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { BasicInfoValues } from "../components/builder/basic-info-form";
import { basicFormApi } from "../services/basic-form";
import { resolveApiToastMessage } from "@/lib/api-toast-message";

export const useBasicForm = () => {
  const { t } = useTranslation();

  const {mutateAsync: basicFormMutation, isPending} = useMutation({
    mutationFn: (values: BasicInfoValues) => basicFormApi(values),
    onSuccess: (data) => {
      toast.success(resolveApiToastMessage(data, t("toasts.create_success")));
      return data;
    },
    onError: (error: AxiosError<LoginResponse>) => {
      const fromApi =
        typeof error?.response?.data?.message === "string"
          ? error.response.data.message.trim()
          : "";
      toast.error(fromApi || t("toasts.service_save_error"));
    }
  })

  return {basicFormMutation, isPending}
}