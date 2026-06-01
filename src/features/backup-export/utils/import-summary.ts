import type { ImportResult, RowImportResult } from "@/features/backup-export/types";
import { getHttpErrorMessage } from "@/lib/http-error-message";
import { toast } from "sonner";

const MAX_ERRORS_IN_TOAST = 4;

type TranslateFn = (key: string, opts?: object) => string;

export function formatImportRowError(
  rowLabel: string,
  error: unknown,
  entityLabel = "Row",
): string {
  const detail = getHttpErrorMessage(error, { default: "Import failed" });
  return `${entityLabel} ${rowLabel}: ${detail}`;
}

function errorsExcerpt(errors: string[]): string {
  if (!errors.length) return "";
  const shown = errors.slice(0, MAX_ERRORS_IN_TOAST);
  const body = shown.join("\n");
  const remaining = errors.length - shown.length;
  if (remaining > 0) {
    return `${body}\n… +${remaining} more`;
  }
  return body;
}

/** Row-level Excel import toasts — never success when every row failed. */
export function showRowImportToasts(result: RowImportResult, t: TranslateFn): void {
  const succeeded = result.created + result.updated;
  const hasFailures = result.failed > 0 || result.errors.length > 0;

  if (hasFailures) {
    console.warn("[excel import]", result.errors);
  }

  if (succeeded === 0 && hasFailures) {
    toast.error(
      [t("import_all_failed", { count: result.failed || result.errors.length }), errorsExcerpt(result.errors)]
        .filter(Boolean)
        .join("\n"),
      { duration: 12_000 },
    );
    return;
  }

  if (succeeded > 0 && hasFailures) {
    toast.warning(
      [
        t("import_partial_detail", {
          created: result.created,
          updated: result.updated,
          failed: result.failed || result.errors.length,
        }),
        errorsExcerpt(result.errors),
      ]
        .filter(Boolean)
        .join("\n"),
      { duration: 12_000 },
    );
    return;
  }

  toast.success(
    t("import_bulk_success", {
      created: result.created,
      updated: result.updated,
    }),
  );
}

function backupImportSucceeded(result: ImportResult): number {
  return (
    result.blogs.created +
    result.blogs.updated +
    result.services.created +
    result.services.updated +
    result.legal.updated +
    result.faqItems.created +
    result.faqItems.updated +
    (result.faqGeneral ? 1 : 0)
  );
}

function backupImportFailedCount(result: ImportResult): number {
  return (
    result.blogs.failed +
    result.services.failed +
    result.legal.failed +
    result.faqItems.failed
  );
}

function summarizeBackupImport(result: ImportResult, t: TranslateFn): string {
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

/** Full workbook import toasts. */
export function showBackupImportToasts(result: ImportResult, t: TranslateFn): void {
  const succeeded = backupImportSucceeded(result);
  const failedCount = backupImportFailedCount(result);
  const hasFailures = result.errors.length > 0 || failedCount > 0;

  if (hasFailures) {
    console.warn("[backup import]", result.errors);
  }

  const summary = summarizeBackupImport(result, t);

  if (succeeded === 0 && hasFailures) {
    toast.error([t("import_all_failed", { count: failedCount || result.errors.length }), summary, errorsExcerpt(result.errors)]
      .filter(Boolean)
      .join("\n"), { duration: 14_000 });
    return;
  }

  if (succeeded > 0 && hasFailures) {
    toast.warning([summary, errorsExcerpt(result.errors)].filter(Boolean).join("\n"), {
      duration: 14_000,
    });
    return;
  }

  toast.success(summary);
}

export function summarizeRowImport(
  result: RowImportResult,
  t: TranslateFn,
): string {
  return t("import_success", {
    created: result.created,
    updated: result.updated,
    failed: result.failed,
  });
}

/** @deprecated Use showRowImportToasts — logs only */
export function warnPartialImport(result: RowImportResult, _t: TranslateFn): void {
  if (result.errors.length) {
    console.warn("[excel import]", result.errors);
  }
}
