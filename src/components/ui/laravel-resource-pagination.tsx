"use client";

import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  buildLaravelPageUrl,
  getPaginationWindow,
  type LaravelPaginationLinks,
  type LaravelPaginationMeta,
} from "@/lib/laravel-pagination";
import { cn } from "@/lib/utils";

export type LaravelResourcePaginationProps = {
  meta: LaravelPaginationMeta;
  links?: Partial<LaravelPaginationLinks>;
  /** Client-side / router navigation (e.g. TanStack Query `setPage`). */
  onPageChange?: (page: number) => void;
  /** Full URL per page (e.g. router `href` with searchParams). Overrides `meta.path` + `?page=`. */
  getPageUrl?: (page: number) => string;
  className?: string;
  contentClassName?: string;
  /** “Showing X–Y of Z” when `from` / `to` are present. */
  showSummary?: boolean;
  summaryClassName?: string;
  previousLabel?: string;
  nextLabel?: string;
  /** Pages shown on each side of the current page in the window. */
  siblingCount?: number;
  disabled?: boolean;
  hideWhenSinglePage?: boolean;
  /** Flip prev/next chevrons for RTL layouts. */
  isRtl?: boolean;
};

export function LaravelResourcePagination({
  meta,
  links: linksProp,
  onPageChange,
  getPageUrl,
  className,
  contentClassName,
  showSummary = true,
  summaryClassName,
  isRtl = false,
  previousLabel = isRtl ? "السابق" : "Previous",
  nextLabel = isRtl ? "التالي" : "Next",
  siblingCount = 1,
  disabled = false,
  hideWhenSinglePage = true,
}: LaravelResourcePaginationProps) {
  const { current_page, last_page, from, to, total } = meta;

  const windowItems = getPaginationWindow(
    current_page,
    last_page,
    siblingCount
  );

  if (hideWhenSinglePage && last_page <= 1) {
    return null;
  }

  const canPrev = current_page > 1;
  const canNext = current_page < last_page;

  const prevHref =
    linksProp?.prev ??
    (canPrev ? buildLaravelPageUrl(meta.path, current_page - 1) : null);
  const nextHref =
    linksProp?.next ??
    (canNext ? buildLaravelPageUrl(meta.path, current_page + 1) : null);

  const resolvePageHref = (page: number) =>
    getPageUrl ? getPageUrl(page) : buildLaravelPageUrl(meta.path, page);

  const summary =
    showSummary && total > 0 && from != null && to != null ? (
      <p
        className={cn(
          "text-sm text-muted-foreground order-2 md:order-1",
          summaryClassName
        )}
      >
        Showing {from}–{to} of {total}
      </p>
    ) : null;

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between",
        className
      )}
    >
      {summary}
      <Pagination
        className={cn(
          "mx-0 w-full justify-center md:w-auto md:justify-end",
          summary && "order-1 md:order-2"
        )}
      >
        <PaginationContent className={cn("gap-1", contentClassName)}>
          <PaginationItem>
            <PaginationPrevious
              text={previousLabel}
              href={onPageChange ? "#" : (canPrev && prevHref ? prevHref : "#")}
              className={cn(
                "rounded-xl border-border/60 h-9 px-3",
                (!canPrev || disabled) && "pointer-events-none opacity-50"
              )}
              onClick={(e) => {
                if (!canPrev || disabled) {
                  e.preventDefault();
                  return;
                }
                if (onPageChange) {
                  e.preventDefault();
                  onPageChange(current_page - 1);
                }
              }}
            />
          </PaginationItem>

          {windowItems.map((item, idx) =>
            item === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${idx}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={item}>
                {onPageChange ? (
                  <Button
                    type="button"
                    variant={item === current_page ? "outline" : "ghost"}
                    size="icon"
                    disabled={disabled}
                    className={cn(
                      "size-9 rounded-xl",
                      item === current_page &&
                        "border-primary/20 bg-primary/10 font-semibold text-primary hover:bg-primary/20"
                    )}
                    aria-current={item === current_page ? "page" : undefined}
                    onClick={() => onPageChange(item)}
                  >
                    {item}
                  </Button>
                ) : (
                  <PaginationLink
                    href={resolvePageHref(item)}
                    isActive={item === current_page}
                    size="icon"
                    className={cn(
                      "rounded-xl size-9",
                      disabled && "pointer-events-none opacity-50"
                    )}
                    onClick={(e) => {
                      if (disabled) e.preventDefault();
                    }}
                  >
                    {item}
                  </PaginationLink>
                )}
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              text={nextLabel}
              href={onPageChange ? "#" : (canNext && nextHref ? nextHref : "#")}
              className={cn(
                "rounded-xl border-border/60 h-9 px-3",
                (!canNext || disabled) && "pointer-events-none opacity-50"
              )}
              onClick={(e) => {
                if (!canNext || disabled) {
                  e.preventDefault();
                  return;
                }
                if (onPageChange) {
                  e.preventDefault();
                  onPageChange(current_page + 1);
                }
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
