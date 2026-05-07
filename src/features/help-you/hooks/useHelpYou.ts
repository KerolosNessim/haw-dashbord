import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import { getHelpYou, updateHelpYou } from "../services/help-you";

export const useHelpYou = () => {
  const queryClient = useQueryClient();

  const getHelpYouQuery = useQuery({
    queryKey: ["help-you"],
    queryFn: getHelpYou,
  });

  const { mutate: updateHelpYouMutation, isPending } = useMutation({
    mutationFn: updateHelpYou,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["help-you"] });
      toast.success(res.message || "Updated successfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || "Failed to update");
    },
  });

  return {
    getHelpYouQuery,
    updateHelpYou: updateHelpYouMutation,
    isPending,
  };
};
