import type { Editor } from "@tiptap/react";

export type InsertTableOptions = {
  rows: number;
  columns: number;
  includeHeaders: boolean;
  columnWidthPx?: number;
  rowHeightPx?: number;
};

export function insertTableWithSizing(editor: Editor, options: InsertTableOptions): void {
  editor
    .chain()
    .focus()
    .insertTable({
      rows: options.rows,
      cols: options.columns,
      withHeaderRow: options.includeHeaders,
    })
    .run();
}
