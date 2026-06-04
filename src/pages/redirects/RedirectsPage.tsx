import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Can } from "@/features/permissions/components/PermissionGate";
import {
  createRedirect,
  deleteRedirect,
  fetchRedirects,
  updateRedirect,
} from "@/features/redirects/services/redirects-api";
import {
  REDIRECT_RESOURCE_TYPES,
  type RedirectFilters,
  type RedirectFormValues,
  type RedirectLocale,
  type RedirectRow,
} from "@/features/redirects/types";
import { codeNeedsRedirectTarget } from "@/lib/delete-slug-redirect";
import { BLOG_SLUG_REDIRECT_CODES, type BlogSlugRedirectCode } from "@/lib/http-redirect-codes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Loader2, Pencil, Plus, RefreshCw, Route, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const REDIRECTS_QUERY_KEY = ["redirects"] as const;

const emptyForm: RedirectFormValues = {
  source_path: "",
  source_locale: "ar",
  resource_type: "custom",
  resource_id: "",
  status_code: "410",
  target_path: "",
  target_locale: "ar",
  is_active: true,
};

function labelForResource(type: string) {
  return type.replace(/_/g, " ");
}

function formFromRow(row: RedirectRow): RedirectFormValues {
  return {
    source_path: row.source_path || row.source_slug || "",
    source_locale: row.source_locale,
    resource_type: row.resource_type,
    resource_id: row.resource_id ?? "",
    status_code: row.status_code,
    target_path: row.target_path ?? "",
    target_locale: row.target_locale ?? row.source_locale,
    is_active: row.is_active,
  };
}

