import { importBlogRows } from "@/features/backup-export/services/content-backup-service";
import { importServiceRows } from "@/features/backup-export/services/service-backup-service";
import type { RowImportResult } from "@/features/backup-export/types";
import { cellString, parseWorkbookFile } from "@/lib/excel-io";

export const IMPORT_EMPTY_SHEET = "IMPORT_EMPTY_SHEET";

export function pickSheetRows(
  sheets: Record<string, Record<string, unknown>[]>,
  ...candidates: string[]
): Record<string, unknown>[] {
  for (const name of candidates) {
    const rows = sheets[name];
    if (rows?.length) return rows;
  }
  return [];
}

export async function importServicesFromFile(file: File): Promise<RowImportResult> {
  const sheets = await parseWorkbookFile(file);
  const rows = pickSheetRows(sheets, "services", "Services");
  if (!rows.length) throw new Error(IMPORT_EMPTY_SHEET);
  return importServiceRows(rows);
}

export async function importBlogsFromFile(
  file: File,
  filterId?: string | number,
): Promise<RowImportResult> {
  const sheets = await parseWorkbookFile(file);
  let rows = pickSheetRows(sheets, "blogs", "Blogs");
  if (filterId != null) {
    const id = String(filterId);
    rows = rows.filter((row) => cellString(row.id) === id);
  }
  if (!rows.length) throw new Error(IMPORT_EMPTY_SHEET);
  return importBlogRows(rows);
}
