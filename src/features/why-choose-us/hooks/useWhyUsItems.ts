import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import { getWhyUsItems, updateWhyUsItems } from "../services/why-us";

export const useWhyUsItems = () => {
  const queryClient = useQueryClient();

  const getWhyUsItemsQuery  = useQuery({
    queryKey: ["why-us-items"],
    queryFn: getWhyUsItems,
  });

  const { mutate: updateWhyUsItemsMutation, isPending } = useMutation({
    mutationFn: updateWhyUsItems,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["why-us-items"] });
      toast.success(res.message || "Items updated successfully");
    },
    onError: (error: AxiosError<{message: string}>) => {
      toast.error(error?.response?.data?.message || "Failed to update");
    },
  });

  return {
    getWhyUsItemsQuery,
    updateWhyUsItems: updateWhyUsItemsMutation,
    isPending,
  };
};
