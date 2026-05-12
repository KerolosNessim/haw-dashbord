import { Button } from "@/components/ui/button";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";

import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";

import { useSaveCourse } from "@/features/courses/hooks/useSaveCourse";

import type { CourseFormValues } from "@/features/courses/types";

import { zodResolver } from "@hookform/resolvers/zod";

import { BookOpenCheck, ImageIcon, Languages, Save, Trash2 } from "lucide-react";

import { useEffect, useState } from "react";

import { Controller, useForm } from "react-hook-form";

import { useTranslation } from "react-i18next";

import * as z from "zod";



const localizedRequired = z.object({

  ar: z.string().min(1, { message: "validation.required" }),

  en: z.string().min(1, { message: "validation.required" }),

});



const courseSchema = z.object({

  title: localizedRequired,

  description: localizedRequired,

  price: z.string().optional(),

  compare_price: z.string().optional(),

  currency: z.string().optional(),

  objectives: z.object({

    ar: z.string(),

    en: z.string(),

  }),

});



type FormShape = z.infer<typeof courseSchema>;



function defaultValues(): CourseFormValues {

  return {

    title: { ar: "", en: "" },

    description: { ar: "", en: "" },

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



  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [coverPreview, setCoverPreview] = useState<string | null>(null);



  useEffect(() => {

    return () => {

      if (coverPreview?.startsWith("blob:")) URL.revokeObjectURL(coverPreview);

    };

  }, [coverPreview]);



  const {

    control,

    handleSubmit,

    reset,

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

        price: initialValues.price ?? "",

        compare_price: initialValues.compare_price ?? "",

        currency: initialValues.currency ?? "",

        objectives: initialValues.objectives ?? { ar: "", en: "" },

      });

      setCoverFile(null);

      setCoverPreview(null);

    }

  }, [initialValues, reset]);



  const displayCover = coverPreview || initialCoverUrl || null;



  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];

    if (!file) return;

    setCoverFile(file);

    setCoverPreview((prev) => {

      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);

      return URL.createObjectURL(file);

    });

    e.target.value = "";

  };



  const clearCover = () => {

    setCoverFile(null);

    setCoverPreview((prev) => {

      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);

      return null;

    });

  };



  const translateError = (msg: string | undefined) => (msg ? commonT(msg) : undefined);



  const onSubmit = (data: FormShape) => {

    const payload: CourseFormValues = {

      title: data.title,

      description: data.description,

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

          <Controller

            name="description.ar"

            control={control}

            render={({ field }) => (

              <Field>

                <FieldLabel>{t("description_ar")}</FieldLabel>

                <Textarea {...field} className="min-h-[120px] rounded-xl" dir="rtl" />

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

                <Textarea {...field} className="min-h-[120px] rounded-xl" dir="ltr" />

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

                <Textarea {...field} className="min-h-[120px] rounded-xl font-normal" dir="rtl" />

              </Field>

            )}

          />

          <Controller

            name="objectives.en"

            control={control}

            render={({ field }) => (

              <Field>

                <FieldLabel>{t("objectives_en")}</FieldLabel>

                <Textarea {...field} className="min-h-[120px] rounded-xl font-normal" dir="ltr" />

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



        <div className="space-y-3">

          <FieldLabel className="flex items-center gap-2">

            <ImageIcon className="h-4 w-4" />

            {t("cover_image")}

          </FieldLabel>

          {displayCover && (

            <div className="relative max-w-md overflow-hidden rounded-2xl border">

              <img src={displayCover} alt="" className="aspect-video w-full object-cover" />

            </div>

          )}

          <div className="flex flex-wrap gap-2">

            <Button type="button" variant="outline" className="rounded-xl" asChild>

              <label className="cursor-pointer">

                {t("choose_image")}

                <input type="file" accept="image/*" className="hidden" onChange={onFile} />

              </label>

            </Button>

            {(coverPreview || (mode === "edit" && coverFile)) && (

              <Button type="button" variant="ghost" className="rounded-xl text-rose-600" onClick={clearCover}>

                <Trash2 className="mr-1 h-4 w-4" />

                {t("remove_image")}

              </Button>

            )}

          </div>

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


