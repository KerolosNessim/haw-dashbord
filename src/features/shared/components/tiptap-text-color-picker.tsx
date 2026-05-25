"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useCurrentEditor } from "@tiptap/react";
import { Palette } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DEFAULT_TEXT_COLOR, TEXT_COLOR_PRESETS } from "../lib/editor-colors";

function normalizeHex(color: string): string {
  const v = color.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(v)) return v;
  if (/^#[0-9A-Fa-f]{3}$/.test(v)) {
    const r = v[1];
    const g = v[2];
    const b = v[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return v;
}

export default function TiptapTextColorPicker() {
  const { editor } = useCurrentEditor();
  const { t } = useTranslation("translation", { keyPrefix: "editor" });
  const [open, setOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState(DEFAULT_TEXT_COLOR);
  const [customColor, setCustomColor] = useState(DEFAULT_TEXT_COLOR);

  useEffect(() => {
    if (!editor) return;
    const sync = () => {
      const c = (editor.getAttributes("textStyle").color as string) || DEFAULT_TEXT_COLOR;
      setCurrentColor(c);
      setCustomColor(/^#/.test(c) ? c : DEFAULT_TEXT_COLOR);
    };
    sync();
    editor.on("selectionUpdate", sync);
    return () => editor.off("selectionUpdate", sync);
  }, [editor]);

  if (!editor) return null;

  const applyColor = (color: string | null) => {
    if (!color) {
      editor.chain().focus().unsetColor().run();
      setCurrentColor(DEFAULT_TEXT_COLOR);
      return;
    }
    const hex = normalizeHex(color);
    editor.chain().focus().setColor(hex).run();
    setCurrentColor(hex);
    setCustomColor(hex);
  };

  const displayColor = /^#/.test(currentColor) ? currentColor : DEFAULT_TEXT_COLOR;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title={t("text_color")}
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            "flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-border/60 bg-muted/25 px-2 transition-colors",
            "hover:bg-background hover:text-foreground",
          )}
        >
          <Palette size={16} strokeWidth={2} />
          <span
            className="size-4 rounded-sm border border-border shadow-inner"
            style={{ backgroundColor: displayColor }}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 rounded-xl p-3" dir="ltr">
        <p className="mb-2 text-xs font-bold text-muted-foreground">{t("text_color")}</p>
        <div className="grid grid-cols-5 gap-2">
          {TEXT_COLOR_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              title={preset.label}
              onMouseDown={(e) => {
                e.preventDefault();
                applyColor(preset.value);
              }}
              className={cn(
                "size-8 rounded-md border-2 transition-transform hover:scale-105",
                displayColor.toLowerCase() === preset.value.toLowerCase()
                  ? "border-primary"
                  : "border-transparent",
              )}
              style={{ backgroundColor: preset.value }}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="color"
            value={customColor}
            onChange={(e) => {
              const hex = normalizeHex(e.target.value);
              setCustomColor(hex);
              applyColor(hex);
            }}
            className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent p-0.5"
          />
          <span className="text-xs font-mono text-muted-foreground">{customColor}</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2 w-full text-xs"
          onMouseDown={(e) => {
            e.preventDefault();
            applyColor(null);
          }}
        >
          {t("text_color_reset")}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
