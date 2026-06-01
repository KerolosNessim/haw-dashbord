import { ImageIcon, Plus, X } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

import { Input } from "@/components/ui/input";
import type { BilingualAlt } from "../services/why-us-form-data";

export type GalleryExistingImage = {
  id: number;
  url: string;
  alt: BilingualAlt;
};

export type GalleryNewImage = {
  file: File;
  preview: string;
  alt: BilingualAlt;
};

type SectionMediaGalleryProps = {
  existingImages: GalleryExistingImage[];
  newImages: GalleryNewImage[];
  onAddFiles: (files: File[]) => void;
  onRemoveExisting: (id: number) => void;
  onRemoveNew: (index: number) => void;
  onUpdateExistingAlt: (id: number, lang: keyof BilingualAlt, value: string) => void;
  onUpdateNewAlt: (index: number, lang: keyof BilingualAlt, value: string) => void;
};

export function SectionMediaGallery({
  existingImages,
  newImages,
  onAddFiles,
  onRemoveExisting,
  onRemoveNew,
  onUpdateExistingAlt,
  onUpdateNewAlt,
}: SectionMediaGalleryProps) {
  const { t } = useTranslation("translation", {
    keyPrefix: "why_choose_us.general",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryCount = existingImages.length + newImages.length;

  const previewAlt = (alt: BilingualAlt) => alt.ar.trim() || alt.en.trim() || "";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) onAddFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-base font-bold">{t("gallery_images")}</span>
        <span className="text-xs font-medium text-muted-foreground bg-muted/10 px-2 py-1 rounded-full border">
          {galleryCount} {t("gallery_images")}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{t("gallery_hint")}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {existingImages.map((img) => (
          <div
            key={`existing-${img.id}`}
            className="group relative rounded-2xl border border-border/60 overflow-hidden bg-white shadow-sm"
          >
            <div className="aspect-square relative bg-muted/5">
              <img
                src={img.url}
                className="w-full h-full object-contain p-2"
                alt={previewAlt(img.alt) || t("image_alt_placeholder")}
              />
              <button
                type="button"
                onClick={() => onRemoveExisting(img.id)}
                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <GalleryAltFields
              alt={img.alt}
              onChange={(lang, value) => onUpdateExistingAlt(img.id, lang, value)}
              t={t}
            />
          </div>
        ))}

        {newImages.map((img, idx) => (
          <div
            key={`new-${idx}-${img.preview.slice(0, 24)}`}
            className="group relative rounded-2xl border border-primary/30 overflow-hidden bg-white shadow-sm"
          >
            <div className="aspect-square relative bg-muted/5">
              <img
                src={img.preview}
                className="w-full h-full object-contain p-2"
                alt={previewAlt(img.alt) || t("image_alt_placeholder")}
              />
              <span className="absolute top-2 left-2 text-[9px] font-bold uppercase bg-primary/90 text-white px-1.5 py-0.5 rounded">
                {t("new_image_badge")}
              </span>
              <button
                type="button"
                onClick={() => onRemoveNew(idx)}
                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <GalleryAltFields
              alt={img.alt}
              onChange={(lang, value) => onUpdateNewAlt(idx, lang, value)}
              t={t}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="aspect-square min-h-[200px] rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/5 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/40 hover:text-primary transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-border/60 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5 text-primary" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
            {t("add_gallery_images")}
          </span>
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        multiple
        onChange={handleFileChange}
      />
    </div>
  );
}

function GalleryAltFields({
  alt,
  onChange,
  t,
}: {
  alt: BilingualAlt;
  onChange: (lang: keyof BilingualAlt, value: string) => void;
  t: (key: string) => string;
}) {
  return (
    <div className="p-3 space-y-2 border-t border-border/40">
      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
        <ImageIcon className="w-3 h-3" />
        {t("image_alt")}
      </label>
      <div className="space-y-1">
        <span className="text-[9px] font-semibold text-muted-foreground">{t("image_alt_ar")}</span>
        <Input
          value={alt.ar}
          onChange={(e) => onChange("ar", e.target.value)}
          dir="rtl"
          placeholder={t("image_alt_placeholder")}
          className="h-9 rounded-lg text-sm"
        />
      </div>
      <div className="space-y-1">
        <span className="text-[9px] font-semibold text-muted-foreground">{t("image_alt_en")}</span>
        <Input
          value={alt.en}
          onChange={(e) => onChange("en", e.target.value)}
          placeholder={t("image_alt_placeholder")}
          className="h-9 rounded-lg text-sm"
        />
      </div>
    </div>
  );
}
