import {
  $deleteTableColumnAtSelection,
  $deleteTableRowAtSelection,
  $insertTableColumnAtSelection,
  $insertTableRowAtSelection,
} from "@lexical/table";
import type { LexicalEditor } from "lexical";

export function insertTableRowAbove(editor: LexicalEditor) {
  editor.update(() => {
    $insertTableRowAtSelection(false);
  });
}

export function insertTableRowBelow(editor: LexicalEditor) {
  editor.update(() => {
    $insertTableRowAtSelection(true);
  });
}

export function insertTableColumnLeft(editor: LexicalEditor) {
  editor.update(() => {
    $insertTableColumnAtSelection(false);
  });
}

export function insertTableColumnRight(editor: LexicalEditor) {
  editor.update(() => {
    $insertTableColumnAtSelection(true);
  });
}

export function deleteTableRow(editor: LexicalEditor) {
  editor.update(() => {
    $deleteTableRowAtSelection();
  });
}

export function deleteTableColumn(editor: LexicalEditor) {
  editor.update(() => {
    $deleteTableColumnAtSelection();
  });
}
