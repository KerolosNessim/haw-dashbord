import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createFaqItem, deleteFaqItem, updateFaqItem } from "../services/faq";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import type { CreateFaqItemInput } from "../types";

export const useFaqItem = (id?: number) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: createItem, isPending: isCreating } = useMutation({
    mutationFn: createFaqItem,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["faq-general"] });
      toast.success(res.message || "FAQ created successfully");
      navigate("/faq");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || "Failed to create FAQ");
    },
  });

  const { mutate: updateItem, isPending: isUpdating } = useMutation({
    mutationFn: (data: CreateFaqItemInput) => updateFaqItem(id!, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["faq-general"] });
      toast.success(res.message || "FAQ updated successfully");
      navigate("/faq");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || "Failed to update FAQ");
    },
  });

  const { mutate: deleteItem, isPending: isDeleting } = useMutation({
    mutationFn: deleteFaqItem,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["faq-general"] });
      toast.success(res.message || "FAQ deleted successfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || "Failed to delete FAQ");
    },
  });

  return {
    createItem,
    isCreating,
    updateItem,
    isUpdating,
    deleteItem,
    isDeleting,
  };
};
