import {
  $createTableNodeWithDimensions,
  $isTableCellNode,
  $isTableRowNode,
} from "@lexical/table";
import { $insertNodeToNearestRoot } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  type LexicalEditor,
} from "lexical";

export type InsertTableOptions = {
  rows: number;
  columns: number;
  includeHeaders: boolean;
  /** Column width in pixels (applied to every cell). */
  columnWidthPx?: number;
  /** Row height in pixels (applied to every row). */
  rowHeightPx?: number;
};

function resolveIncludeHeaders(includeHeaders: boolean) {
  if (!includeHeaders) return false;
  return { rows: true, columns: false } as const;
}

/** Inserts a table and optionally sets uniform column width / row height. */
export function insertTableWithSizing(editor: LexicalEditor, options: InsertTableOptions): void {
  editor.update(() => {
    const selection = $getSelection();
    if (!selection || !$isRangeSelection(selection)) return;

    const tableNode = $createTableNodeWithDimensions(
      options.rows,
      options.columns,
      resolveIncludeHeaders(options.includeHeaders),
    );

    if (options.columnWidthPx || options.rowHeightPx) {
      for (const row of tableNode.getChildren()) {
        if (!$isTableRowNode(row)) continue;
        if (options.rowHeightPx) {
          row.setHeight(options.rowHeightPx);
        }
        for (const cell of row.getChildren()) {
          if ($isTableCellNode(cell) && options.columnWidthPx) {
            cell.setWidth(options.columnWidthPx);
          }
        }
      }
    }

    $insertNodeToNearestRoot(tableNode);

    const firstDescendant = tableNode.getFirstDescendant();
    if ($isTextNode(firstDescendant)) {
      firstDescendant.select();
    }
  });
}
