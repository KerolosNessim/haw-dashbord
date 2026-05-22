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
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export type EditorLinkValues = {
  url: string;
  nofollow: boolean;
  openInNewTab: boolean;
};

type EditorLinkDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: EditorLinkValues;
  onSubmit: (values: EditorLinkValues) => void;
  onRemove?: () => void;
};

export function EditorLinkDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
  onRemove,
}: EditorLinkDialogProps) {
  const { t } = useTranslation("translation", { keyPrefix: "editor" });
  const [url, setUrl] = useState("");
  const [nofollow, setNofollow] = useState(false);
  const [openInNewTab, setOpenInNewTab] = useState(false);

  useEffect(() => {
    if (!open) return;
    setUrl(initial?.url ?? "");
    setNofollow(initial?.nofollow ?? false);
    setOpenInNewTab(initial?.openInNewTab ?? false);
  }, [open, initial]);

  const handleSave = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    onSubmit({
      url: trimmed,
      nofollow,
      openInNewTab,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>{t("link_dialog_title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Field>
            <FieldLabel>{t("link_url")}</FieldLabel>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              dir="ltr"
              className="rounded-xl"
            />
          </Field>

          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <Checkbox checked={nofollow} onCheckedChange={(v) => setNofollow(v === true)} />
              {t("link_nofollow")}
            </label>
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <Checkbox
                checked={openInNewTab}
                onCheckedChange={(v) => setOpenInNewTab(v === true)}
              />
              {t("link_new_tab")}
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {onRemove ? (
            <Button type="button" variant="destructive" onClick={onRemove}>
              {t("link_remove")}
            </Button>
          ) : null}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button type="button" onClick={handleSave} disabled={!url.trim()}>
            {t("link_apply")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
