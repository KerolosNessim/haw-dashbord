import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getTestimonialsGeneral, updateTestimonialsGeneral } from "../services/testimonials";
import type { AxiosError } from "axios";

export const useTestimonialsGeneral = () => {
  const queryClient = useQueryClient();

  const getGeneralQuery = useQuery({
    queryKey: ["testimonials-general"],
    queryFn: getTestimonialsGeneral,
  });

  const { mutate: updateGeneral, isPending } = useMutation({
    mutationFn: updateTestimonialsGeneral,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["testimonials-general"] });
      toast.success(res.message || "Updated successfully");
    },
    onError: (error: AxiosError<{message: string}>) => {
      toast.error(error?.response?.data?.message || "Failed to update");
    },
  });

  return {
    getGeneralQuery,
    updateGeneral,
    isPending,
  };
};
