import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_DELETE_SLUG_REDIRECT_CODE,
  type DeleteSlugRedirectPayload,
} from "@/lib/delete-slug-redirect";
import { BLOG_SLUG_REDIRECT_CODES, type BlogSlugRedirectCode } from "@/lib/http-redirect-codes";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export type BulkDeleteConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmationPhrase: string;
  typePhraseLabel: string;
  cancelLabel: string;
  deleteLabel: string;
  isPending: boolean;
  /** When set, shows HTTP redirect code selectors and passes payload to `onConfirm`. */
  redirectLabelKeyPrefix?: string;
  onConfirm: (redirect?: DeleteSlugRedirectPayload) => void | Promise<void>;
};

export function BulkDeleteConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmationPhrase,
  typePhraseLabel,
  cancelLabel,
  deleteLabel,
  isPending,
  redirectLabelKeyPrefix,
  onConfirm,
}: BulkDeleteConfirmationDialogProps) {
  const [typed, setTyped] = useState("");
  const [redirectAr, setRedirectAr] = useState<BlogSlugRedirectCode>(DEFAULT_DELETE_SLUG_REDIRECT_CODE);
  const [redirectEn, setRedirectEn] = useState<BlogSlugRedirectCode>(DEFAULT_DELETE_SLUG_REDIRECT_CODE);
  const { t: redirectT } = useTranslation("translation", {
    keyPrefix: redirectLabelKeyPrefix ?? "blogs.form",
  });

  useEffect(() => {
    if (!open) {
      setTyped("");
      setRedirectAr(DEFAULT_DELETE_SLUG_REDIRECT_CODE);
      setRedirectEn(DEFAULT_DELETE_SLUG_REDIRECT_CODE);
    }
  }, [open]);

  const trimmed = typed.trim();
  const matches = trimmed === confirmationPhrase;
  const redirectPayload: DeleteSlugRedirectPayload | undefined = redirectLabelKeyPrefix
    ? { slug_redirect_code: { ar: redirectAr, en: redirectEn } }
    : undefined;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setTyped("");
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {redirectLabelKeyPrefix ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{redirectT("slug_redirect_code_hint")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs">{redirectT("slug_redirect_code_label")} (AR)</Label>
                  <Select
                    value={redirectAr}
                    onValueChange={(v) => setRedirectAr(v as BlogSlugRedirectCode)}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOG_SLUG_REDIRECT_CODES.map((code) => (
                        <SelectItem key={`bulk-ar-${code}`} value={code}>
                          {redirectT(`slug_redirect_code_${code}`, { defaultValue: code })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">{redirectT("slug_redirect_code_label")} (EN)</Label>
                  <Select
                    value={redirectEn}
                    onValueChange={(v) => setRedirectEn(v as BlogSlugRedirectCode)}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOG_SLUG_REDIRECT_CODES.map((code) => (
                        <SelectItem key={`bulk-en-${code}`} value={code}>
                          {redirectT(`slug_redirect_code_${code}`, { defaultValue: code })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="bulk-delete-confirmation-input">{typePhraseLabel}</Label>
            <Input
              id="bulk-delete-confirmation-input"
              dir="ltr"
              autoComplete="off"
              placeholder={confirmationPhrase}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="rounded-xl"
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="rounded-xl"
            disabled={!matches || isPending}
            onClick={() => void onConfirm(redirectPayload)}
          >
            {deleteLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
