import { buildTocHtml } from "@/features/shared/tiptap/toc-utils";
import { slugifyHeadingAnchor } from "@/features/shared/tiptap/slugify";

const HEADING_RE = /<h([1-6])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi;

export type ContentHeading = {
  level: number;
  text: string;
  anchorId: string;
};

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

function readExistingId(attrs: string): string | null {
  const m = attrs.match(/\bid\s*=\s*["']([^"']+)["']/i);
  return m?.[1]?.trim() || null;
}

/** Collect h1–h6 from article HTML in document order with stable anchor ids. */
export function extractHeadingsFromContentHtml(html: string): ContentHeading[] {
  const trimmed = html?.trim();
  if (!trimmed) return [];

  const usedIds = new Set<string>();
  const items: ContentHeading[] = [];
  const re = new RegExp(HEADING_RE.source, HEADING_RE.flags);
  let m: RegExpExecArray | null;

  while ((m = re.exec(trimmed)) !== null) {
    const level = Number(m[1]);
    const attrs = m[2] ?? "";
    const inner = m[3];
    const text = stripTags(inner);
    if (!text) continue;

    const existing = readExistingId(attrs);
    const anchorId =
      existing && !usedIds.has(existing)
        ? (usedIds.add(existing), existing)
        : slugifyHeadingAnchor(text, usedIds);

    items.push({ level, text, anchorId });
  }

  return items;
}

/** Inject `id` on headings that lack one, using the collected anchor ids in order. */
export function assignHeadingIdsInContentHtml(
  html: string,
  headings: ContentHeading[],
): string {
  const trimmed = html?.trim();
  if (!trimmed || headings.length === 0) return html;

  let index = 0;
  const re = new RegExp(HEADING_RE.source, HEADING_RE.flags);

  return trimmed.replace(re, (full, level: string, attrsRaw: string | undefined, inner: string) => {
    const attrs = attrsRaw ?? "";
    const text = stripTags(inner);
    if (!text) return full;

    const item = headings[index++];
    if (!item) return full;

    const existing = readExistingId(attrs);
    if (existing === item.anchorId) return full;

    const spacer = attrs.length && !/\s$/.test(attrs) ? " " : "";
    return `<h${level}${attrs}${spacer}id="${item.anchorId}">${inner}</h${level}>`;
  });
}

export function buildBlogTocHtmlFromHeadings(
  headings: ContentHeading[],
  title: string,
): string {
  if (headings.length === 0) return "";
  return buildTocHtml(
    headings.map((h) => ({
      level: h.level,
      text: h.text,
      anchorId: h.anchorId,
    })),
    title,
  );
}

/** Sync Arabic article body ids and generated TOC HTML from h1–h6 headings. */
export function syncBlogArabicContentAndToc(
  contentHtml: string,
  options: { tocTitle: string },
): { contentHtml: string; tocHtml: string } {
  const headings = extractHeadingsFromContentHtml(contentHtml);
  const contentWithIds = assignHeadingIdsInContentHtml(contentHtml, headings);
  const tocHtml = buildBlogTocHtmlFromHeadings(headings, options.tocTitle);
  return { contentHtml: contentWithIds, tocHtml };
}
