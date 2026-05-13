import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { createFaqItem, deleteFaqItem, updateFaqItem } from "../services/faq";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import type { CreateFaqItemInput } from "../types";

export const useFaqItem = (id?: number) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: createItem, isPending: isCreating } = useMutation({
    mutationFn: createFaqItem,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["faq-general"] });
      toast.success(res.message || t("toasts.faq_created"));
      navigate("/faq");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || t("toasts.faq_create_failed"));
    },
  });

  const { mutate: updateItem, isPending: isUpdating } = useMutation({
    mutationFn: (data: CreateFaqItemInput) => updateFaqItem(id!, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["faq-general"] });
      toast.success(res.message || t("toasts.faq_updated"));
      navigate("/faq");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || t("toasts.faq_update_failed"));
    },
  });

  const { mutate: deleteItem, isPending: isDeleting } = useMutation({
    mutationFn: deleteFaqItem,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["faq-general"] });
      toast.success(res.message || t("toasts.faq_deleted"));
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || t("toasts.faq_delete_failed"));
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
