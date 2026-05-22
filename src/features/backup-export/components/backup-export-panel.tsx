import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { downloadWorkbook, parseWorkbookFile, workbookFromSheets } from "@/lib/excel-io";
import {
  buildFullBackupSheets,
  buildServicesOnlySheets,
  buildTemplateSheets,
  importBackupWorkbook,
  type ImportResult,
} from "@/features/backup-export/services/content-backup-service";
import { Download, FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

function formatDateStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

function summarizeImport(result: ImportResult, t: (key: string, opts?: object) => string): string {
  const parts = [
    t("import_summary_blogs", {
      created: result.blogs.created,
      updated: result.blogs.updated,
      failed: result.blogs.failed,
    }),
    t("import_summary_services", {
      created: result.services.created,
      updated: result.services.updated,
      failed: result.services.failed,
    }),
    t("import_summary_legal", {
      updated: result.legal.updated,
      failed: result.legal.failed,
    }),
    t("import_summary_faq_items", {
      created: result.faqItems.created,
      updated: result.faqItems.updated,
      failed: result.faqItems.failed,
    }),
  ];
  if (result.faqGeneral) parts.push(t("import_summary_faq_general_ok"));
  return parts.join(" · ");
}

export default function BackupExportPanel() {
  const { t } = useTranslation("translation", { keyPrefix: "backup_export" });
  const fileRef = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const runExport = async () => {
    setExporting(true);
    try {
      const sheets = await buildFullBackupSheets();
      const wb = workbookFromSheets(sheets);
      downloadWorkbook(wb, `howeyah-backup-${formatDateStamp()}.xlsx`);
      toast.success(t("export_success"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("export_error"));
    } finally {
      setExporting(false);
    }
  };

  const runTemplate = () => {
    const wb = workbookFromSheets(buildTemplateSheets());
    downloadWorkbook(wb, `howeyah-import-template.xlsx`);
    toast.success(t("template_success"));
  };

  const runImport = async (file: File) => {
    setImporting(true);
    try {
      const sheets = await parseWorkbookFile(file);
      const result = await importBackupWorkbook(sheets);
      toast.success(summarizeImport(result, t));
      if (result.errors.length) {
        console.warn("[backup import]", result.errors);
        toast.warning(t("import_partial", { count: result.errors.length }));
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("import_error"));
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Download className="size-5 text-primary" />
            {t("export_title")}
          </CardTitle>
          <CardDescription>{t("export_description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="list-disc space-y-1 ps-5 text-sm text-muted-foreground">
            <li>{t("export_sheet_blogs")}</li>
            <li>{t("export_sheet_services")}</li>
            <li>{t("export_sheet_pages")}</li>
            <li>{t("export_sheet_faq")}</li>
            <li>{t("export_sheet_about")}</li>
          </ul>
          <Button
            type="button"
            size="lg"
            className="w-full rounded-xl font-bold"
            disabled={exporting || importing}
            onClick={() => void runExport()}
          >
            {exporting ? (
              <Loader2 className="mr-2 size-5 animate-spin" />
            ) : (
              <FileSpreadsheet className="mr-2 size-5" />
            )}
            {t("export_button")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full rounded-xl font-bold"
            disabled={exporting || importing}
            onClick={async () => {
              setExporting(true);
              try {
                const sheets = await buildServicesOnlySheets();
                downloadWorkbook(
                  workbookFromSheets(sheets),
                  `howeyah-services-${formatDateStamp()}.xlsx`,
                );
                toast.success(t("export_services_success"));
              } catch (e) {
                toast.error(e instanceof Error ? e.message : t("export_error"));
              } finally {
                setExporting(false);
              }
            }}
          >
            {exporting ? (
              <Loader2 className="mr-2 size-5 animate-spin" />
            ) : (
              <FileSpreadsheet className="mr-2 size-5" />
            )}
            {t("export_services_button")}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Upload className="size-5 text-primary" />
            {t("import_title")}
          </CardTitle>
          <CardDescription>{t("import_description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{t("import_note_images")}</p>
          <p className="text-sm text-muted-foreground">{t("import_note_services")}</p>
          <Input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            className="rounded-xl"
            disabled={importing || exporting}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void runImport(file);
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl font-semibold"
              disabled={importing || exporting}
              onClick={() => fileRef.current?.click()}
            >
              {importing ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Upload className="mr-2 size-4" />
              )}
              {t("import_button")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl font-semibold"
              disabled={importing || exporting}
              onClick={runTemplate}
            >
              {t("template_button")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
