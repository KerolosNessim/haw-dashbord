import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ExcelImportButton } from "@/features/backup-export/components/excel-import-button";
import { useExportServicesBulk } from "@/features/backup-export/hooks/use-export-services-bulk";
import { useImportServicesBulk } from "@/features/backup-export/hooks/use-import-services-bulk";
import ServiceCard from "@/features/services/components/services-card";
import { useGetServices } from "@/features/services/hooks/useGetServices";
import Loader from "@/features/shared/components/loader";
import { Download, Loader2, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Can } from "@/features/permissions/components/PermissionGate";
import { Link } from "react-router-dom";

export default function ServicesPage() {
  const { t } = useTranslation("translation", { keyPrefix: "services" });
  const { data, isLoading } = useGetServices();
  const services = data?.data?.data ?? [];
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set());
  const { mutate: exportBulk, isPending: isExporting } = useExportServicesBulk();
  const { mutate: importBulk, isPending: isImporting } = useImportServicesBulk();

  const allIds = useMemo(() => services.map((s) => s.id), [services]);
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.has(id));
  const someSelected = selectedIds.size > 0;

  const toggleOne = (id: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(allIds) : new Set());
  };

  const exportIds = (ids: number[]) => {
    exportBulk(ids);
  };

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Can permission="services.view">
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={isExporting || isImporting || !someSelected}
            className="rounded-xl font-semibold"
            onClick={() => exportIds([...selectedIds])}
          >
            {isExporting ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Download className="mr-2 size-4" />
            )}
            {t("export_selected", { count: selectedIds.size })}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={isExporting || isImporting || services.length === 0}
            className="rounded-xl font-semibold"
            onClick={() => exportIds(allIds)}
          >
            {isExporting ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Download className="mr-2 size-4" />
            )}
            {t("export_all")}
          </Button>
          </Can>
          <Can permission="services.create">
            <ExcelImportButton
              label={t("import_excel")}
              isPending={isImporting}
              disabled={isExporting}
              onFile={(file) => importBulk(file)}
            />
          </Can>
          <Can permission="services.create">
            <Button asChild size="lg" className="rounded-xl">
              <Link to="/services/create" className="flex items-center gap-2">
                <Plus />
                {t("add_service")}
              </Link>
            </Button>
          </Can>
        </div>
      </div>

      {services.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
            <Checkbox
              checked={allSelected}
              onCheckedChange={(v) => toggleAll(v === true)}
              aria-label={t("select_all")}
            />
            {t("select_all")}
          </label>
          {someSelected ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 rounded-lg font-semibold"
              onClick={() => setSelectedIds(new Set())}
            >
              {t("clear_selection")}
            </Button>
          ) : null}
          <span className="text-sm text-muted-foreground">
            {t("import_export_hint")}
          </span>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <div key={service.id} className="relative h-full">
            <div className="absolute start-3 top-3 z-10 rounded-lg bg-white/95 p-1 shadow-sm">
              <Checkbox
                checked={selectedIds.has(service.id)}
                onCheckedChange={(v) => toggleOne(service.id, v === true)}
                aria-label={t("select_service")}
              />
            </div>
            <ServiceCard service={service} />
          </div>
        ))}
      </div>
    </div>
  );
}
