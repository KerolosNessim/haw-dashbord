import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import { getSolutions, updateSolutions } from "../services/solutions";

export const useSolutions = () => {
  const queryClient = useQueryClient();

  const getSolutionsQuery = useQuery({
    queryKey: ["solutions"],
    queryFn: getSolutions,
  });

  const { mutate: updateSolutionsMutation, isPending } = useMutation({
    mutationFn: updateSolutions,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["solutions"] });
      toast.success(res.message || "Solutions updated successfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || "Failed to update solutions");
    },
  });

  return {
    getSolutionsQuery,
    updateSolutions: updateSolutionsMutation,
    isPending,
  };
};
