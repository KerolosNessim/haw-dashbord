import * as XLSX from "xlsx";

export type ExcelSheetInput = {
  name: string;
  rows: Record<string, unknown>[];
};

export function workbookFromSheets(sheets: ExcelSheetInput[]): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  for (const sheet of sheets) {
    const safeName = sheet.name.slice(0, 31) || "Sheet1";
    const ws = XLSX.utils.json_to_sheet(sheet.rows.length ? sheet.rows : [{}]);
    XLSX.utils.book_append_sheet(wb, ws, safeName);
  }
  return wb;
}

export function downloadWorkbook(wb: XLSX.WorkBook, filename: string): void {
  XLSX.writeFile(wb, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}

export async function parseWorkbookFile(
  file: File,
): Promise<Record<string, Record<string, unknown>[]>> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const out: Record<string, Record<string, unknown>[]> = {};
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name];
    if (!ws) continue;
    out[name] = XLSX.utils.sheet_to_json(ws, { defval: "" }) as Record<string, unknown>[];
  }
  return out;
}

export function cellString(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

export function cellBoolean(value: unknown, defaultValue = true): boolean {
  const s = cellString(value).toLowerCase();
  if (s === "1" || s === "true" || s === "yes") return true;
  if (s === "0" || s === "false" || s === "no") return false;
  return defaultValue;
}
