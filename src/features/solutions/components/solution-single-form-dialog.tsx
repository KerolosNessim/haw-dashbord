import { SmartSlugField } from "@/components/form/smart-slug-field";
import { FormImageField } from "@/components/form/form-image-field";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAllSolutionCategories } from "@/features/solution-categories/hooks/useAllSolutionCategories";
import { useCreateSolutionSingle } from "@/features/solutions/hooks/useCreateSolutionSingle";
import { useUpdateSolutionSingle } from "@/features/solutions/hooks/useUpdateSolutionSingle";
import type { SolutionFeature } from "@/features/solutions/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlignLeft, LayoutList, Link as LinkIcon, Loader2, Save } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";

const slugLatinPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const slugArabicPattern =
  /^(?:[a-z\d\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+(?:-[a-z\d\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+)*)$/u;

const schema = z.object({
  title_ar: z.string().min(1, { message: "validation.required" }),
  title_en: z.string().min(1, { message: "validation.required" }),
  des_ar: z.string().min(1, { message: "validation.required" }),
  des_en: z.string().min(1, { message: "validation.required" }),
  slug_ar: z
    .string()
    .min(1, { message: "validation.required" })
    .refine((s) => slugArabicPattern.test(s), { message: "validation.slug_format" }),
  slug_en: z
    .string()
    .min(1, { message: "validation.required" })
    .refine((s) => slugLatinPattern.test(s), { message: "validation.slug_format" }),
  is_active: z.boolean(),
  image: z.any().optional(),
  category_id: z.string().optional(),
});

export type SolutionSingleDialogValues = z.infer<typeof schema>;

function normalizeSlug(f: SolutionFeature | null): { ar: string; en: string } {
  if (!f?.slug) return { ar: "", en: "" };
  const s = f.slug;
  if (typeof s === "object" && s !== null && "ar" in s && "en" in s) {
    return { ar: String(s.ar ?? ""), en: String(s.en ?? "") };
  }
  return { ar: "", en: "" };
}

type SolutionSingleFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initial: SolutionFeature | null;
};

export default function SolutionSingleFormDialog({
  open,
  onOpenChange,
  mode,
  initial,
}: SolutionSingleFormDialogProps) {
  const { t } = useTranslation("translation", { keyPrefix: "solutions.dialog" });
  const { t: contentT } = useTranslation("translation", { keyPrefix: "solutions.content" });
  const { t: commonT, i18n } = useTranslation("translation");
  const { createMutation, isPending: isCreating } = useCreateSolutionSingle();
  const { updateMutation, isPending: isUpdating } = useUpdateSolutionSingle();
  const { data: categoryOptions = [], isLoading: categoriesLoading } = useAllSolutionCategories();
  const isPending = isCreating || isUpdating;

  const {
    control,
    handleSubmit,
    reset,
    watch,
    trigger,
    formState: { errors },
  } = useForm<SolutionSingleDialogValues>({
    resolver: zodResolver(schema) as Resolver<SolutionSingleDialogValues>,
    defaultValues: {
      title_ar: "",
      title_en: "",
      des_ar: "",
      des_en: "",
      slug_ar: "",
      slug_en: "",
      is_active: true,
      image: null,
      category_id: "",
    },
  });

  const watchTitleAr = watch("title_ar");
  const watchTitleEn = watch("title_en");

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initial) {
      const n = normalizeSlug(initial);
      reset({
        title_ar: initial.title?.ar ?? "",
        title_en: initial.title?.en ?? "",
        des_ar: initial.description?.ar ?? "",
        des_en: initial.description?.en ?? "",
        slug_ar: n.ar,
        slug_en: n.en,
        is_active: initial.is_active !== false,
        image: initial.image ?? null,
        category_id:
          initial.category_id != null && String(initial.category_id).trim() !== ""
            ? String(initial.category_id)
            : "",
      });
    } else if (mode === "create") {
      reset({
        title_ar: "",
        title_en: "",
        des_ar: "",
        des_en: "",
        slug_ar: "",
        slug_en: "",
        is_active: true,
        image: null,
        category_id: "",
      });
    }
  }, [open, mode, initial, reset]);

  const translateError = (msg: string | undefined) => (msg ? commonT(msg) : undefined);

  const onSubmit = async (data: SolutionSingleDialogValues) => {
    const payload = {
      title: { ar: data.title_ar, en: data.title_en },
      description: { ar: data.des_ar, en: data.des_en },
      slug: { ar: data.slug_ar, en: data.slug_en },
      is_active: data.is_active,
      category_id: data.category_id?.trim() ? data.category_id.trim() : null,
    };
    const imageFile = data.image instanceof File ? data.image : null;

    try {
      if (mode === "create") {
        await createMutation({ payload, imageFile });
      } else if (initial?.id != null) {
        await updateMutation({ id: initial.id, payload, imageFile });
      }
      onOpenChange(false);
    } catch {
      /* toast in hook */
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[92vh] max-w-[calc(100%-1rem)] overflow-y-auto rounded-[28px] p-6 sm:max-w-3xl"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <LayoutList className="h-5 w-5 text-primary" />
            {mode === "create" ? t("create_title") : t("edit_title")}
          </DialogTitle>
          <DialogDescription>{t("form_hint")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Controller
                name="image"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <FormImageField
                    inputId={`solution-dialog-image-${mode}`}
                    label={contentT("image")}
                    value={value}
                    onChange={onChange}
                    emptyHint={contentT("upload_image")}
                    aspectClassName="aspect-square"
                    disabled={isPending}
                  />
                )}
              />
            </div>

            <div className="space-y-5 lg:col-span-8">
              <Controller
                name="category_id"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-sm font-bold">{contentT("category")}</FieldLabel>
                    <Select
                      value={field.value && field.value.length > 0 ? field.value : "__none__"}
                      onValueChange={(v) => field.onChange(v === "__none__" ? "" : v)}
                      disabled={isPending || categoriesLoading}
                    >
                      <SelectTrigger className="h-11 rounded-xl w-full md:max-w-md">
                        <SelectValue placeholder={contentT("category_placeholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">{contentT("category_none")}</SelectItem>
                        {categoryOptions.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {i18n.language.startsWith("ar") ? c.nameAr || c.nameEn : c.nameEn || c.nameAr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                  name="title_ar"
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="text-sm font-bold">(AR) {contentT("feature_title")}</FieldLabel>
                      <Input {...field} dir="rtl" className="h-11 rounded-xl" />
                      <FieldError errors={[{ message: translateError(errors.title_ar?.message) }]} />
                    </Field>
                  )}
                />
                <Controller
                  name="title_en"
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="text-sm font-bold">{contentT("feature_title")} (EN)</FieldLabel>
                      <Input {...field} className="h-11 rounded-xl" />
                      <FieldError errors={[{ message: translateError(errors.title_en?.message) }]} />
                    </Field>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SmartSlugField<SolutionSingleDialogValues>
                  control={control}
                  name="slug_ar"
                  slugLocale="ar"
                  titleEn={watchTitleAr ?? ""}
                  trigger={trigger}
                  label={
                    <span className="flex items-center gap-2 text-sm font-bold">
                      <LinkIcon className="h-3 w-3" />
                      {contentT("slug_ar")}
                    </span>
                  }
                  slugPrefix={<span className="hidden sm:inline">{contentT("slug_prefix")}</span>}
                  errorMessage={translateError(errors.slug_ar?.message)}
                  inputClassName="h-11 rounded-xl"
                />
                <SmartSlugField<SolutionSingleDialogValues>
                  control={control}
                  name="slug_en"
                  slugLocale="en"
                  titleEn={watchTitleEn ?? ""}
                  trigger={trigger}
                  label={
                    <span className="flex items-center gap-2 text-sm font-bold">
                      <LinkIcon className="h-3 w-3" />
                      {contentT("slug_en")}
                    </span>
                  }
                  slugPrefix={<span className="hidden sm:inline">{contentT("slug_prefix")}</span>}
                  errorMessage={translateError(errors.slug_en?.message)}
                  inputClassName="h-11 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                  name="des_ar"
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="text-sm font-bold flex items-center gap-2">
                        <AlignLeft className="h-3.5 w-3.5 text-primary" />
                        (AR) {contentT("feature_description")}
                      </FieldLabel>
                      <Textarea {...field} dir="rtl" className="min-h-[88px] rounded-xl resize-none" />
                      <FieldError errors={[{ message: translateError(errors.des_ar?.message) }]} />
                    </Field>
                  )}
                />
                <Controller
                  name="des_en"
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="text-sm font-bold flex items-center gap-2">
                        <AlignLeft className="h-3.5 w-3.5 text-primary" />
                        {contentT("feature_description")} (EN)
                      </FieldLabel>
                      <Textarea {...field} className="min-h-[88px] rounded-xl resize-none" />
                      <FieldError errors={[{ message: translateError(errors.des_en?.message) }]} />
                    </Field>
                  )}
                />
              </div>

              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-muted/10 px-4 py-3">
                    <FieldLabel className="text-sm font-bold">{t("is_active")}</FieldLabel>
                    <Switch checked={field.value} onCheckedChange={field.onChange} dir="ltr" disabled={isPending} />
                  </div>
                )}
              />
            </div>
          </div>

          <DialogFooter className="border-t-0 bg-transparent p-0 sm:justify-end">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isPending} className="rounded-xl gap-2 font-bold">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
