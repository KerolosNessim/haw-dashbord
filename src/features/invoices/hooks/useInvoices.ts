import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getHttpErrorMessage } from "@/lib/http-error-message";
import { toast } from "sonner";
import { INVOICES_QUERY_KEY } from "../query-keys";
import {
  createInvoice,
  deleteInvoice,
  fetchInvoiceById,
  fetchInvoicesPage,
} from "../services/invoices-api";
import type { CreateInvoicePayload } from "../types";

export function useInvoices(params: { page?: number; search?: string } = {}) {
  const page = params.page && params.page > 0 ? params.page : 1;
  const search = params.search?.trim() || undefined;

  const query = useQuery({
    queryKey: [...INVOICES_QUERY_KEY, { page, search: search ?? null }] as const,
    queryFn: () => fetchInvoicesPage({ page, search }),
    staleTime: 20_000,
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    rows: query.data?.rows ?? [],
    meta: query.data?.meta ?? { current_page: 1, last_page: 1, per_page: 15, total: 0 },
  };
}

export function useInvoiceDetail(id: string | null) {
  return useQuery({
    queryKey: [...INVOICES_QUERY_KEY, "detail", id] as const,
    queryFn: () => (id ? fetchInvoiceById(id) : null),
    enabled: Boolean(id),
  });
}

export function useCreateInvoice() {
  const { t } = useTranslation("translation", { keyPrefix: "invoices" });
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateInvoicePayload) => createInvoice(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
      toast.success(t("create_success"));
    },
    onError: (err: unknown) => {
      toast.error(getHttpErrorMessage(err, { default: t("create_error") }));
    },
  });
}

export function useDeleteInvoice() {
  const { t } = useTranslation("translation", { keyPrefix: "invoices" });
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteInvoice(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
      toast.success(t("delete_success"));
    },
    onError: (err: Error) => {
      toast.error(err.message || t("delete_error"));
    },
  });
}
