import { ExcelImportButton } from "@/features/backup-export/components/excel-import-button";
import { useExportService } from "@/features/backup-export/hooks/use-export-service";
import { useImportService } from "@/features/backup-export/hooks/use-import-service";
import { Download, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Service } from "../type";
import { serviceCoverUrl } from "../utils/service-mapper";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAdminServiceApi } from "../services/admin-services";
import { toast } from "sonner";
import { DeleteWithSlugRedirectDialog } from "@/components/delete-with-slug-redirect-dialog";
import type { DeleteSlugRedirectPayload } from "@/lib/delete-slug-redirect";
import { Can } from "@/features/permissions/components/PermissionGate";
import { useState } from "react";
import {
  getServiceQueryNamespace,
  getServicesUiBasePath,
} from "../services/service-resource-config";

type ServiceCardProps = {
  service: Service;
};

export default function ServiceCard({ service }: ServiceCardProps) {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "services" });
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const scope = getServiceQueryNamespace();
  const uiBasePath = getServicesUiBasePath();
  const coverUrl = serviceCoverUrl(
    service.image,
    i18n.language?.startsWith("en") ? "en" : "ar",
  );
  const alt = service.image_alt;
  const cardAlt =
    (i18n.language?.startsWith("en")
      ? alt?.en || alt?.ar
      : alt?.ar || alt?.en) ||
    service.title.en ||
    service.title.ar;

  const isEn = i18n.language?.startsWith("en");
  const titleHtml = (isEn
    ? service.title?.en || service.title?.ar
    : service.title?.ar || service.title?.en) ?? "";
  const descriptionHtml = (isEn
    ? service.description?.en || service.description?.ar
    : service.description?.ar || service.description?.en) ?? "";

  const richHtmlClassName =
    "cms-html-preview [&_a]:text-primary [&_a]:underline [&_img]:my-2 [&_img]:max-h-24 [&_img]:max-w-full [&_img]:rounded-md [&_p:last-child]:mb-0 [&_p]:mb-1";

  const { mutate: exportService, isPending: isExporting } = useExportService();
  const { mutate: importService, isPending: isImporting } = useImportService();

  const { mutate: deleteService, isPending } = useMutation({
    mutationFn: (redirect: DeleteSlugRedirectPayload) =>
      deleteAdminServiceApi(service.id, redirect),
    onSuccess: () => {
      toast.success(t("delete_success"));
      queryClient.invalidateQueries({ queryKey: ["services", scope] });
      setIsDeleteDialogOpen(false);
    },
    onError: () => {
      toast.error(t("delete_error"));
    },
  });

  const handleDeleteConfirm = (redirect: DeleteSlugRedirectPayload) => {
    deleteService(redirect);
  };

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Image */}
      <div className="h-48 min-h-48 w-full shrink-0 overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={cardAlt}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full min-h-48 w-full items-center justify-center bg-muted/30 text-xs text-muted-foreground">
            {t("no_cover")}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3
          className={`min-h-14 line-clamp-2 text-lg font-semibold leading-7 text-gray-900 ${richHtmlClassName} [&_p]:inline`}
          dangerouslySetInnerHTML={{
            __html: titleHtml.trim() || "\u00a0",
          }}
        />

        <div
          className={`min-h-[3.75rem] line-clamp-3 text-sm leading-5 text-gray-600 ${richHtmlClassName}`}
          dangerouslySetInnerHTML={{
            __html: descriptionHtml.trim() || "\u00a0",
          }}
        />
      </div>

      {/* Actions */}
      <div className="mt-auto flex flex-wrap items-center gap-2 p-5 pt-0">
        <Can permission="services.update">
          <Link
            to={`${uiBasePath}/edit/${service?.id}`}
            className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition hover:bg-gray-100"
          >
            <Pencil size={16} />
            {t("edit_service")}
          </Link>
        </Can>

        <Can permission="services.view">
          <button
            type="button"
            disabled={isExporting || isImporting}
            onClick={() => exportService(service.id)}
            className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition hover:bg-gray-100 disabled:opacity-50"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {t("export_excel")}
          </button>
        </Can>

        <Can permission="services.create">
          <ExcelImportButton
            label={t("import_excel")}
            size="default"
            variant="outline"
            className="h-auto rounded-lg border px-3 py-1.5 text-sm font-normal shadow-none"
            isPending={isImporting}
            disabled={isExporting}
            onFile={(file) => importService(file)}
          />
        </Can>

        <Can permission="services.delete">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-red-500 px-3 py-1.5 text-sm text-white transition hover:bg-red-600"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 size={16} />
            {t("delete_service")}
          </button>
          <DeleteWithSlugRedirectDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            title={t("delete_confirm")}
            description={t("delete_confirm_description")}
            redirectLabelKeyPrefix="services.form"
            cancelLabel={t("form.cancel") || "Cancel"}
            deleteLabel={isPending ? "…" : t("delete_service")}
            isPending={isPending}
            onConfirm={handleDeleteConfirm}
          />
        </Can>
      </div>
    </div>
  );
}
