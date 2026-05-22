import type { HeadingTagType } from "@lexical/rich-text";

/** Default heading colors (saved inline in HTML when a heading is applied). */
export const DEFAULT_HEADING_COLORS: Record<HeadingTagType, string> = {
  h1: "#111827",
  h2: "#a3cd39",
  h3: "#2563eb",
  h4: "#0891b2",
  h5: "#4b5563",
  h6: "#6b7280",
};

/** Live defaults for new headings in the editor; wire to site settings later via setHeadingColors(). */
export let headingColors: Record<HeadingTagType, string> = { ...DEFAULT_HEADING_COLORS };

export function getHeadingColor(level: HeadingTagType): string {
  return headingColors[level];
}

export function setHeadingColors(next: Partial<Record<HeadingTagType, string>>): void {
  headingColors = { ...headingColors, ...next };
}

export function resetHeadingColors(): void {
  headingColors = { ...DEFAULT_HEADING_COLORS };
}

/** CSS variables for the editor surface (preview + class-based headings without inline color). */
export function headingColorCssVariables(
  colors: Record<HeadingTagType, string> = headingColors,
): Record<string, string> {
  return {
    "--editor-heading-h1-color": colors.h1,
    "--editor-heading-h2-color": colors.h2,
    "--editor-heading-h3-color": colors.h3,
    "--editor-heading-h4-color": colors.h4,
    "--editor-heading-h5-color": colors.h5,
    "--editor-heading-h6-color": colors.h6,
  };
}

/** Preset swatches for inline text color (stored as style="color: …" in HTML). */
export const TEXT_COLOR_PRESETS = [
  { label: "Black", value: "#111827" },
  { label: "Gray", value: "#4b5563" },
  { label: "Brand", value: "#a3cd39" },
  { label: "Blue", value: "#2563eb" },
  { label: "Teal", value: "#0891b2" },
  { label: "Red", value: "#dc2626" },
  { label: "Orange", value: "#ea580c" },
  { label: "Purple", value: "#7c3aed" },
  { label: "White", value: "#ffffff" },
] as const;

export const DEFAULT_TEXT_COLOR = "#111827";
