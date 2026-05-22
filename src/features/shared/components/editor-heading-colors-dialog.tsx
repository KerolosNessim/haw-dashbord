"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { HeadingTagType } from "@lexical/rich-text";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DEFAULT_HEADING_COLORS,
  headingColors,
  resetHeadingColors,
  setHeadingColors,
} from "../lib/editor-colors";

const LEVELS: HeadingTagType[] = ["h1", "h2", "h3", "h4", "h5", "h6"];

type EditorHeadingColorsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
};

export function EditorHeadingColorsDialog({
  open,
  onOpenChange,
  onSaved,
}: EditorHeadingColorsDialogProps) {
  const { t } = useTranslation("translation", { keyPrefix: "editor" });
  const [draft, setDraft] = useState({ ...headingColors });

  useEffect(() => {
    if (!open) return;
    setDraft({ ...headingColors });
  }, [open]);

  const handleSave = () => {
    setHeadingColors(draft);
    onSaved?.();
    onOpenChange(false);
  };

  const handleReset = () => {
    resetHeadingColors();
    setDraft({ ...DEFAULT_HEADING_COLORS });
    onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>{t("heading_colors_title")}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{t("heading_colors_hint")}</p>
        <div className="grid grid-cols-1 gap-3 py-2">
          {LEVELS.map((level) => (
            <Field key={level} className="flex flex-row items-center gap-3">
              <FieldLabel className="w-10 shrink-0 font-bold uppercase">{level}</FieldLabel>
              <Input
                type="color"
                value={draft[level]}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, [level]: e.target.value }))
                }
                className="h-10 w-14 cursor-pointer rounded-lg border p-1"
              />
              <Input
                value={draft[level]}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, [level]: e.target.value }))
                }
                dir="ltr"
                className="font-mono text-sm rounded-xl"
              />
            </Field>
          ))}
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button type="button" variant="outline" onClick={handleReset}>
            {t("heading_colors_reset")}
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button type="button" onClick={handleSave}>
              {t("heading_colors_apply")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
