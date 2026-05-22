import { useExportService } from "@/features/backup-export/hooks/use-export-service";
import { Download, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Service } from "../type";
import { serviceCoverUrl } from "../utils/service-mapper";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAdminServiceApi } from "../services/admin-services";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

type ServiceCardProps = {
  service: Service;
};

export default function ServiceCard({ service }: ServiceCardProps) {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "services" });
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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

  const { mutate: exportService, isPending: isExporting } = useExportService();

  const { mutate: deleteService, isPending } = useMutation({
    mutationFn: () => deleteAdminServiceApi(service.id),
    onSuccess: () => {
      toast.success(t("delete_success"));
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setIsDeleteDialogOpen(false);
    },
    onError: () => {
      toast.error(t("delete_error"));
    },
  });

  return (
    <div className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Image */}
      <div className="h-48 w-full overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={cardAlt}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/30 text-xs text-muted-foreground">
            {t("no_cover")}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          {service?.title?.ar || service?.title?.en}
        </h3>

        <p className="text-sm text-gray-600 line-clamp-3">
          {service?.description?.ar || service?.description?.en}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 p-5 pt-0">
        <Link
          to={`/services/edit/${service?.id}`}
          className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition hover:bg-gray-100"
        >
          <Pencil size={16} />
          {t("edit_service")}
        </Link>

        <button
          type="button"
          disabled={isExporting}
          onClick={() => exportService(service.id)}
          className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition hover:bg-gray-100 disabled:opacity-50"
        >
          {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {t("export_excel")}
        </button>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg bg-red-500 px-3 py-1.5 text-sm text-white transition hover:bg-red-600">
              <Trash2 size={16} />
              {t("delete_service")}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("delete_confirm")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("delete_confirm_description")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>
                {t("form.cancel") || "Cancel"}
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={isPending}
                onClick={(e) => {
                  e.preventDefault();
                  deleteService();
                }}
                className="bg-red-500 hover:bg-red-600"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("delete_service")
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
