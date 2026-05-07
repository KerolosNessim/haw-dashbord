import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { getAccreditations, updateAccreditation } from "../services/dependacies";

export const useAccreditations = () => {
  const queryClient = useQueryClient();

  const getAccreditationsQuery = useQuery({
    queryKey: ["accreditations"],
    queryFn: getAccreditations,
  });

  const { mutate: updateAccred, isPending } = useMutation({
    mutationFn: ({  data }: {  data: FormData }) =>
      updateAccreditation( data),
    onSuccess: (res) => {
      toast.success(res?.message || "Accreditation updated successfully");
      queryClient.invalidateQueries({ queryKey: ["accreditations"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || "Failed to update accreditation");
    },
  });

  return {
    getAccreditationsQuery,
    updateAccred,
    isPending,
  };
};
