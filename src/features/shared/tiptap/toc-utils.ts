import type { Editor } from "@tiptap/react";
import { getHeadingColor } from "../lib/editor-colors";
import type { HeadingTagType } from "../lib/heading-types";
import { HEADING_FONT_SIZES } from "../lib/editor-typography";
import { slugifyHeadingAnchor } from "./slugify";

export const EDITOR_TOC_CLASS = "editor-toc cms-toc";

type CollectedHeading = {
  level: number;
  text: string;
  anchorId: string;
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function collectHeadings(editor: Editor): CollectedHeading[] {
  const usedIds = new Set<string>();
  const items: CollectedHeading[] = [];

  editor.state.doc.descendants((node) => {
    if (node.type.name !== "heading") return;
    const text = node.textContent.trim();
    if (!text) return;
    items.push({
      level: node.attrs.level as number,
      text,
      anchorId: slugifyHeadingAnchor(text, usedIds),
    });
  });

  return items;
}

function buildTocHtml(headings: CollectedHeading[], title: string): string {
  if (headings.length === 0) return "";

  let html = `<div class="${EDITOR_TOC_CLASS}"><p><strong>${escapeHtml(title)}</strong></p><ul>`;
  let currentLevel = 0;

  for (let i = 0; i < headings.length; i++) {
    const h = headings[i];
    const next = headings[i + 1];

    while (currentLevel > h.level) {
      html += "</ul></li>";
      currentLevel -= 1;
    }
    while (currentLevel < h.level) {
      html += "<ul>";
      currentLevel += 1;
    }

    html += `<li><a href="#${escapeHtml(h.anchorId)}">${escapeHtml(h.text)}</a>`;

    if (next && next.level > h.level) {
      html += "";
    } else {
      html += "</li>";
    }
  }

  while (currentLevel > 0) {
    html += "</ul>";
    currentLevel -= 1;
  }

  html += "</ul></div>";
  return html;
}

function assignHeadingIds(editor: Editor, headings: CollectedHeading[]): void {
  let index = 0;
  const { tr } = editor.state;
  let changed = false;

  editor.state.doc.descendants((node, pos) => {
    if (node.type.name !== "heading") return;
    const text = node.textContent.trim();
    if (!text) return;
    const item = headings[index++];
    if (!item || node.attrs.id === item.anchorId) return;
    tr.setNodeMarkup(pos, undefined, { ...node.attrs, id: item.anchorId });
    changed = true;
  });

  if (changed) editor.view.dispatch(tr);
}

function removeExistingToc(editor: Editor): void {
  const ranges: { from: number; to: number }[] = [];

  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === "tocBlock") {
      ranges.push({ from: pos, to: pos + node.nodeSize });
    }
  });

  if (ranges.length === 0) return;

  const tr = editor.state.tr;
  ranges
    .sort((a, b) => b.from - a.from)
    .forEach(({ from, to }) => tr.delete(from, to));
  editor.view.dispatch(tr);
}

export function insertOrUpdateTableOfContents(
  editor: Editor,
  options: { title: string },
): boolean {
  const headings = collectHeadings(editor);
  if (headings.length === 0) return false;

  assignHeadingIds(editor, headings);
  const html = buildTocHtml(headings, options.title);
  removeExistingToc(editor);
  editor.chain().focus().insertContentAt(0, html).run();
  return true;
}

export function applyHeadingWithStyles(editor: Editor, level: HeadingTagType): void {
  const n = Number(level.slice(1)) as 1 | 2 | 3 | 4 | 5 | 6;
  editor
    .chain()
    .focus()
    .setHeading({ level: n })
    .setColor(getHeadingColor(level))
    .setFontSize(HEADING_FONT_SIZES[level])
    .run();
}
