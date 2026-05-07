import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { getClients, updateClients as updateClientsApi } from "../services/clients";
import type { AccreditationResponse } from "../types";

export const useClients = () => {
  const queryClient = useQueryClient();

  const getClientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  const { mutate: updateClients, isPending } = useMutation({
    mutationFn: ({ data }: { data: FormData }) => updateClientsApi(data),
    onSuccess: (res: AccreditationResponse) => {
      toast.success(res?.message || "Clients updated successfully");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || "Failed to update clients");
    },
  });


  return {
    getClientsQuery,
    updateClients,
    isPending,
  };
};
