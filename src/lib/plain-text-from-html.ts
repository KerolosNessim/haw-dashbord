/** Strip tags for slugs, alt text, and list previews. */
export function plainTextFromHtml(value: string | undefined | null): string {
  if (!value) return "";
  if (typeof window === "undefined") {
    return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }
  const div = document.createElement("div");
  div.innerHTML = value;
  return (div.textContent ?? div.innerText ?? "").replace(/\s+/g, " ").trim();
}
