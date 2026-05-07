import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import { getSolutionItems, updateSolutionItems } from "../services/solutions";

export const useSolutionItems = () => {
  const queryClient = useQueryClient();

  const getSolutionItemsQuery = useQuery({
    queryKey: ["solution-items"],
    queryFn: getSolutionItems,
  });

  const { mutate: updateSolutionItemsMutation, isPending } = useMutation({
    mutationFn: updateSolutionItems,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["solution-items"] });
      toast.success(res.message || "Solution items updated successfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || "Failed to update solution items");
    },
  });

  return {
    getSolutionItemsQuery,
    updateSolutionItems: updateSolutionItemsMutation,
    isPending,
  };
};
