import { cn } from "@/lib/utils";
import { useCallback, type MouseEvent } from "react";

type BlogTocPreviewProps = {
  html: string;
  /** Element id wrapping the article content editor (scroll target root). */
  contentScrollRootId: string;
  emptyMessage?: string;
  className?: string;
};

export function BlogTocPreview({
  html,
  contentScrollRootId,
  emptyMessage,
  className,
}: BlogTocPreviewProps) {
  const handleClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const anchor = (event.target as HTMLElement).closest('a[href^="#"]');
      if (!anchor) return;

      const hash = anchor.getAttribute("href");
      if (!hash || hash.length < 2) return;

      event.preventDefault();
      const id = decodeURIComponent(hash.slice(1));
      const root = document.getElementById(contentScrollRootId);
      const heading = root?.querySelector(`#${CSS.escape(id)}`);
      if (!heading) return;

      heading.scrollIntoView({ behavior: "smooth", block: "center" });
    },
    [contentScrollRootId],
  );

  const trimmed = html.trim();
  if (!trimmed) {
    return emptyMessage ? (
      <p className="text-sm text-muted-foreground rounded-xl border border-dashed bg-muted/10 px-4 py-6 text-center">
        {emptyMessage}
      </p>
    ) : null;
  }

  return (
    <div
      dir="rtl"
      className={cn(
        "editor-toc cms-toc rounded-xl border bg-muted/5 p-4 text-sm [&_a]:cursor-pointer [&_a]:text-sky-700 [&_a]:underline-offset-2 hover:[&_a]:underline",
        className,
      )}
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: trimmed }}
    />
  );
}
