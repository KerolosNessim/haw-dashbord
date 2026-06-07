import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  codeNeedsRedirectTarget,
  DEFAULT_DELETE_SLUG_REDIRECT_CODE,
  type DeleteSlugRedirectPayload,
} from "@/lib/delete-slug-redirect";
import { BLOG_SLUG_REDIRECT_CODES, type BlogSlugRedirectCode } from "@/lib/http-redirect-codes";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export type DeleteWithSlugRedirectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  /** i18n key prefix for slug_redirect_code_* labels (e.g. `blogs`, `services.form`). */
  redirectLabelKeyPrefix: string;
  cancelLabel: string;
  deleteLabel: string;
  isPending: boolean;
  onConfirm: (payload: DeleteSlugRedirectPayload) => void | Promise<void>;
};

export function DeleteWithSlugRedirectDialog({
  open,
  onOpenChange,
  title,
  description,
  redirectLabelKeyPrefix,
  cancelLabel,
  deleteLabel,
  isPending,
  onConfirm,
}: DeleteWithSlugRedirectDialogProps) {
  const { t: redirectT } = useTranslation("translation", { keyPrefix: redirectLabelKeyPrefix });
  const [redirectAr, setRedirectAr] = useState<BlogSlugRedirectCode>(DEFAULT_DELETE_SLUG_REDIRECT_CODE);
  const [redirectEn, setRedirectEn] = useState<BlogSlugRedirectCode>(DEFAULT_DELETE_SLUG_REDIRECT_CODE);
  const [targetAr, setTargetAr] = useState("");
  const [targetEn, setTargetEn] = useState("");

  const payload: DeleteSlugRedirectPayload = {
    slug_redirect_code: { ar: redirectAr, en: redirectEn },
    slug_redirect_target: {
      ar: codeNeedsRedirectTarget(redirectAr) ? targetAr.trim() : "",
      en: codeNeedsRedirectTarget(redirectEn) ? targetEn.trim() : "",
    },
  };
  const missingArTarget = codeNeedsRedirectTarget(redirectAr) && !targetAr.trim();
  const missingEnTarget = codeNeedsRedirectTarget(redirectEn) && !targetEn.trim();
  const isConfirmDisabled = isPending || missingArTarget || missingEnTarget;

  return (
    <AlertDialog
      open={open}
        onOpenChange={(next) => {
        if (!next) {
          setRedirectAr(DEFAULT_DELETE_SLUG_REDIRECT_CODE);
          setRedirectEn(DEFAULT_DELETE_SLUG_REDIRECT_CODE);
          setTargetAr("");
          setTargetEn("");
        }
        onOpenChange(next);
      }}
    >
      <AlertDialogContent className="rounded-2xl sm:max-w-lg">
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-start">{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-1">
          <p className="text-sm text-muted-foreground">{redirectT("slug_redirect_code_hint")}</p>
          <div className="grid gap-4 sm:grid-cols-2">
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
                    <SelectItem key={`ar-${code}`} value={code}>
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
                    <SelectItem key={`en-${code}`} value={code}>
                      {redirectT(`slug_redirect_code_${code}`, { defaultValue: code })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {(codeNeedsRedirectTarget(redirectAr) || codeNeedsRedirectTarget(redirectEn)) ? (
            <div className="grid gap-4 rounded-xl border bg-muted/20 p-4 sm:grid-cols-2">
              {codeNeedsRedirectTarget(redirectAr) ? (
                <div className="space-y-2">
                  <Label className="text-xs">
                    {redirectT("slug_redirect_target_label", { defaultValue: "Redirect target" })} (AR)
                  </Label>
                  <Input
                    value={targetAr}
                    onChange={(e) => setTargetAr(e.target.value)}
                    placeholder="/blogs/new-slug"
                    className="rounded-xl"
                    dir="ltr"
                  />
                  {missingArTarget ? (
                    <p className="text-xs text-destructive">
                      {redirectT("slug_redirect_target_required", { defaultValue: "Target is required for redirects." })}
                    </p>
                  ) : null}
                </div>
              ) : null}
              {codeNeedsRedirectTarget(redirectEn) ? (
                <div className="space-y-2">
                  <Label className="text-xs">
                    {redirectT("slug_redirect_target_label", { defaultValue: "Redirect target" })} (EN)
                  </Label>
                  <Input
                    value={targetEn}
                    onChange={(e) => setTargetEn(e.target.value)}
                    placeholder="/blogs/new-slug"
                    className="rounded-xl"
                    dir="ltr"
                  />
                  {missingEnTarget ? (
                    <p className="text-xs text-destructive">
                      {redirectT("slug_redirect_target_required", { defaultValue: "Target is required for redirects." })}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <AlertDialogCancel type="button" className="rounded-xl" disabled={isPending}>
            {cancelLabel}
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            className="rounded-xl"
            disabled={isConfirmDisabled}
            onClick={() => void onConfirm(payload)}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : deleteLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
