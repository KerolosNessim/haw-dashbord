import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { BasicInfoValues } from "./basic-info-form";

interface ServiceSocialMetaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  control: Control<BasicInfoValues>;
}

export default function ServiceSocialMetaDialog({
  open,
  onOpenChange,
  control,
}: ServiceSocialMetaDialogProps) {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "services.form" });
  const dir = i18n.dir();

  const localizedFields = [
    { name: "og_title" as const, label: t("og_title") },
    { name: "og_description" as const, label: t("og_description"), multiline: true },
    { name: "twitter_title" as const, label: t("twitter_title") },
    { name: "twitter_description" as const, label: t("twitter_description"), multiline: true },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className="max-h-[90vh] overflow-y-auto rounded-[24px] text-start sm:max-w-[640px]"
      >
        <DialogHeader className="text-start sm:text-start">
          <DialogTitle>{t("social_meta_dialog_title")}</DialogTitle>
          <DialogDescription>{t("social_meta_dialog_desc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {localizedFields.map(({ name, label, multiline }) => (
            <div key={name} className="space-y-3 rounded-2xl border border-dashed bg-muted/5 p-4">
              <p className="text-start text-xs font-bold uppercase tracking-wider text-primary/70">
                {label}
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Controller
                  name={`${name}.ar`}
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>{t("arabic")}</FieldLabel>
                      {multiline ? (
                        <Textarea
                          {...field}
                          dir="rtl"
                          className="min-h-[80px] rounded-xl resize-none"
                        />
                      ) : (
                        <Input {...field} dir="rtl" className="h-11 rounded-xl" />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name={`${name}.en`}
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>{t("english")}</FieldLabel>
                      {multiline ? (
                        <Textarea
                          {...field}
                          dir="ltr"
                          className="min-h-[80px] rounded-xl resize-none"
                        />
                      ) : (
                        <Input {...field} dir="ltr" className="h-11 rounded-xl" />
                      )}
                    </Field>
                  )}
                />
              </div>
            </div>
          ))}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="og_type"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("og_type")}</FieldLabel>
                  <Input {...field} placeholder="website" className="h-11 rounded-xl" />
                </Field>
              )}
            />
            <Controller
              name="twitter_card"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("twitter_card")}</FieldLabel>
                  <Input
                    {...field}
                    placeholder="summary_large_image"
                    className="h-11 rounded-xl"
                  />
                </Field>
              )}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" className="rounded-full px-8" onClick={() => onOpenChange(false)}>
            {t("social_meta_done")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
