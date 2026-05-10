import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getFaqGeneral, updateFaqGeneral } from "../services/faq";
import type { AxiosError } from "axios";

export const useFaqGeneral = () => {
  const queryClient = useQueryClient();

  const getGeneralQuery = useQuery({
    queryKey: ["faq-general"],
    queryFn: getFaqGeneral,
  });

  const { mutate: updateGeneral, isPending: isUpdating } = useMutation({
    mutationFn: updateFaqGeneral,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["faq-general"] });
      toast.success(res.message || "Updated successfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || "Failed to update");
    },
  });

  return {
    getGeneralQuery,
    updateGeneral,
    isUpdating,
  };
};
