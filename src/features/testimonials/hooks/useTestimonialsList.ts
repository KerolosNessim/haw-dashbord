import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getTestimonialsList, updateTestimonialsList } from "../services/testimonials";
import type { AxiosError } from "axios";

export const useTestimonialsList = () => {
  const queryClient = useQueryClient();

  const getListQuery = useQuery({
    queryKey: ["testimonials-list"],
    queryFn: getTestimonialsList,
  });

  const { mutate: updateList, isPending } = useMutation({
    mutationFn: updateTestimonialsList,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["testimonials-list"] });
      toast.success(res.message || "Updated successfully");
    },
    onError: (error: AxiosError<{message: string}>) => {
      toast.error(error?.response?.data?.message || "Failed to update");
    },
  });

  return {
    getListQuery,
    updateList,
    isPending,
  };
};
