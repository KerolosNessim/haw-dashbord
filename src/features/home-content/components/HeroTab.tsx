import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlignLeft,
  Home,
  Image as ImageIcon,
  Languages,
  Loader2,
  Phone as PhoneIcon,
  Save,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import RichTextEditor, { editorOnChangeToHtml } from "@/features/shared/components/editor";
import { cn } from "@/lib/utils";
import { getHttpErrorMessage } from "@/lib/http-error-message";
import { htmlForMultipartApi } from "@/lib/html-for-multipart-api";
import { BilingualImageAltFields } from "@/components/form/bilingual-image-alt-fields";
import {
  appendBilingualImageAlt,
  bilingualImageAltFromApi,
  emptyBilingualImageAlt,
  type BilingualImageAlt,
} from "@/lib/bilingual-image-alt";
import { useHero } from "../hooks/useHero";

/**
 * Validation schema for the Hero section
 * Handles both Arabic and English content
 */
function htmlFromEditor(value: unknown): string {
  return editorOnChangeToHtml(value);
}

function editorHasContent(value: unknown): boolean {
  const plain = htmlFromEditor(value)
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
  return plain.length > 0;
}

const editorRequired = z.custom<unknown>(editorHasContent, { message: "Required" });

const heroSchema = z.object({
  title_ar: editorRequired,
  title_en: editorRequired,
  des_ar: editorRequired,
  des_en: editorRequired,
  sup_des_ar: z.any().optional(),
  sup_des_en: z.any().optional(),
  phone: z.string().optional(),
});

type HeroFormValues = z.infer<typeof heroSchema>;

/**
 * HeroTab Component
 *
 * Provides an interface to manage the Hero section of the landing page.
 */
