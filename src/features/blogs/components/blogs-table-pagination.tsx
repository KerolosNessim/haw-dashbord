import { LaravelResourcePagination } from "@/components/ui/laravel-resource-pagination";
import type { LaravelPaginationMeta } from "@/lib/laravel-pagination";
import { useTranslation } from "react-i18next";

export type BlogsTablePaginationProps = {
  laravelMeta: LaravelPaginationMeta;
  rangeStart: number;
  rangeEnd: number;
  serverTotal: number;
  onPageChange: (page: number) => void;
  disabled: boolean;
  isRtl: boolean;
};

export function BlogsTablePagination({
  laravelMeta,
  rangeStart,
  rangeEnd,
  serverTotal,
  onPageChange,
  disabled,
  isRtl,
}: BlogsTablePaginationProps) {
  const { t } = useTranslation("translation", { keyPrefix: "blogs" });

  return (
    <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-muted/10 border-t border-border/40 gap-4">
      <p className="text-sm text-muted-foreground order-2 md:order-1">
        {t("showing_info", {
          start: rangeStart,
          end: rangeEnd,
          total: serverTotal,
        })}
      </p>
      <div className="order-1 md:order-2">
        <LaravelResourcePagination
          meta={laravelMeta}
          onPageChange={onPageChange}
          disabled={disabled}
          isRtl={isRtl}
          showSummary={false}
          previousLabel=""
          nextLabel=""
        />
      </div>
    </div>
  );
}
