import { BilingualSectionImageUpload } from "@/components/form/bilingual-section-image-upload";
import { BilingualImageAltFields } from "@/components/form/bilingual-image-alt-fields";
import { SmartSlugField } from "@/components/form/smart-slug-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor, { editorOnChangeToHtml } from "@/features/shared/components/editor";
import { SOLUTION_TAXONOMY_CATEGORIES_KEY } from "@/features/solution-categories/query-keys";
import { useUpsertSolutionCategory } from "@/features/solution-categories/hooks/useUpsertSolutionCategory";
import type { SolutionCategoryRow } from "@/features/solution-categories/types";
import {
  emptySolutionCategoryFormValues,
  fetchSolutionCategoryById,
  rowToFormValues,
} from "@/features/solution-categories/services/taxonomy-categories-api";
import type { SolutionCategoryFormValues } from "@/features/solution-categories/types";
import { emptyBilingualImageAlt } from "@/lib/bilingual-image-alt";
import { emptyBilingualSectionImage } from "@/lib/bilingual-section-image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { FolderTree, Link as LinkIcon, Loader2, Save } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";

const imageAltSchema = z.object({
  ar: z.string(),
  en: z.string(),
});

const schema = z.object({
  name_ar: z.string().min(1, { message: "validation.required" }),
  name_en: z.string().optional().default(""),
  slug_ar: z.string().min(1, { message: "validation.required" }),
  slug_en: z.string().optional().default(""),
  des_ar: z.string(),
  des_en: z.string(),
  meta_title_ar: z.string(),
  meta_title_en: z.string(),
  meta_des_ar: z.string(),
  meta_des_en: z.string(),
  image: z
    .object({
      ar: z.union([z.instanceof(File), z.string(), z.null()]).optional(),
      en: z.union([z.instanceof(File), z.string(), z.null()]).optional(),
    })
    .default({ ar: null, en: null }),
  image_alt: imageAltSchema.default({ ar: "", en: "" }),
});

export type SolutionCategoryDialogValues = z.infer<typeof schema>;

type SolutionCategoryFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initial: SolutionCategoryRow | null;
};

function apiValuesToDialog(v: SolutionCategoryFormValues): SolutionCategoryDialogValues {
  return {
    name_ar: v.name.ar,
    name_en: v.name.en,
    slug_ar: v.slug.ar,
    slug_en: v.slug.en,
    des_ar: v.description.ar,
    des_en: v.description.en,
    meta_title_ar: v.meta_title.ar,
    meta_title_en: v.meta_title.en,
    meta_des_ar: v.meta_description.ar,
    meta_des_en: v.meta_description.en,
    image: v.image ?? emptyBilingualSectionImage(),
    image_alt: v.image_alt ?? emptyBilingualImageAlt(),
  };
}

function dialogToApiValues(data: SolutionCategoryDialogValues): SolutionCategoryFormValues {
  return {
    name: { ar: data.name_ar, en: data.name_en },
    slug: { ar: data.slug_ar, en: data.slug_en },
    description: { ar: data.des_ar, en: data.des_en },
    meta_title: { ar: data.meta_title_ar, en: data.meta_title_en },
    meta_description: { ar: data.meta_des_ar, en: data.meta_des_en },
    image: data.image ?? emptyBilingualSectionImage(),
    image_alt: data.image_alt ?? emptyBilingualImageAlt(),
  };
}

const emptyDialogValues = apiValuesToDialog(emptySolutionCategoryFormValues());

