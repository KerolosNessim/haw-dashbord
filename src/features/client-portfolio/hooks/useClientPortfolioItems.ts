import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getHttpErrorMessage } from "@/lib/http-error-message";
import {
  createPortfolioItem,
  deletePortfolioItem,
  fetchPortfolioItem,
  fetchPortfolioItems,
  updatePortfolioItem,
} from "../services/client-portfolio-api";
import type { PortfolioItem, PortfolioItemFormValues } from "../types";

const LIST_KEY = ["client-portfolio", "items"] as const;

type CreateResponse = { message?: string; item?: PortfolioItem | null };
type UpdateResponse = { message?: string; item?: PortfolioItem | null };

function upsertInList(
  list: PortfolioItem[] | undefined,
  item: PortfolioItem,
): PortfolioItem[] {
  const prev = list ?? [];
  const idx = prev.findIndex((row) => row.id === item.id);
  const next = idx >= 0 ? prev.map((row, i) => (i === idx ? item : row)) : [...prev, item];
  return next.sort((a, b) => a.sort_order - b.sort_order);
}

export function useClientPortfolioItems() {
  const { t } = useTranslation("translation", { keyPrefix: "client_portfolio" });
  const queryClient = useQueryClient();

  const itemsQuery = useQuery({
    queryKey: LIST_KEY,
    queryFn: fetchPortfolioItems,
    retry: 1,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: LIST_KEY });
  };

  const createMutation = useMutation({
    mutationFn: createPortfolioItem,
    onSuccess: (res: CreateResponse) => {
      toast.success(res?.message || t("items.toast_created"));
      if (res?.item) {
        queryClient.setQueryData<PortfolioItem[]>(LIST_KEY, (old) =>
          upsertInList(old, res.item!),
        );
      }
      invalidate();
    },
    onError: (error: unknown) => {
      toast.error(getHttpErrorMessage(error, { default: t("items.toast_error") }));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: PortfolioItemFormValues }) =>
      updatePortfolioItem(id, values),
    onSuccess: (res: UpdateResponse) => {
      toast.success(res?.message || t("items.toast_saved"));
      if (res?.item) {
        queryClient.setQueryData<PortfolioItem[]>(LIST_KEY, (old) =>
          upsertInList(old, res.item!),
        );
      }
      invalidate();
    },
    onError: (error: unknown) => {
      toast.error(getHttpErrorMessage(error, { default: t("items.toast_error") }));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePortfolioItem,
    onSuccess: (res) => {
      toast.success(res?.message || t("items.toast_deleted"));
      invalidate();
    },
    onError: (error: unknown) => {
      toast.error(getHttpErrorMessage(error, { default: t("items.toast_error") }));
    },
  });

  return {
    itemsQuery,
    fetchItem: fetchPortfolioItem,
    createItem: createMutation.mutate,
    createItemAsync: createMutation.mutateAsync,
    updateItem: updateMutation.mutate,
    updateItemAsync: updateMutation.mutateAsync,
    deleteItem: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    createError: createMutation.error,
    updateError: updateMutation.error,
    resetCreateError: () => createMutation.reset(),
    resetUpdateError: () => updateMutation.reset(),
  };
}
