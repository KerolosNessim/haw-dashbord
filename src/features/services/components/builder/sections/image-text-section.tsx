import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { BilingualImageAltFields } from "@/components/form/bilingual-image-alt-fields";
import { useEmbeddedSectionWatch } from "@/features/services/hooks/useEmbeddedSectionWatch";
import type { SectionEmbeddedProps } from "../section-embedded-props";
import RichTextEditor, { editorOnChangeToHtml } from "@/features/shared/components/editor";
import { LocalizedRichTextField } from "../localized-rich-text-field";
import { bilingualImageAltFromApi } from "@/lib/bilingual-image-alt";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, ImagePlus, X } from "lucide-react";
import { resolveImagePreviewFromUnknown } from "@/lib/resolve-media-url";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";

const localizedSchema = z.object({
  ar: z.string().min(1, { message: "validation.required" }),
  en: z.string().optional().default(""),
});

const localizedEditorSchema = z.object({
  ar: z
    .any()
    .refine((val) => val && !val.isEmpty, { message: "validation.required" }),
  en: z.any().optional(),
});

const imageAltSchema = z.object({
  ar: z.string(),
  en: z.string(),
});

const imageTextSchema = z.object({
  title: localizedSchema,
  description: localizedEditorSchema,
  image: z.any().refine((file) => !!file, { message: "validation.required" }),
  image_alt: imageAltSchema,
});

type ImageTextValues = z.infer<typeof imageTextSchema>;

interface ImageTextSectionProps extends SectionEmbeddedProps {
  serviceId: number;
  index: number;
  initialData?: any;
}

export default function ImageTextSection({
  serviceId,
  initialData,
  embedded,
  onDataChange,
}: ImageTextSectionProps) {
  const { t } = useTranslation("translation", { keyPrefix: "services.form" });

  const [imagePreview, setImagePreview] = useState<string | null>(() =>
    resolveImagePreviewFromUnknown(initialData?.image),
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const resolved = resolveImagePreviewFromUnknown(initialData?.image);
    setImagePreview((prev) => {
      if (prev?.startsWith("blob:") || prev?.startsWith("data:")) return prev;
      return resolved;
    });
  }, [initialData?.image]);

  const {
    control,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<ImageTextValues>({
    resolver: zodResolver(imageTextSchema),
    values: {
      title: initialData?.title || { ar: "", en: "" },
      description: initialData?.description || { ar: null, en: null },
      image: initialData?.image || null,
      image_alt: bilingualImageAltFromApi(initialData?.image_alt),
      items: initialData?.items || [],
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("image", file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setValue("image", null, { shouldValidate: true });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEmbeddedSectionWatch(embedded, onDataChange, watch, getValues);

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Arabic Content */}
        <div className="space-y-6 p-6 rounded-[24px] border border-dashed bg-muted/5">
          <div className="flex items-center gap-2 text-primary/60 font-bold text-xs uppercase tracking-widest">
            {t("arabic")}
          </div>
          <LocalizedRichTextField
            control={control}
            name="title.ar"
            label={t("sections.fields.title")}
            dir="rtl"
            placeholder={t("placeholders.title")}
            errorMessage={
              errors.title?.ar?.message
                ? t(errors.title.ar.message as any)
                : undefined
            }
          />
          <Controller
            name="description.ar"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("sections.fields.content")}</FieldLabel>
                <div className="min-h-[200px]">
                  <RichTextEditor
                    value={field.value}
                    onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
                    dir="rtl"
                    placeholder={t("placeholders.description")}
                  />
                </div>
                <FieldError
                  errors={[
                    {
                      message: errors.description?.ar?.message
                        ? t(errors.description.ar.message as any)
                        : undefined,
                    },
                  ]}
                />
              </Field>
            )}
          />
        </div>

        {/* English Content */}
        <div className="space-y-6 p-6 rounded-[24px] border border-dashed bg-muted/5">
          <div className="flex items-center gap-2 text-primary/60 font-bold text-xs uppercase tracking-widest">
            {t("english")}
          </div>
          <LocalizedRichTextField
            control={control}
            name="title.en"
            label={t("sections.fields.title")}
            dir="ltr"
            placeholder={t("placeholders.title")}
            errorMessage={
              errors.title?.en?.message
                ? t(errors.title.en.message as any)
                : undefined
            }
          />
          <Controller
            name="description.en"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{t("sections.fields.content")}</FieldLabel>
                <div className="min-h-[200px]">
                  <RichTextEditor
                    value={field.value}
                    onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
                    dir="ltr"
                    placeholder={t("placeholders.description")}
                  />
                </div>
                <FieldError
                  errors={[
                    {
                      message: errors.description?.en?.message
                        ? t(errors.description.en.message as any)
                        : undefined,
                    },
                  ]}
                />
              </Field>
            )}
          />
        </div>
      </div>

      {/* Image Upload Area */}
      <div className="space-y-4 mx-auto w-full">
        <FieldLabel className="text-sm font-bold flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-primary" />{" "}
          {t("sections.fields.image")}
        </FieldLabel>
        <div
          className={cn(
            "relative group overflow-hidden rounded-[32px] border-2 border-dashed transition-all",
            imagePreview
              ? "border-primary/20 aspect-video shadow-lg"
              : "border-border hover:border-primary/40 min-h-[300px] flex flex-col items-center justify-center bg-muted/10 cursor-pointer",
          )}
          onClick={() => !imagePreview && fileInputRef.current?.click()}
        >
          {imagePreview ? (
            <>
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                <Button
                  type="button"
                  size="icon"
                  className="rounded-full h-12 w-12 bg-red-500 hover:bg-red-600 transition-colors shadow-xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage();
                  }}
                >
                  <X className="w-6 h-6" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="rounded-full h-12 w-12 shadow-xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <ImagePlus className="w-6 h-6" />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center p-8 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto text-primary animate-bounce-slow">
                <ImagePlus className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold">{t("upload_image")}</p>
                <p className="text-xs opacity-40 uppercase tracking-tighter">
                  Recommended size: 1200x800px
                </p>
              </div>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
        <FieldError
          errors={[
            {
              message: errors.image?.message
                ? t(errors.image.message as any)
                : undefined,
            },
          ]}
        />
        <Controller
          name="image_alt"
          control={control}
          render={({ field }) => (
            <BilingualImageAltFields
              value={field.value}
              onChange={field.onChange}
              keyPrefix="services.form"
            />
          )}
        />
      </div>

    </div>
  );
}