export default function HeroTab() {
  const { t } = useTranslation("translation", {
    keyPrefix: "home_content.hero",
  });

  const { getHero, updateHero, isPending, heroErrorFallbacks } = useHero();

  const { data, isLoading, isError, error, refetch, isFetching } = getHero;

  // userImage: undefined (using API data), null (deleted), string (new upload)
  const [userImage, setUserImage] = useState<string | null | undefined>(
    undefined,
  );
  const [userImageFile, setUserImageFile] = useState<File | null>(null);
  const [imageAlt, setImageAlt] = useState<BilingualImageAlt>(emptyBilingualImageAlt());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const raw = data?.data?.content?.image_alt ?? data?.data?.image_alt;
    if (raw != null) {
      setImageAlt(bilingualImageAltFromApi(raw));
    }
  }, [data]);

  const displayImage =
    userImage !== undefined ? userImage : data?.data?.content?.image || null;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<HeroFormValues>({
    resolver: zodResolver(heroSchema),
    values: {
      title_ar: data?.data?.content?.title?.ar || "",
      title_en: data?.data?.content?.title?.en || "",
      des_ar: data?.data?.content?.description?.ar || "",
      des_en: data?.data?.content?.description?.en || "",
      sup_des_ar: data?.data?.content?.sub_description?.ar || "",
      sup_des_en: data?.data?.content?.sub_description?.en || "",
      phone: data?.data?.phone || "",
    },
  });

  const onSubmit = (formValues: HeroFormValues) => {
    const formData = new FormData();
    formData.append("title[ar]", htmlForMultipartApi(htmlFromEditor(formValues.title_ar)));
    formData.append("title[en]", htmlForMultipartApi(htmlFromEditor(formValues.title_en)));
    formData.append(
      "description[ar]",
      htmlForMultipartApi(htmlFromEditor(formValues.des_ar)),
    );
    formData.append(
      "description[en]",
      htmlForMultipartApi(htmlFromEditor(formValues.des_en)),
    );
    formData.append(
      "sub_description[ar]",
      htmlForMultipartApi(htmlFromEditor(formValues.sup_des_ar)),
    );
    formData.append(
      "sub_description[en]",
      htmlForMultipartApi(htmlFromEditor(formValues.sup_des_en)),
    );
    formData.append("phone", formValues.phone ?? "");
    if (userImageFile instanceof File) {
      formData.append("image", userImageFile);
    }
    appendBilingualImageAlt(formData, "image_alt", imageAlt);

    updateHero(formData);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUserImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUserImage(null);
    setUserImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const loadErrorMessage = isError
    ? getHttpErrorMessage(error, {
        ...heroErrorFallbacks,
        default: t("load_error"),
      })
    : null;

  return isLoading ? (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  ) : isError ? (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-destructive/25 bg-destructive/5 p-10 text-center animate-in fade-in duration-300">
      <p className="max-w-md text-sm font-medium text-destructive">{loadErrorMessage}</p>
      <Button type="button" variant="outline" onClick={() => refetch()} disabled={isFetching}>
        {isFetching ? (
          <Loader2 className="me-2 size-4 animate-spin" />
        ) : null}
        {t("retry")}
      </Button>
    </div>
  ) : (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Home className="w-6 h-6 text-primary" />
            {t("title")}
          </h2>
          <p className="text-muted-foreground text-sm font-medium mt-1">
            {t("des")}
          </p>
        </div>
      </div>
      {/* Left Column: Form Fields */}
      <div className="lg:col-span-8 space-y-10">
        {/* Title Editor (AR & EN) */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <FieldLabel className="text-base font-bold flex items-center gap-2 ">
                ({t("ar")}) {t("title")}
                <Languages className="w-4 h-4 text-primary" />
              </FieldLabel>
              <Controller
                name="title_ar"
                control={control}
                render={({ field }) => (
                  <>
                    <RichTextEditor
                      key="hero-title-ar"
                      value={field.value}
                      onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
                      dir="rtl"
                      placeholder="أدخل العنوان هنا..."
                    />
                    <FieldError errors={[{ message: errors.title_ar?.message }]} />
                  </>
                )}
              />
            </div>
            <div className="space-y-3">
              <FieldLabel className="text-base font-bold flex items-center gap-2">
                <Languages className="w-4 h-4 text-primary" />
                {t("title")} ({t("en")})
              </FieldLabel>
              <Controller
                name="title_en"
                control={control}
                render={({ field }) => (
                  <>
                    <RichTextEditor
                      key="hero-title-en"
                      value={field.value}
                      onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
                      dir="ltr"
                      placeholder="Enter title here..."
                    />
                    <FieldError errors={[{ message: errors.title_en?.message }]} />
                  </>
                )}
              />
            </div>
          </div>
        </div>

        {/* Description (AR & EN) */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Controller
              name="des_ar"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-base font-bold flex items-center gap-2 ">
                    ({t("ar")}) {t("des")}
                    <AlignLeft className="w-4 h-4 text-primary" />
                  </FieldLabel>
                  <RichTextEditor
                    key="hero-des-ar"
                    value={field.value}
                    onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
                    dir="rtl"
                    placeholder="أدخل الوصف هنا..."
                  />
                  <FieldError errors={[{ message: errors.des_ar?.message }]} />
                </Field>
              )}
            />
            <Controller
              name="des_en"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-base font-bold flex items-center gap-2">
                    <AlignLeft className="w-4 h-4 text-primary" />
                    {t("des")} ({t("en")})
                  </FieldLabel>
                  <RichTextEditor
                    key="hero-des-en"
                    value={field.value}
                    onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
                    dir="ltr"
                    placeholder="Enter description here..."
                  />
                  <FieldError errors={[{ message: errors.des_en?.message }]} />
                </Field>
              )}
            />
          </div>
        </div>

        {/* Supplementary Description (AR & EN) */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Controller
              name="sup_des_ar"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-base font-bold flex items-center gap-2 ">
                    ({t("ar")}) {t("sup_des")}
                    <AlignLeft className="w-4 h-4 text-primary/60" />
                  </FieldLabel>
                  <RichTextEditor
                    key="hero-sup-des-ar"
                    value={field.value}
                    onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
                    dir="rtl"
                    placeholder="أدخل الوصف الإضافي هنا..."
                  />
                </Field>
              )}
            />
            <Controller
              name="sup_des_en"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-base font-bold flex items-center gap-2">
                    <AlignLeft className="w-4 h-4 text-primary/60" />
                    {t("sup_des")} ({t("en")})
                  </FieldLabel>
                  <RichTextEditor
                    key="hero-sup-des-en"
                    value={field.value}
                    onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
                    dir="ltr"
                    placeholder="Enter supplementary description here..."
                  />
                </Field>
              )}
            />
          </div>
        </div>

        {/* Phone (Single Field) */}
        <div className="space-y-6">
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel className="text-base font-bold flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4 text-primary" />
                  {t("phone")}
                </FieldLabel>
                <Input
                  {...field}
                  placeholder="أدخل رقم الهاتف... / Enter phone number..."
                  className="h-14 rounded-2xl bg-muted/5 border-border/60 focus:bg-white transition-all px-5 max-w-md"
                  dir="ltr"
                />
              </Field>
            )}
          />
        </div>
      </div>

      {/* Right Column: Image Management */}
      <div className="lg:col-span-4 space-y-6">
        <div className="sticky top-6">
          <FieldLabel className="text-base font-bold mb-4 block">
            {t("image")}
          </FieldLabel>

          <div
            onClick={triggerFileInput}
            className={cn(
              "relative group  cursor-pointer rounded-[40px] border-2 border-dashed border-muted-foreground/20 bg-muted/5 flex flex-col items-center justify-center overflow-hidden transition-all duration-500",
              displayImage
                ? "border-solid border-primary/20"
                : "hover:border-primary/40 hover:bg-primary/5 shadow-inner",
            )}
          >
            {displayImage ? (
              <>
                <img
                  src={displayImage}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  alt="Preview"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="rounded-full w-14 h-14 shadow-xl hover:scale-110 transition-transform"
                    onClick={removeImage}
                  >
                    <Trash2 className="w-6 h-6" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="p-10 text-center space-y-4">
                <div className="w-20 h-20 rounded-[32px] bg-primary/10 flex items-center justify-center mx-auto text-primary animate-pulse">
                  <ImageIcon className="w-10 h-10" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{t("upload_image")}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports JPG, PNG, WEBP
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

          <BilingualImageAltFields
            value={imageAlt}
            onChange={setImageAlt}
            keyPrefix="home_content.hero"
            className="mt-6"
          />

          {/* Action Buttons */}
          <div className="mt-8">
            <Button
              type="submit"
              size="lg"
              className="w-full rounded-[24px] h-16 font-black text-xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all gap-3 bg-primary text-white"
              disabled={isPending}
              >
                {isPending ?<Loader2 className="w-6 h-6 animate-spin" />: <Save className="w-6 h-6" />}
              {t("save")}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
