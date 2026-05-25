import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Placeholder from "@tiptap/extension-placeholder";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import type { Extensions } from "@tiptap/core";
import { BilingualImage } from "./extensions/bilingual-image";
import { CustomHeading } from "./extensions/custom-heading";
import { FontSize } from "./extensions/font-size";
import { DivBlock } from "./extensions/div-block";
import { SpanMark } from "./extensions/span-mark";
import { TocBlock } from "./extensions/toc-block";

export function buildEditorExtensions(placeholder: string): Extensions {
  return [
    StarterKit.configure({
      heading: false,
      blockquote: {
        HTMLAttributes: { class: "editor-quote border-s-4 border-gray-300 ps-4 italic my-2" },
      },
      bulletList: {
        HTMLAttributes: { class: "editor-list-ul list-disc ps-6 my-2" },
      },
      orderedList: {
        HTMLAttributes: { class: "editor-list-ol list-decimal ps-6 my-2" },
      },
      listItem: {
        HTMLAttributes: { class: "editor-listitem" },
      },
      code: {
        HTMLAttributes: { class: "bg-gray-100 p-1 rounded font-mono text-sm" },
      },
      paragraph: {
        HTMLAttributes: { class: "editor-paragraph leading-normal min-h-[1.5em]" },
      },
    }),
    CustomHeading,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: "text-primary underline underline-offset-2 cursor-pointer",
      },
    }),
    Underline,
    TextStyle,
    Color,
    FontSize,
    TextAlign.configure({ types: ["heading", "paragraph", "divBlock"] }),
    BilingualImage.configure({ inline: false, allowBase64: true }),
    Table.configure({
      resizable: true,
      HTMLAttributes: { class: "editor-table w-full border-collapse my-4" },
    }),
    TableRow,
    TableHeader.configure({
      HTMLAttributes: { class: "editor-table-cell-header border border-border px-3 py-2 bg-muted/40 font-bold" },
    }),
    TableCell.configure({
      HTMLAttributes: { class: "editor-table-cell border border-border px-3 py-2 align-top min-w-[80px]" },
    }),
    DivBlock,
    SpanMark,
    TocBlock,
    Placeholder.configure({ placeholder }),
  ];
}
