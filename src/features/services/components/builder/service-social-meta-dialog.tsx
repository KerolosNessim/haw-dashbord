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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RichTextEditor, { editorOnChangeToHtml } from "@/features/shared/components/editor";
import {
  OG_TYPE_OPTIONS,
  TWITTER_CARD_OPTIONS,
} from "@/features/services/constants/social-meta-options";
import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { BasicInfoValues } from "./basic-info-form";
import { SocialMetaImageUpload } from "./social-meta-image-upload";

interface ServiceSocialMetaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  control: Control<BasicInfoValues>;
}

const localizedFields = [
  { name: "og_title" as const, labelKey: "og_title" },
  { name: "og_description" as const, labelKey: "og_description" },
  { name: "twitter_title" as const, labelKey: "twitter_title" },
  { name: "twitter_description" as const, labelKey: "twitter_description" },
] as const;

export default function ServiceSocialMetaDialog({
  open,
  onOpenChange,
  control,
}: ServiceSocialMetaDialogProps) {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "services.form" });
  const dir = i18n.dir();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className="max-h-[90vh] overflow-y-auto rounded-[24px] text-start sm:max-w-[720px]"
      >
        <DialogHeader className="text-start sm:text-start">
          <DialogTitle>{t("social_meta_dialog_title")}</DialogTitle>
          <DialogDescription>{t("social_meta_dialog_desc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-2">
          <div className="space-y-3 rounded-2xl border border-dashed border-primary/20 bg-primary/5 p-4">
            <p className="text-start text-xs font-bold uppercase tracking-wider text-primary">
              Open Graph (Facebook, LinkedIn)
            </p>

            {localizedFields.slice(0, 2).map(({ name, labelKey }) => (
              <div key={name} className="space-y-3 rounded-xl border border-dashed bg-muted/5 p-4">
                <p className="text-start text-xs font-bold uppercase tracking-wider text-primary/70">
                  {t(labelKey)}
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Controller
                    name={`${name}.ar`}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel>{t("arabic")}</FieldLabel>
                        <div className="min-h-[100px]">
                          <RichTextEditor
                            value={field.value}
                            onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
                            dir="rtl"
                          />
                        </div>
                      </Field>
                    )}
                  />
                  <Controller
                    name={`${name}.en`}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel>{t("english")}</FieldLabel>
                        <div className="min-h-[100px]">
                          <RichTextEditor
                            value={field.value}
                            onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
                            dir="ltr"
                          />
                        </div>
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
                    <Select
                      value={field.value ?? "website"}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="h-11 w-full rounded-xl">
                        <SelectValue placeholder={t("og_type_placeholder")} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {OG_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {t(`og_type_${option}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
              <Controller
                name="og_image"
                control={control}
                render={({ field }) => (
                  <SocialMetaImageUpload
                    label={t("og_image")}
                    value={field.value}
                    onChange={field.onChange}
                    uploadLabel={t("upload_og_image")}
                    removeLabel={t("remove_image")}
                  />
                )}
              />
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-dashed border-sky-500/20 bg-sky-500/5 p-4">
            <p className="text-start text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
              Twitter / X
            </p>

            {localizedFields.slice(2).map(({ name, labelKey }) => (
              <div key={name} className="space-y-3 rounded-xl border border-dashed bg-muted/5 p-4">
                <p className="text-start text-xs font-bold uppercase tracking-wider text-primary/70">
                  {t(labelKey)}
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Controller
                    name={`${name}.ar`}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel>{t("arabic")}</FieldLabel>
                        <div className="min-h-[100px]">
                          <RichTextEditor
                            value={field.value}
                            onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
                            dir="rtl"
                          />
                        </div>
                      </Field>
                    )}
                  />
                  <Controller
                    name={`${name}.en`}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel>{t("english")}</FieldLabel>
                        <div className="min-h-[100px]">
                          <RichTextEditor
                            value={field.value}
                            onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
                            dir="ltr"
                          />
                        </div>
                      </Field>
                    )}
                  />
                </div>
              </div>
            ))}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                name="twitter_card"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t("twitter_card")}</FieldLabel>
                    <Select
                      value={field.value ?? "summary_large_image"}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="h-11 w-full rounded-xl">
                        <SelectValue placeholder={t("twitter_card_placeholder")} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {TWITTER_CARD_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {t(`twitter_card_${option}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
              <Controller
                name="twitter_image"
                control={control}
                render={({ field }) => (
                  <SocialMetaImageUpload
                    label={t("twitter_image")}
                    value={field.value}
                    onChange={field.onChange}
                    uploadLabel={t("upload_twitter_image")}
                    removeLabel={t("remove_image")}
                  />
                )}
              />
            </div>
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
