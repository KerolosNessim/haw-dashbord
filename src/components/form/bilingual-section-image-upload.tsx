import { Button } from "@/components/ui/button";
import { FieldError, FieldLabel } from "@/components/ui/field";
import type { BilingualSectionImage } from "@/lib/bilingual-section-image";
import {
  emptyBilingualSectionImage,
  hasBilingualSectionImage,
  sectionImagePreview,
} from "@/lib/bilingual-section-image";
import { cn } from "@/lib/utils";
import { ImageIcon, ImagePlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  value: BilingualSectionImage | null | undefined;
  onChange: (next: BilingualSectionImage) => void;
  /** Translation key prefix, e.g. `services.form` */
  keyPrefix?: string;
  required?: boolean;
  errorMessage?: string;
  aspectClass?: string;
};

export function BilingualSectionImageUpload({
  value,
  onChange,
  keyPrefix = "services.form",
  required = true,
  errorMessage,
  aspectClass = "aspect-video min-h-[200px]",
}: Props) {
  const { t } = useTranslation("translation", { keyPrefix });
  const image = value ?? emptyBilingualSectionImage();
  const inputRefAr = useRef<HTMLInputElement>(null);
  const inputRefEn = useRef<HTMLInputElement>(null);
  const [previewAr, setPreviewAr] = useState<string | null>(() =>
    sectionImagePreview(image, "ar"),
  );
  const [previewEn, setPreviewEn] = useState<string | null>(() =>
    sectionImagePreview(image, "en"),
  );

  useEffect(() => {
    setPreviewAr((prev) =>
      prev?.startsWith("blob:") || prev?.startsWith("data:")
        ? prev
        : sectionImagePreview(image, "ar"),
    );
    setPreviewEn((prev) =>
      prev?.startsWith("blob:") || prev?.startsWith("data:")
        ? prev
        : sectionImagePreview(image, "en"),
    );
  }, [image.ar, image.en]);

  const handleChange = (locale: "ar" | "en", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const next = { ...image, [locale]: file };
    onChange(next);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (locale === "ar") setPreviewAr(result);
      else setPreviewEn(result);
    };
    reader.readAsDataURL(file);
  };

  const remove = (locale: "ar" | "en") => {
    const next = { ...image, [locale]: null };
    onChange(next);
    if (locale === "ar") {
      setPreviewAr(null);
      if (inputRefAr.current) inputRefAr.current.value = "";
    } else {
      setPreviewEn(null);
      if (inputRefEn.current) inputRefEn.current.value = "";
    }
  };

  const showRequiredError = required && !hasBilingualSectionImage(image) && errorMessage;

  return (
    <div className="space-y-4">
      <FieldLabel className="flex items-center gap-2 text-sm font-bold">
        <ImageIcon className="h-4 w-4 text-primary" />
        {t("sections.fields.image")}
      </FieldLabel>
      <p className="text-xs text-muted-foreground">{t("cover_per_locale_hint")}</p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {(["ar", "en"] as const).map((locale) => {
          const preview = locale === "ar" ? previewAr : previewEn;
          const inputRef = locale === "ar" ? inputRefAr : inputRefEn;
          const label = locale === "ar" ? t("cover_ar") : t("cover_en");
          return (
            <div key={locale} className="space-y-2">
              <FieldLabel className="text-xs font-bold uppercase tracking-wider opacity-50">
                {label}
              </FieldLabel>
              <div
                className={cn(
                  "relative group overflow-hidden rounded-[24px] border-2 border-dashed transition-all",
                  aspectClass,
                  preview
                    ? "border-primary/20 shadow-md"
                    : "border-border hover:border-primary/40 flex flex-col items-center justify-center bg-muted/10 cursor-pointer",
                )}
                onClick={() => !preview && inputRef.current?.click()}
              >
                {preview ? (
                  <>
                    <img
                      src={preview}
                      alt=""
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition-all group-hover:opacity-100">
                      <Button
                        type="button"
                        size="icon"
                        className="h-10 w-10 rounded-full bg-red-500 text-white shadow-xl"
                        onClick={(e) => {
                          e.stopPropagation();
                          remove(locale);
                        }}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="h-10 w-10 rounded-full shadow-xl"
                        onClick={(e) => {
                          e.stopPropagation();
                          inputRef.current?.click();
                        }}
                      >
                        <ImagePlus className="h-5 w-5" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2 p-6 text-center">
                    <ImagePlus className="mx-auto h-8 w-8 text-primary/60" />
                    <p className="text-sm font-semibold">{t("upload_image")}</p>
                  </div>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleChange(locale, e)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {showRequiredError ? (
        <FieldError errors={[{ message: errorMessage }]} />
      ) : null}
    </div>
  );
}
