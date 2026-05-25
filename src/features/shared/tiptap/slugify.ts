export function slugifyHeadingAnchor(text: string, usedIds: Set<string>): string {
  const base =
    text
      .trim()
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\u0600-\u06FF]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "section";

  let id = base;
  let n = 2;
  while (usedIds.has(id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  usedIds.add(id);
  return id;
}
