import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { getClients, updateClients as updateClientsApi } from "../services/clients";
import type { AccreditationResponse } from "../types";

export const useClients = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const getClientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  const { mutate: updateClients, isPending } = useMutation({
    mutationFn: ({ data }: { data: FormData }) => updateClientsApi(data),
    onSuccess: (res: AccreditationResponse) => {
      toast.success(res?.message || t("toasts.clients_updated"));
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || t("toasts.clients_update_failed"));
    },
  });


  return {
    getClientsQuery,
    updateClients,
    isPending,
  };
};
