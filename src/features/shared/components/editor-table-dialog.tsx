"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export type EditorTableDialogValues = {
  rows: number;
  columns: number;
  includeHeaders: boolean;
  columnWidthPx?: number;
  rowHeightPx?: number;
};

const MIN_COUNT = 1;
const MAX_COUNT = 20;
const MIN_WIDTH_PX = 40;
const MAX_WIDTH_PX = 600;
const MIN_HEIGHT_PX = 24;
const MAX_HEIGHT_PX = 400;
const DEFAULT_ROWS = 3;
const DEFAULT_COLUMNS = 3;
const DEFAULT_COLUMN_WIDTH = 120;
const DEFAULT_ROW_HEIGHT = 48;

function clampCount(value: number): number {
  if (!Number.isFinite(value)) return MIN_COUNT;
  return Math.min(MAX_COUNT, Math.max(MIN_COUNT, Math.round(value)));
}

function parseOptionalPx(
  raw: string,
  min: number,
  max: number,
): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return undefined;
  return Math.min(max, Math.max(min, Math.round(n)));
}

type EditorTableDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: EditorTableDialogValues) => void;
};

export function EditorTableDialog({ open, onOpenChange, onSubmit }: EditorTableDialogProps) {
  const { t } = useTranslation("translation", { keyPrefix: "editor" });
  const [rows, setRows] = useState(String(DEFAULT_ROWS));
  const [columns, setColumns] = useState(String(DEFAULT_COLUMNS));
  const [columnWidth, setColumnWidth] = useState(String(DEFAULT_COLUMN_WIDTH));
  const [rowHeight, setRowHeight] = useState(String(DEFAULT_ROW_HEIGHT));
  const [includeHeaders, setIncludeHeaders] = useState(true);

  useEffect(() => {
    if (!open) return;
    setRows(String(DEFAULT_ROWS));
    setColumns(String(DEFAULT_COLUMNS));
    setColumnWidth(String(DEFAULT_COLUMN_WIDTH));
    setRowHeight(String(DEFAULT_ROW_HEIGHT));
    setIncludeHeaders(true);
  }, [open]);

  const handleInsert = () => {
    onSubmit({
      rows: clampCount(Number(rows)),
      columns: clampCount(Number(columns)),
      includeHeaders,
      columnWidthPx: parseOptionalPx(columnWidth, MIN_WIDTH_PX, MAX_WIDTH_PX),
      rowHeightPx: parseOptionalPx(rowHeight, MIN_HEIGHT_PX, MAX_HEIGHT_PX),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>{t("table_dialog_title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>{t("table_rows")}</FieldLabel>
              <Input
                type="number"
                min={MIN_COUNT}
                max={MAX_COUNT}
                value={rows}
                onChange={(e) => setRows(e.target.value)}
                className="rounded-xl"
                dir="ltr"
              />
            </Field>
            <Field>
              <FieldLabel>{t("table_columns")}</FieldLabel>
              <Input
                type="number"
                min={MIN_COUNT}
                max={MAX_COUNT}
                value={columns}
                onChange={(e) => setColumns(e.target.value)}
                className="rounded-xl"
                dir="ltr"
              />
            </Field>
          </div>

          <p className="text-xs text-muted-foreground">
            {t("table_count_hint", { min: MIN_COUNT, max: MAX_COUNT })}
          </p>

          <div className="grid grid-cols-2 gap-4 border-t border-dashed pt-4">
            <Field>
              <FieldLabel>{t("table_column_width")}</FieldLabel>
              <Input
                type="number"
                min={MIN_WIDTH_PX}
                max={MAX_WIDTH_PX}
                value={columnWidth}
                onChange={(e) => setColumnWidth(e.target.value)}
                placeholder={t("table_column_width_placeholder")}
                className="rounded-xl"
                dir="ltr"
              />
              <p className="text-[10px] text-muted-foreground mt-1">{t("table_px_hint")}</p>
            </Field>
            <Field>
              <FieldLabel>{t("table_row_height")}</FieldLabel>
              <Input
                type="number"
                min={MIN_HEIGHT_PX}
                max={MAX_HEIGHT_PX}
                value={rowHeight}
                onChange={(e) => setRowHeight(e.target.value)}
                placeholder={t("table_row_height_placeholder")}
                className="rounded-xl"
                dir="ltr"
              />
              <p className="text-[10px] text-muted-foreground mt-1">{t("table_px_hint")}</p>
            </Field>
          </div>

          <p className="text-xs text-muted-foreground">
            {t("table_dimension_hint", {
              minW: MIN_WIDTH_PX,
              maxW: MAX_WIDTH_PX,
              minH: MIN_HEIGHT_PX,
              maxH: MAX_HEIGHT_PX,
            })}
          </p>

          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <Checkbox
              checked={includeHeaders}
              onCheckedChange={(v) => setIncludeHeaders(v === true)}
            />
            {t("table_include_headers")}
          </label>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button type="button" onClick={handleInsert}>
            {t("table_insert")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
