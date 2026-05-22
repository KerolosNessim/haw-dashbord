import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { resolveImagePreviewFromUnknown } from "@/lib/resolve-media-url";
import { cn } from "@/lib/utils";
import { ImageIcon, ImagePlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type SocialMetaImageUploadProps = {
  label: string;
  value: File | string | null | undefined;
  onChange: (value: File | string | null) => void;
  uploadLabel: string;
  removeLabel: string;
};

export function SocialMetaImageUpload({
  label,
  value,
  onChange,
  uploadLabel,
  removeLabel,
}: SocialMetaImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(() =>
    resolveImagePreviewFromUnknown(value),
  );

  useEffect(() => {
    if (value instanceof File) {
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setPreview(resolveImagePreviewFromUnknown(value));
  }, [value]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange(file);
  };

  const remove = () => {
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
    setPreview(null);
  };

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <div
        className={cn(
          "relative aspect-[1.91/1] max-h-48 overflow-hidden rounded-2xl border-2 border-dashed transition-all",
          preview
            ? "border-primary/20 bg-muted/10"
            : "cursor-pointer border-border hover:border-primary/40 bg-muted/5",
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
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity hover:opacity-100">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
              >
                {uploadLabel}
              </Button>
              <Button
                type="button"
                size="icon"
                className="rounded-full bg-red-500 text-white hover:bg-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  remove();
                }}
                aria-label={removeLabel}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex h-full min-h-[140px] flex-col items-center justify-center gap-2 p-6 text-muted-foreground">
            <ImagePlus className="h-10 w-10 opacity-30" />
            <p className="text-xs font-bold opacity-50">{uploadLabel}</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>
      <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
        <ImageIcon className="h-3 w-3" />
        1200×630 recommended
      </p>
    </Field>
  );
}