export default function SolutionCategoryFormDialog({
  open,
  onOpenChange,
  mode,
  initial,
}: SolutionCategoryFormDialogProps) {
  const { t } = useTranslation("translation", { keyPrefix: "solution_categories.dialog" });
  const { t: commonT } = useTranslation("translation");
  const { upsertMutation, isPending } = useUpsertSolutionCategory();

  const { data: categoryDetail, isLoading: detailLoading } = useQuery({
    queryKey: [...SOLUTION_TAXONOMY_CATEGORIES_KEY, "detail", initial?.id],
    queryFn: () => fetchSolutionCategoryById(initial!.id),
    enabled: open && mode === "edit" && Boolean(initial?.id),
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    trigger,
    formState: { errors },
  } = useForm<SolutionCategoryDialogValues>({
    resolver: zodResolver(schema) as Resolver<SolutionCategoryDialogValues>,
    defaultValues: emptyDialogValues,
  });

  const watchNameAr = watch("name_ar");
  const watchNameEn = watch("name_en");

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initial) {
      if (categoryDetail) {
        reset(apiValuesToDialog(categoryDetail));
        return;
      }
      if (!detailLoading) {
        reset(apiValuesToDialog(rowToFormValues(initial)));
      }
      return;
    }
    if (mode === "create") {
      reset(emptyDialogValues);
    }
  }, [open, mode, initial, categoryDetail, detailLoading, reset]);

  const translateError = (msg: string | undefined) => (msg ? commonT(msg) : undefined);

  const onSubmit = async (data: SolutionCategoryDialogValues) => {
    const values = dialogToApiValues(data);
    try {
      await upsertMutation({
        values,
        categoryId: mode === "edit" && initial ? initial.id : null,
      });
      onOpenChange(false);
    } catch {
      /* toast in hook */
    }
  };

  const formBusy = isPending || (mode === "edit" && detailLoading);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[92vh] max-w-[calc(100%-1rem)] overflow-y-auto rounded-[28px] p-6 sm:max-w-3xl"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <FolderTree className="h-5 w-5 text-primary" />
            {mode === "create" ? t("create_title") : t("edit_title")}
          </DialogTitle>
          <DialogDescription>{t("form_hint")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Controller
              name="name_ar"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-sm font-bold">(AR) {t("name")}</FieldLabel>
                  <Input {...field} dir="rtl" className="h-11 rounded-xl" />
                  <FieldError errors={[{ message: translateError(errors.name_ar?.message) }]} />
                </Field>
              )}
            />
            <Controller
              name="name_en"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-sm font-bold">{t("name")} (EN)</FieldLabel>
                  <Input {...field} className="h-11 rounded-xl" />
                  <FieldError errors={[{ message: translateError(errors.name_en?.message) }]} />
                </Field>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SmartSlugField<SolutionCategoryDialogValues>
              control={control}
              name="slug_ar"
              slugLocale="ar"
              titleEn={watchNameAr ?? ""}
              trigger={trigger}
              syncFromTitleWhenLocked={mode === "create"}
              label={
                <span className="flex items-center gap-2 text-sm font-bold">
                  <LinkIcon className="h-3 w-3" />
                  {t("slug_ar")}
                </span>
              }
              errorMessage={translateError(errors.slug_ar?.message)}
              inputClassName="h-11 rounded-xl"
            />
            <SmartSlugField<SolutionCategoryDialogValues>
              control={control}
              name="slug_en"
              slugLocale="en"
              titleEn={watchNameEn ?? ""}
              trigger={trigger}
              syncFromTitleWhenLocked={mode === "create"}
              label={
                <span className="flex items-center gap-2 text-sm font-bold">
                  <LinkIcon className="h-3 w-3" />
                  {t("slug_en")}
                </span>
              }
              errorMessage={translateError(errors.slug_en?.message)}
              inputClassName="h-11 rounded-xl"
            />
          </div>

          <Controller
            name="image"
            control={control}
            render={({ field }) => (
              <BilingualSectionImageUpload
                value={field.value}
                onChange={field.onChange}
                keyPrefix="solution_categories.dialog"
                required={false}
              />
            )}
          />

          <Controller
            name="image_alt"
            control={control}
            render={({ field }) => (
              <BilingualImageAltFields
                value={field.value}
                onChange={field.onChange}
                keyPrefix="solution_categories.dialog"
              />
            )}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Controller
              name="des_ar"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-sm font-bold">(AR) {t("description")}</FieldLabel>
                  <div className="min-h-[160px] rounded-xl border overflow-hidden">
                    <RichTextEditor
                      value={field.value}
                      onChange={(val) => {
                        const html = editorOnChangeToHtml(val);
                        field.onChange(html);
                      }}
                      dir="rtl"
                    />
                  </div>
                </Field>
              )}
            />
            <Controller
              name="des_en"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-sm font-bold">{t("description")} (EN)</FieldLabel>
                  <div className="min-h-[160px] rounded-xl border overflow-hidden">
                    <RichTextEditor
                      value={field.value}
                      onChange={(val) => {
                        const html = editorOnChangeToHtml(val);
                        field.onChange(html);
                      }}
                      dir="ltr"
                    />
                  </div>
                </Field>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Controller
              name="meta_title_ar"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-sm font-bold">(AR) {t("meta_title")}</FieldLabel>
                  <Input {...field} dir="rtl" className="h-11 rounded-xl" />
                </Field>
              )}
            />
            <Controller
              name="meta_title_en"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-sm font-bold">{t("meta_title")} (EN)</FieldLabel>
                  <Input {...field} className="h-11 rounded-xl" />
                </Field>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Controller
              name="meta_des_ar"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-sm font-bold">(AR) {t("meta_description")}</FieldLabel>
                  <Textarea {...field} dir="rtl" className="min-h-[72px] rounded-xl resize-none" />
                </Field>
              )}
            />
            <Controller
              name="meta_des_en"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-sm font-bold">{t("meta_description")} (EN)</FieldLabel>
                  <Textarea {...field} className="min-h-[72px] rounded-xl resize-none" />
                </Field>
              )}
            />
          </div>

          <DialogFooter className="border-t-0 bg-transparent p-0 sm:justify-end">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={formBusy} className="rounded-xl gap-2 font-bold">
              {formBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
