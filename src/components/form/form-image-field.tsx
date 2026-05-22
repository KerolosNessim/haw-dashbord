"use client";

import { BilingualImageAltFields } from "@/components/form/bilingual-image-alt-fields";
import { Button } from "@/components/ui/button";
import { FieldLabel } from "@/components/ui/field";
import type { BilingualImageAlt } from "@/lib/bilingual-image-alt";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { cn } from "@/lib/utils";
import { ImageIcon, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export type FormImageFieldProps = {
  /** Stable id for the hidden file input (unique per field instance). */
  inputId: string;
  label: React.ReactNode;
  value: string | File | null;
  onChange: (file: File | null) => void;
  /** Bilingual alt (AR/EN). When set with `onImageAltChange`, alt inputs render below the picker. */
  imageAlt?: BilingualImageAlt;
  onImageAltChange?: (alt: BilingualImageAlt) => void;
  /** i18n key prefix for alt labels (default `common.form`). */
  altKeyPrefix?: string;
  emptyHint?: React.ReactNode;
  /** Tailwind aspect class, e.g. aspect-square or aspect-video */
  aspectClassName?: string;
  className?: string;
  disabled?: boolean;
};

/**
 * Reusable image picker with preview (URL string or File) and clear.
 * Matches dashboard patterns used on blog featured image and section cards.
 */
export function FormImageField({
  inputId,
  label,
  value,
  onChange,
  imageAlt,
  onImageAltChange,
  altKeyPrefix = "common.form",
  emptyHint,
  aspectClassName = "aspect-square",
  className,
  disabled = false,
}: FormImageFieldProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setObjectUrl(null);
  }, [value]);

  const previewSrc =
    value instanceof File
      ? objectUrl
      : typeof value === "string" && value.trim()
        ? resolveMediaUrl(value.trim())
        : null;

  const openPicker = () => {
    if (disabled) return;
    document.getElementById(inputId)?.click();
  };

  return (
    <div className={cn("space-y-4", className)}>
      <FieldLabel className="text-sm font-bold flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-primary" />
        {label}
      </FieldLabel>

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
        className={cn(
          "relative overflow-hidden rounded-[32px] border-2 border-dashed transition-all bg-white flex flex-col items-center justify-center group/img",
          aspectClassName,
          previewSrc ? "border-primary/20 cursor-pointer" : "border-border hover:border-primary/40 cursor-pointer",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        {previewSrc ? (
          <>
            <img
              src={previewSrc}
              className="h-full w-full object-cover"
              alt=""
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover/img:opacity-100">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <Plus className="h-8 w-8 text-muted-foreground/40" />
            {emptyHint ? (
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{emptyHint}</p>
            ) : null}
          </div>
        )}
        <input
          id={inputId}
          type="file"
          className="hidden"
          accept="image/*"
          disabled={disabled}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onChange(file);
            e.target.value = "";
          }}
        />
      </div>

      {imageAlt && onImageAltChange ? (
        <BilingualImageAltFields
          value={imageAlt}
          onChange={onImageAltChange}
          keyPrefix={altKeyPrefix}
          disabled={disabled}
        />
      ) : null}
    </div>
  );
}
