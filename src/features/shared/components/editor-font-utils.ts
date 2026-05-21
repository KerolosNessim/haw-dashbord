import {
  $getSelectionStyleValueForProperty,
  $patchStyleText,
} from "@lexical/selection";
import { $findMatchingParent } from "@lexical/utils";
import {
  $isHeadingNode,
  type HeadingTagType,
} from "@lexical/rich-text";
import type { RangeSelection } from "lexical";

export const DEFAULT_FONT_SIZE = "16px";

export const EDITOR_FONT_SIZES = [
  { label: "8", value: "8px" },
  { label: "9", value: "9px" },
  { label: "10", value: "10px" },
  { label: "11", value: "11px" },
  { label: "12", value: "12px" },
  { label: "14", value: "14px" },
  { label: "16", value: "16px" },
  { label: "18", value: "18px" },
  { label: "20", value: "20px" },
  { label: "24", value: "24px" },
  { label: "28", value: "28px" },
  { label: "32", value: "32px" },
  { label: "36", value: "36px" },
  { label: "48", value: "48px" },
  { label: "72", value: "72px" },
] as const;

/** Default px size applied when picking a heading level (also used in the size dropdown). */
export const HEADING_FONT_SIZES: Record<HeadingTagType, string> = {
  h1: "32px",
  h2: "24px",
  h3: "20px",
  h4: "18px",
  h5: "16px",
  h6: "14px",
};

export function labelForFontSize(value: string): string {
  return EDITOR_FONT_SIZES.find((o) => o.value === value)?.label ?? "16";
}

export function normalizeFontSize(raw: string): string {
  if (!raw) return DEFAULT_FONT_SIZE;
  const exact = EDITOR_FONT_SIZES.find((o) => o.value === raw);
  if (exact) return exact.value;
  const px = raw.match(/^([\d.]+)px$/i);
  if (px) {
    const candidate = `${Math.round(Number(px[1]))}px`;
    if (EDITOR_FONT_SIZES.some((o) => o.value === candidate)) return candidate;
  }
  const pt = raw.match(/^([\d.]+)pt$/i);
  if (pt) {
    const pxNum = Math.round((Number(pt[1]) * 96) / 72);
    const candidate = `${pxNum}px`;
    if (EDITOR_FONT_SIZES.some((o) => o.value === candidate)) return candidate;
  }
  return DEFAULT_FONT_SIZE;
}

export function getHeadingTagFromSelection(
  selection: RangeSelection,
): HeadingTagType | null {
  const anchor = selection.anchor.getNode();
  const heading = $findMatchingParent(anchor, $isHeadingNode);
  return heading?.getTag() ?? null;
}

/** Effective font size for the toolbar (inline style, or heading default, or 16px body). */
export function resolveFontSizeFromSelection(selection: RangeSelection): string {
  const raw = $getSelectionStyleValueForProperty(selection, "font-size", "");
  if (raw) return normalizeFontSize(raw);
  const tag = getHeadingTagFromSelection(selection);
  if (tag) return HEADING_FONT_SIZES[tag];
  return DEFAULT_FONT_SIZE;
}

export function applyFontSizeToSelection(
  selection: RangeSelection,
  value: string,
) {
  if (value === DEFAULT_FONT_SIZE) {
    $patchStyleText(selection, { "font-size": null });
  } else {
    $patchStyleText(selection, { "font-size": value });
  }
}

export function applyHeadingLevel(
  selection: RangeSelection,
  level: HeadingTagType,
) {
  $patchStyleText(selection, { "font-size": HEADING_FONT_SIZES[level] });
}
