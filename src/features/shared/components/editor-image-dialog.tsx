"use client";

import { BilingualImageAltFields } from "@/components/form/bilingual-image-alt-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { BilingualImageAlt } from "@/lib/bilingual-image-alt";
import { emptyBilingualImageAlt } from "@/lib/bilingual-image-alt";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export type EditorImageDialogValues = {
  alt: BilingualImageAlt;
};

type EditorImageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string | null;
  initialAlt?: BilingualImageAlt;
  onSubmit: (values: EditorImageDialogValues) => void;
  isUploading?: boolean;
};

export function EditorImageDialog({
  open,
  onOpenChange,
  imageSrc,
  initialAlt,
  onSubmit,
  isUploading = false,
}: EditorImageDialogProps) {
  const { t } = useTranslation("translation", { keyPrefix: "editor" });
  const [alt, setAlt] = useState<BilingualImageAlt>(emptyBilingualImageAlt());

  useEffect(() => {
    if (!open) return;
    setAlt(initialAlt ?? emptyBilingualImageAlt());
  }, [open, initialAlt]);

  const handleInsert = () => {
    if (!imageSrc) return;
    onSubmit({ alt });
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle>{t("image_dialog_title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {imageSrc ? (
            <div className="overflow-hidden rounded-xl border bg-muted/20 p-2">
              <img
                src={imageSrc}
                alt=""
                className="mx-auto max-h-[200px] max-w-full rounded-lg object-contain"
              />
            </div>
          ) : isUploading ? (
            <p className="text-sm text-muted-foreground text-center py-8">{t("image_uploading")}</p>
          ) : null}

          <BilingualImageAltFields
            value={alt}
            onChange={setAlt}
            keyPrefix="editor"
            disabled={!imageSrc || isUploading}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={handleCancel}>
            {t("cancel")}
          </Button>
          <Button type="button" onClick={handleInsert} disabled={!imageSrc || isUploading}>
            {t("image_insert")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
