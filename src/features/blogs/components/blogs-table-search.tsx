import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

export type BlogsTableSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function BlogsTableSearch({ value, onChange }: BlogsTableSearchProps) {
  const { t } = useTranslation("translation", { keyPrefix: "blogs" });

  return (
    <div className="relative w-full md:flex-1 md:max-w-sm md:min-w-[200px]">
      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-60" />
      <Input
        placeholder={t("table.search_placeholder") || "Search..."}
        className="h-11 pr-10 rounded-xl border-border/60 bg-muted/5 focus-visible:ring-primary/20"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
