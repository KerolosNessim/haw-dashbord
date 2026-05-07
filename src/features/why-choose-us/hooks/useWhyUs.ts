import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getWhyUs, updateWhyUs } from "../services/why-us";
import type { AxiosError } from "axios";

export const useWhyUs = () => {
  const queryClient = useQueryClient();

  const getWhyUsQuery = useQuery({
    queryKey: ["why-us"],
    queryFn: getWhyUs,
  });

  const { mutate: updateWhyUsMutation, isPending } = useMutation({
    mutationFn: updateWhyUs,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["why-us"] });
      toast.success(res.message || "Updated successfully");
    },
    onError: (error: AxiosError<{message: string}>) => {
      toast.error(error?.response?.data?.message || "Failed to update");
    },
  });

  return {
    getWhyUsQuery,
    updateWhyUs: updateWhyUsMutation,
    isPending,
  };
};
