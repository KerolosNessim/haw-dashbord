const BLOCKED_TAGS = new Set(["script", "style", "iframe", "object", "embed", "link", "meta"]);

/** CSS properties we keep on multipart POST (colors, typography, alignment). */
const ALLOWED_STYLE_PROPERTIES = new Set([
  "color",
  "font-size",
  "text-align",
  "background-color",
  "font-weight",
  "font-style",
  "text-decoration",
  "white-space",
]);

const DANGEROUS_STYLE_VALUE = /expression|javascript|url\s*\(|@import|behavior|-moz-binding/i;

function sanitizeInlineStyle(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed || DANGEROUS_STYLE_VALUE.test(trimmed)) return "";

  const kept: string[] = [];
  for (const decl of trimmed.split(";")) {
    const colon = decl.indexOf(":");
    if (colon < 0) continue;
    const prop = decl.slice(0, colon).trim().toLowerCase();
    const value = decl.slice(colon + 1).trim();
    if (!value || !ALLOWED_STYLE_PROPERTIES.has(prop)) continue;
    if (DANGEROUS_STYLE_VALUE.test(value)) continue;
    kept.push(`${prop}: ${value}`);
  }
  return kept.join("; ");
}

/** Drops `[]` and other patterns that trigger ModSecurity on shared hosting. */
function sanitizeClassName(raw: string): string {
  if (/[\[\]{}]/.test(raw)) return "";
  return raw
    .split(/\s+/)
    .filter((token) => token && /^[\w-]+$/.test(token))
    .join(" ");
}

/**
 * Sanitizes CMS HTML for multipart API posts: removes scripts and event handlers,
 * but keeps safe inline styles (e.g. color, font-size) so rich text colors persist.
 */
export function htmlForMultipartApi(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return "";

  const doc = new DOMParser().parseFromString(trimmed, "text/html");

  doc.querySelectorAll(Array.from(BLOCKED_TAGS).join(",")).forEach((node) => node.remove());

  // Inline base64 images blow up JSON/multipart bodies and often trigger Hostinger WAF (403).
  doc.querySelectorAll('img[src^="data:"]').forEach((node) => node.remove());

  doc.body.querySelectorAll("*").forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim();

      if (name.startsWith("on")) {
        el.removeAttribute(attr.name);
        continue;
      }

      if (name === "href" && value.toLowerCase().startsWith("javascript:")) {
        el.removeAttribute(attr.name);
        continue;
      }

      if (name === "style") {
        const safe = sanitizeInlineStyle(value);
        if (safe) el.setAttribute("style", safe);
        else el.removeAttribute(attr.name);
        continue;
      }

      if (name === "class") {
        const safe = sanitizeClassName(value);
        if (safe) el.setAttribute("class", safe);
        else el.removeAttribute(attr.name);
      }
    }
  });

  return doc.body.innerHTML.trim();
}
