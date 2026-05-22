"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Trash2,
} from "lucide-react";
import { useCallback, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  clampDisplayOrder,
  reorderList,
} from "../../lib/section-builder-reorder";

export type SectionListItem = {
  id: string;
};

type SectionBuilderListProps<T extends SectionListItem> = {
  items: T[];
  onReorder: (next: T[]) => void;
  onRemove: (index: number) => void;
  renderHeaderLabel: (item: T, index: number) => ReactNode;
  renderContent: (item: T, index: number) => ReactNode;
};

export function SectionBuilderList<T extends SectionListItem>({
  items,
  onReorder,
  onRemove,
  renderHeaderLabel,
  renderContent,
}: SectionBuilderListProps<T>) {
  const { t } = useTranslation("translation", {
    keyPrefix: "services.form.sections",
  });
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [orderDrafts, setOrderDrafts] = useState<Record<string, string>>({});

  const moveSection = useCallback(
    (from: number, to: number) => {
      onReorder(reorderList(items, from, to));
    },
    [items, onReorder],
  );

  const commitOrderInput = useCallback(
    (index: number, raw: string) => {
      const parsed = Number.parseInt(raw.trim(), 10);
      if (!Number.isFinite(parsed)) {
        setOrderDrafts((prev) => {
          const next = { ...prev };
          delete next[items[index]?.id];
          return next;
        });
        return;
      }
      const target = clampDisplayOrder(parsed, items.length) - 1;
      if (target !== index) {
        moveSection(index, target);
      }
      setOrderDrafts((prev) => {
        const next = { ...prev };
        delete next[items[index]?.id];
        return next;
      });
    },
    [items, moveSection],
  );

  const handleDragStart = (index: number) => {
    setDragIndex(index);
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (dropIndex: number) => {
    if (dragIndex !== null && dragIndex !== dropIndex) {
      moveSection(dragIndex, dropIndex);
    }
    handleDragEnd();
  };

  return (
    <div className="space-y-6">
      {items.map((item, index) => {
        const isDragging = dragIndex === index;
        const isDropTarget =
          dragOverIndex === index && dragIndex !== null && dragIndex !== index;
        const orderValue =
          orderDrafts[item.id] ?? String(index + 1);

        return (
          <div
            key={item.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverIndex(index);
            }}
            onDragLeave={() => {
              if (dragOverIndex === index) setDragOverIndex(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(index);
            }}
            className={cn(
              "group relative space-y-6 rounded-[24px] border bg-card p-6 shadow-sm transition-all",
              isDragging && "opacity-50",
              isDropTarget && "border-primary ring-2 ring-primary/30",
              !isDragging && "hover:shadow-md",
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
              <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  className="flex h-9 w-9 shrink-0 cursor-grab items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-muted-foreground active:cursor-grabbing"
                  title={t("drag_to_reorder")}
                  aria-label={t("drag_to_reorder")}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <GripVertical className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-2">
                  <label
                    htmlFor={`section-order-${item.id}`}
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    {t("order_number")}
                  </label>
                  <Input
                    id={`section-order-${item.id}`}
                    type="number"
                    min={1}
                    max={items.length}
                    value={orderValue}
                    onChange={(e) =>
                      setOrderDrafts((prev) => ({
                        ...prev,
                        [item.id]: e.target.value,
                      }))
                    }
                    onBlur={(e) => commitOrderInput(index, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        commitOrderInput(index, e.currentTarget.value);
                        e.currentTarget.blur();
                      }
                    }}
                    className="h-9 w-16 rounded-lg text-center font-bold"
                    dir="ltr"
                  />
                </div>

                <h4 className="truncate text-sm font-bold uppercase tracking-wider opacity-60">
                  {renderHeaderLabel(item, index)}
                </h4>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={index === 0}
                  onClick={() => moveSection(index, index - 1)}
                  title={t("move_up")}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={index >= items.length - 1}
                  onClick={() => moveSection(index, index + 1)}
                  title={t("move_down")}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  onClick={() => onRemove(index)}
                  title={t("remove_section")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="pt-2">{renderContent(item, index)}</div>
          </div>
        );
      })}
    </div>
  );
}