function RedirectFormDialog({
  open,
  row,
  isPending,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  row: RedirectRow | null;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: RedirectFormValues) => void;
}) {
  const { t } = useTranslation("translation", { keyPrefix: "redirects_page" });
  const [values, setValues] = useState<RedirectFormValues>(() => (row ? formFromRow(row) : emptyForm));

  const needsTarget = codeNeedsRedirectTarget(values.status_code);
  const missingTarget = needsTarget && !values.target_path?.trim();
  const missingSource = !values.source_path.trim();
  const canSubmit = !isPending && !missingSource && !missingTarget;

  const update = <K extends keyof RedirectFormValues>(key: K, value: RedirectFormValues[K]) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "source_locale" && !prev.target_path ? { target_locale: value as RedirectLocale } : {}),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle>{row ? t("dialog.edit_title") : t("dialog.create_title")}</DialogTitle>
          <DialogDescription>
            {t("dialog.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>{t("fields.old_path")}</Label>
            <Input
              dir="ltr"
              value={values.source_path}
              onChange={(e) => update("source_path", e.target.value)}
              placeholder="/ar/blogs/old-article"
              className="rounded-xl"
            />
            {missingSource ? <p className="text-xs text-destructive">{t("validation.old_path_required")}</p> : null}
          </div>

          <div className="space-y-2">
            <Label>{t("fields.locale")}</Label>
            <Select value={values.source_locale} onValueChange={(v) => update("source_locale", v as RedirectLocale)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ar">{t("locales.ar")}</SelectItem>
                <SelectItem value="en">{t("locales.en")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("fields.status")}</Label>
            <Select value={values.status_code} onValueChange={(v) => update("status_code", v as BlogSlugRedirectCode)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BLOG_SLUG_REDIRECT_CODES.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("fields.resource_type")}</Label>
            <Select value={values.resource_type} onValueChange={(v) => update("resource_type", v)}>
              <SelectTrigger className="rounded-xl capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REDIRECT_RESOURCE_TYPES.map((type) => (
                  <SelectItem key={type} value={type} className="capitalize">
                    {t(`resources.${type}`, { defaultValue: labelForResource(type) })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("fields.resource_id")}</Label>
            <Input
              dir="ltr"
              value={values.resource_id ?? ""}
              onChange={(e) => update("resource_id", e.target.value)}
              placeholder={t("placeholders.optional")}
              className="rounded-xl"
            />
          </div>

          {needsTarget ? (
            <>
              <div className="space-y-2 sm:col-span-2">
                <Label>{t("fields.target_path")}</Label>
                <Input
                  dir="ltr"
                  value={values.target_path ?? ""}
                  onChange={(e) => update("target_path", e.target.value)}
                  placeholder="/ar/blogs/new-article"
                  className="rounded-xl"
                />
                {missingTarget ? <p className="text-xs text-destructive">{t("validation.target_required")}</p> : null}
              </div>
              <div className="space-y-2">
                <Label>{t("fields.target_locale")}</Label>
                <Select value={values.target_locale ?? values.source_locale} onValueChange={(v) => update("target_locale", v as RedirectLocale)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">{t("locales.ar")}</SelectItem>
                    <SelectItem value="en">{t("locales.en")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : null}

          <label className="flex items-center gap-2 rounded-xl border bg-muted/20 p-3 text-sm font-medium">
            <Checkbox
              checked={values.is_active}
              onCheckedChange={(checked) => update("is_active", checked === true)}
            />
            {t("fields.active")}
          </label>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            {t("actions.cancel")}
          </Button>
          <Button type="button" className="rounded-xl" disabled={!canSubmit} onClick={() => onSubmit(values)}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : row ? t("actions.save") : t("actions.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function RedirectsPage() {
  const { t } = useTranslation("translation", { keyPrefix: "redirects_page" });
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<RedirectFilters>({});
  const [draftFilters, setDraftFilters] = useState<RedirectFilters>({});
  const [editingRow, setEditingRow] = useState<RedirectRow | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: rows = [], isLoading, isFetching, isError, error } = useQuery({
    queryKey: [...REDIRECTS_QUERY_KEY, filters],
    queryFn: () => fetchRedirects(filters),
  });

  const createMutation = useMutation({
    mutationFn: createRedirect,
    onSuccess: () => {
      toast.success(t("toasts.created"));
      queryClient.invalidateQueries({ queryKey: REDIRECTS_QUERY_KEY });
      setIsFormOpen(false);
    },
    onError: () => toast.error(t("toasts.create_error")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: RedirectFormValues }) => updateRedirect(id, values),
    onSuccess: () => {
      toast.success(t("toasts.updated"));
      queryClient.invalidateQueries({ queryKey: REDIRECTS_QUERY_KEY });
      setIsFormOpen(false);
      setEditingRow(null);
    },
    onError: () => toast.error(t("toasts.update_error")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRedirect,
    onSuccess: () => {
      toast.success(t("toasts.deleted"));
      queryClient.invalidateQueries({ queryKey: REDIRECTS_QUERY_KEY });
    },
    onError: () => toast.error(t("toasts.delete_error")),
  });

  const isMutating = createMutation.isPending || updateMutation.isPending;

  const submitForm = (values: RedirectFormValues) => {
    if (editingRow) {
      updateMutation.mutate({ id: editingRow.id, values });
      return;
    }
    createMutation.mutate(values);
  };

  const applyFilters = () => setFilters(draftFilters);
  const resetFilters = () => {
    setDraftFilters({});
    setFilters({});
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 pb-20">
      <div className="flex flex-col justify-between gap-6 border-b pb-8 md:flex-row md:items-center">
        <div className="flex items-center gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
            <Route className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900">{t("title")}</h1>
            <p className="text-lg font-medium text-muted-foreground">
              {t("description")}
            </p>
          </div>
        </div>

        <Can permission="redirects.create">
          <Button
            size="lg"
            className="h-14 rounded-2xl px-8 font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95"
            onClick={() => {
              setEditingRow(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-6 w-6" />
            {t("actions.new")}
          </Button>
        </Can>
      </div>

      <div className="rounded-3xl border bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_160px_140px_auto] md:items-end">
          <div className="space-y-2">
            <Label>{t("filters.search")}</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={draftFilters.search ?? ""}
                onChange={(e) => setDraftFilters((prev) => ({ ...prev, search: e.target.value }))}
                placeholder={t("filters.search_placeholder")}
                className="rounded-xl pl-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("filters.type")}</Label>
            <Select
              value={draftFilters.resource_type || "all"}
              onValueChange={(v) => setDraftFilters((prev) => ({ ...prev, resource_type: v === "all" ? "" : v }))}
            >
              <SelectTrigger className="rounded-xl capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.all")}</SelectItem>
                {REDIRECT_RESOURCE_TYPES.map((type) => (
                  <SelectItem key={type} value={type} className="capitalize">
                    {t(`resources.${type}`, { defaultValue: labelForResource(type) })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("filters.status")}</Label>
            <Select
              value={draftFilters.status_code || "all"}
              onValueChange={(v) => setDraftFilters((prev) => ({ ...prev, status_code: v === "all" ? "" : v }))}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.all")}</SelectItem>
                {BLOG_SLUG_REDIRECT_CODES.map((code) => (
                  <SelectItem key={code} value={code}>{code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("filters.locale")}</Label>
            <Select
              value={draftFilters.locale || "all"}
              onValueChange={(v) => setDraftFilters((prev) => ({ ...prev, locale: v === "all" ? "" : v }))}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.all")}</SelectItem>
                <SelectItem value="ar">AR</SelectItem>
                <SelectItem value="en">EN</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button type="button" className="rounded-xl" onClick={applyFilters}>
              {t("actions.apply")}
            </Button>
            <Button type="button" variant="outline" className="rounded-xl" onClick={resetFilters}>
              <RefreshCw className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
        {isError ? (
          <p className="border-b border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {(error as Error)?.message || t("errors.load")}
          </p>
        ) : null}
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="py-5 ps-6 font-bold">{t("table.old_url")}</TableHead>
              <TableHead className="font-bold">{t("table.status")}</TableHead>
              <TableHead className="font-bold">{t("table.target")}</TableHead>
              <TableHead className="font-bold">{t("table.type")}</TableHead>
              <TableHead className="font-bold">{t("table.locale")}</TableHead>
              <TableHead className="font-bold">{t("table.state")}</TableHead>
              <TableHead className="w-[140px] py-5 pe-6 font-bold">{t("table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || isFetching ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`sk-${i}`}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j}>
                      <div className="h-8 animate-pulse rounded-lg bg-muted/40" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length > 0 ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="py-5 ps-6">
                    <p className="max-w-[360px] truncate font-mono text-sm" dir="ltr">{row.source_path || row.source_slug}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={codeNeedsRedirectTarget(row.status_code) ? "default" : "secondary"}>
                      {row.status_code}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {row.target_path ? (
                      <div className="flex max-w-[320px] items-center gap-2 text-sm" dir="ltr">
                        <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                        <span className="truncate font-mono">{row.target_path}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="capitalize">
                    {t(`resources.${row.resource_type}`, { defaultValue: labelForResource(row.resource_type) })}
                  </TableCell>
                  <TableCell>{row.source_locale.toUpperCase()}</TableCell>
                  <TableCell>
                    <Badge variant={row.is_active ? "default" : "outline"}>
                      {row.is_active ? t("state.active") : t("state.inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-5 pe-6">
                    <div className="flex items-center gap-2">
                      <Can permission="redirects.update">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="rounded-xl"
                          onClick={() => {
                            setEditingRow(row);
                            setIsFormOpen(true);
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                      </Can>
                      <Can permission="redirects.delete">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="rounded-xl text-rose-600 hover:bg-rose-50"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (window.confirm(t("delete_confirm"))) deleteMutation.mutate(row.id);
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </Can>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="py-16 text-center text-muted-foreground">
                  {t("empty")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <RedirectFormDialog
        key={editingRow?.id ?? "create"}
        open={isFormOpen}
        row={editingRow}
        isPending={isMutating}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingRow(null);
        }}
        onSubmit={submitForm}
      />
    </div>
  );
}
