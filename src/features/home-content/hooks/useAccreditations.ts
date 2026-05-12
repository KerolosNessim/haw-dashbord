import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { getAccreditations, updateAccreditation } from "../services/dependacies";

export const useAccreditations = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const getAccreditationsQuery = useQuery({
    queryKey: ["accreditations"],
    queryFn: getAccreditations,
  });

  const { mutate: updateAccred, isPending } = useMutation({
    mutationFn: ({  data }: {  data: FormData }) =>
      updateAccreditation( data),
    onSuccess: (res) => {
      toast.success(res?.message || t("toasts.accreditation_updated"));
      queryClient.invalidateQueries({ queryKey: ["accreditations"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || t("toasts.accreditation_update_failed"));
    },
  });

  return {
    getAccreditationsQuery,
    updateAccred,
    isPending,
  };
};
