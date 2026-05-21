const BLOCKED_TAGS = new Set(["script", "style", "iframe", "object", "embed", "link", "meta"]);

/**
 * Strips attributes and tags that often trigger Hostinger / ModSecurity WAF on multipart POSTs
 * (e.g. `style=`, `class` with `[]`, `<script>`). Keeps basic semantic markup for storage.
 */
export function htmlForMultipartApi(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return "";

  const doc = new DOMParser().parseFromString(trimmed, "text/html");

  doc.querySelectorAll(Array.from(BLOCKED_TAGS).join(",")).forEach((node) => node.remove());

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

      // style/class often false-positive WAF rules on shared hosting
      if (name === "style" || name === "class") {
        el.removeAttribute(attr.name);
      }
    }
  });

  return doc.body.innerHTML.trim();
}
