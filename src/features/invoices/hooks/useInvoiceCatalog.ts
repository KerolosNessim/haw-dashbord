import { useQuery } from "@tanstack/react-query";
import { INVOICE_CATALOG_QUERY_KEY } from "../query-keys";
import { fetchInvoiceCatalogOptions } from "../services/invoice-catalog-api";

export function useInvoiceCatalog() {
  return useQuery({
    queryKey: INVOICE_CATALOG_QUERY_KEY,
    queryFn: fetchInvoiceCatalogOptions,
    staleTime: 60_000,
  });
}
