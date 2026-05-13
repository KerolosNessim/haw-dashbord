import { FormImageField } from "@/components/form/form-image-field";
import { SmartSlugField } from "@/components/form/smart-slug-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";

import { Input } from "@/components/ui/input";

import RichTextEditor from "@/features/shared/components/editor";

import { useSaveCourse } from "@/features/courses/hooks/useSaveCourse";

import type { CourseFormValues } from "@/features/courses/types";

import { zodResolver } from "@hookform/resolvers/zod";

import { BookOpenCheck, Languages, Link as LinkIcon, Save } from "lucide-react";

import { useEffect, useId, useState } from "react";

import { Controller, useForm } from "react-hook-form";

import { useTranslation } from "react-i18next";

import * as z from "zod";



const localizedRequired = z.object({

  ar: z.string().min(1, { message: "validation.required" }),

  en: z.string().min(1, { message: "validation.required" }),

});



// Matches the bilingual slug regexes used on blog categories: AR slug allows
// Arabic letters + digits + hyphens; EN slug stays lowercase ASCII.
const slugLatinPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const slugArabicPattern =
  /^(?:[a-z\d\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+(?:-[a-z\d\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+)*)$/u;

const localizedCourseSlug = z.object({
  ar: z
    .string()
    .min(1, { message: "validation.required" })
    .refine((s) => slugArabicPattern.test(s), { message: "validation.slug_format" }),
  en: z
    .string()
    .min(1, { message: "validation.required" })
    .refine((s) => slugLatinPattern.test(s), { message: "validation.slug_format" }),
});

const courseSchema = z.object({

  title: localizedRequired,

  description: localizedRequired,

  slug: localizedCourseSlug,

  is_active: z.boolean(),

  price: z.string().optional(),

  compare_price: z.string().optional(),

  currency: z.string().optional(),

  objectives: z.object({

    ar: z.string(),

    en: z.string(),

  }),

});



type FormShape = z.infer<typeof courseSchema>;

function richEditorHtml(value: unknown): string {
  const html = (value as { html?: unknown })?.html;
  return typeof html === "string" ? html : "";
}



function defaultValues(): CourseFormValues {

  return {

    title: { ar: "", en: "" },

    description: { ar: "", en: "" },

    slug: { ar: "", en: "" },

    is_active: true,

    price: "",

    compare_price: "",

    currency: "",

    objectives: { ar: "", en: "" },

  };

}



type CourseFormProps = {

  mode: "create" | "edit";

  courseId?: string;

  initialValues?: CourseFormValues | null;

  initialCoverUrl?: string | null;

  isInitialLoading?: boolean;

};



export default function CourseForm({

  mode,

  courseId,

  initialValues,

  initialCoverUrl,

  isInitialLoading,

}: CourseFormProps) {

  const { t } = useTranslation("translation", { keyPrefix: "courses.form" });

  const { t: commonT } = useTranslation("translation");

  const { saveMutation, isPending } = useSaveCourse(mode, courseId);

  const coverInputId = useId();

  const [coverFile, setCoverFile] = useState<File | null>(null);



  const {

    control,

    handleSubmit,

    reset,

    watch,

    trigger,

    formState: { errors },

  } = useForm<FormShape>({

    resolver: zodResolver(courseSchema),

    defaultValues: defaultValues(),

  });



  useEffect(() => {

    if (initialValues) {

      reset({

        title: initialValues.title,

        description: initialValues.description,

        slug: initialValues.slug ?? { ar: "", en: "" },

        is_active: initialValues.is_active ?? true,

        price: initialValues.price ?? "",

        compare_price: initialValues.compare_price ?? "",

        currency: initialValues.currency ?? "",

        objectives: initialValues.objectives ?? { ar: "", en: "" },

      });

      setCoverFile(null);

    }

  }, [initialValues, reset]);



  // Cover preview source: pending File takes priority, then the saved server URL.
  const coverPreviewValue: File | string | null =
    coverFile ?? (initialCoverUrl?.trim() ? initialCoverUrl : null);



  const translateError = (msg: string | undefined) => (msg ? commonT(msg) : undefined);

  const watchTitleAr = watch("title.ar");
  const watchTitleEn = watch("title.en");

  const onSubmit = (data: FormShape) => {

    const payload: CourseFormValues = {

      title: data.title,

      description: data.description,

      slug: {
        ar: data.slug.ar.trim(),
        en: data.slug.en.trim(),
      },

      is_active: data.is_active,

      price: data.price?.trim() ?? "",

      compare_price: data.compare_price?.trim() ?? "",

      currency: data.currency?.trim() ?? "",

      objectives: data.objectives,

    };

    void saveMutation({

      values: payload,

      imageFile: coverFile,

    });

  };



  if (isInitialLoading && mode === "edit") {

    return <div className="rounded-[32px] border bg-white p-12 text-center text-muted-foreground">{t("loading")}</div>;

  }



  return (

    <form onSubmit={handleSubmit(onSubmit)} className="animate-in fade-in space-y-10 duration-500">

      <div className="space-y-8 rounded-[32px] border bg-white p-8 shadow-sm">

        <div className="flex items-center gap-2 text-primary">

          <Languages className="h-5 w-5" />

          <h2 className="text-lg font-bold">{t("basic_section")}</h2>

        </div>



        <div className="grid gap-6 md:grid-cols-2">

          <Controller

            name="title.ar"

            control={control}

            render={({ field }) => (

              <Field>

                <FieldLabel>{t("title_ar")}</FieldLabel>

                <Input {...field} className="rounded-xl" dir="rtl" />

                <FieldError>{translateError(errors.title?.ar?.message)}</FieldError>

              </Field>

            )}

          />

          <Controller

            name="title.en"

            control={control}

            render={({ field }) => (

              <Field>

                <FieldLabel>{t("title_en")}</FieldLabel>

                <Input {...field} className="rounded-xl" dir="ltr" />

                <FieldError>{translateError(errors.title?.en?.message)}</FieldError>

              </Field>

            )}

          />

        </div>

        <div className="grid gap-6 md:grid-cols-2">

          <SmartSlugField<FormShape>

            control={control}

            name="slug.ar"

            slugLocale="ar"

            titleEn={watchTitleAr ?? ""}

            trigger={trigger}

            label={
              <span className="flex items-center gap-2 font-bold">
                <LinkIcon className="h-3 w-3" />
                {t("slug_ar")}
              </span>
            }

            placeholder={t("slug_placeholder_ar")}

            errorMessage={translateError(errors.slug?.ar?.message)}

            inputClassName="rounded-xl"

            syncFromTitleWhenLocked

          />

          <SmartSlugField<FormShape>

            control={control}

            name="slug.en"

            slugLocale="en"

            titleEn={watchTitleEn ?? ""}

            trigger={trigger}

            label={
              <span className="flex items-center gap-2 font-bold">
                <LinkIcon className="h-3 w-3" />
                {t("slug_en")}
              </span>
            }

            placeholder={t("slug_placeholder")}

            errorMessage={translateError(errors.slug?.en?.message)}

            inputClassName="rounded-xl"

            syncFromTitleWhenLocked

          />

          <p className="text-xs text-muted-foreground md:col-span-2">{t("slug_hint")}</p>

        </div>

        <div className="flex items-center gap-2 rounded-xl border border-dashed px-4 py-3">

          <Controller

            name="is_active"

            control={control}

            render={({ field }) => (

              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">

                <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(Boolean(v))} />

                {t("is_active")}

              </label>

            )}

          />

        </div>



        <div className="grid gap-6 md:grid-cols-2">

          <Controller

            name="description.ar"

            control={control}

            render={({ field }) => (

              <Field>

                <FieldLabel>{t("description_ar")}</FieldLabel>

                <RichTextEditor
                  dir="rtl"
                  value={field.value}
                  placeholder={t("description_ar")}
                  onChange={(value: unknown) => field.onChange(richEditorHtml(value))}
                />

                <FieldError>{translateError(errors.description?.ar?.message)}</FieldError>

              </Field>

            )}

          />

          <Controller

            name="description.en"

            control={control}

            render={({ field }) => (

              <Field>

                <FieldLabel>{t("description_en")}</FieldLabel>

                <RichTextEditor
                  dir="ltr"
                  value={field.value}
                  placeholder={t("description_en")}
                  onChange={(value: unknown) => field.onChange(richEditorHtml(value))}
                />

                <FieldError>{translateError(errors.description?.en?.message)}</FieldError>

              </Field>

            )}

          />

        </div>



        <div className="flex items-center gap-2 text-primary">

          <BookOpenCheck className="h-5 w-5" />

          <h2 className="text-lg font-bold">{t("objectives_section")}</h2>

        </div>

        <p className="text-sm text-muted-foreground">{t("objectives_hint")}</p>



        <div className="grid gap-6 md:grid-cols-2">

          <Controller

            name="objectives.ar"

            control={control}

            render={({ field }) => (

              <Field>

                <FieldLabel>{t("objectives_ar")}</FieldLabel>

                <RichTextEditor
                  dir="rtl"
                  value={field.value}
                  placeholder={t("objectives_ar")}
                  onChange={(value: unknown) => field.onChange(richEditorHtml(value))}
                />

              </Field>

            )}

          />

          <Controller

            name="objectives.en"

            control={control}

            render={({ field }) => (

              <Field>

                <FieldLabel>{t("objectives_en")}</FieldLabel>

                <RichTextEditor
                  dir="ltr"
                  value={field.value}
                  placeholder={t("objectives_en")}
                  onChange={(value: unknown) => field.onChange(richEditorHtml(value))}
                />

              </Field>

            )}

          />

        </div>



        <div className="grid gap-6 md:grid-cols-3">

          <Controller

            name="price"

            control={control}

            render={({ field }) => (

              <Field>

                <FieldLabel>{t("price")}</FieldLabel>

                <Input {...field} className="rounded-xl" inputMode="decimal" />

              </Field>

            )}

          />

          <Controller

            name="compare_price"

            control={control}

            render={({ field }) => (

              <Field>

                <FieldLabel>{t("compare_price")}</FieldLabel>

                <Input {...field} className="rounded-xl" inputMode="decimal" placeholder={t("compare_price_placeholder")} />

              </Field>

            )}

          />

          <Controller

            name="currency"

            control={control}

            render={({ field }) => (

              <Field>

                <FieldLabel>{t("currency")}</FieldLabel>

                <Input {...field} className="rounded-xl uppercase" placeholder="USD" dir="ltr" maxLength={8} />

              </Field>

            )}

          />

        </div>



        <div className="w-full space-y-2">

          <FormImageField
            inputId={coverInputId}
            className="w-full"
            aspectClassName="aspect-video w-full"
            label={t("cover_image")}
            emptyHint={t("choose_image")}
            value={coverPreviewValue}
            onChange={(file) => setCoverFile(file)}
          />

          {mode === "create" && !coverFile && (

            <p className="text-sm text-muted-foreground">{t("image_required_create")}</p>

          )}

        </div>

      </div>



      <Button

        type="submit"

        size="lg"

        disabled={isPending || (mode === "create" && !coverFile)}

        className="h-14 rounded-2xl px-10 font-bold shadow-lg"

      >

        <Save className="mr-2 h-5 w-5" />

        {t("save")}

      </Button>

    </form>

  );

}


