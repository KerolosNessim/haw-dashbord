"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { slugifyForLocale, type SlugLocale } from "@/lib/slugify";
import { cn } from "@/lib/utils";
import type {
  Control,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
  UseFormTrigger,
} from "react-hook-form";
import { Controller } from "react-hook-form";
import { Lock, Unlock } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export type SmartSlugFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  /** Watched English title (`title.en`, `name.en`, …) used when locked + syncing. */
  titleEn: string;
  /** Main label (e.g. translated “URL slug”) */
  label: React.ReactNode;
  /** Optional prefix above the input (e.g. `yoursite.com/blog/`) */
  slugPrefix?: React.ReactNode;
  placeholder?: string;
  /** Translated validation message for FieldError */
  errorMessage?: string;
  /**
   * When true and the slug is **linked** (lock on), slug is kept in sync with `slugify(source title)`.
   * Set `false` on edit screens so opening the linked mode does not overwrite the stored slug until they change the title again.
   * Fields always start **unlocked / manual** so typing works immediately; use the lock control to enable link-to-title.
   */
  syncFromTitleWhenLocked?: boolean;
  /** After blur, re-runs the resolver for this field (pass `trigger` from `useForm`). */
  trigger?: UseFormTrigger<T>;
  /** Which slug rules / normalization to use when `normalizeSlug` is true. */
  slugLocale?: SlugLocale;
  /**
   * When true, linked title sync, typing, and blur run `slugifyForLocale`.
   * Slugs should be URL segments, so the default is normalized/hyphenated text.
   */
  normalizeSlug?: boolean;
  className?: string;
  inputClassName?: string;
};

function SmartSlugFieldBody<T extends FieldValues>({
  field,
  titleEn,
  isSlugLocked,
  syncFromTitleWhenLocked,
  slugLocale,
  normalizeSlug,
  trigger,
  placeholder,
  inputClassName,
}: {
  field: ControllerRenderProps<T, FieldPath<T>>;
  titleEn: string;
  isSlugLocked: boolean;
  syncFromTitleWhenLocked: boolean;
  slugLocale: SlugLocale;
  normalizeSlug: boolean;
  trigger?: UseFormTrigger<T>;
  placeholder?: string;
  inputClassName?: string;
}) {
  const { value, onChange, onBlur, name, ref } = field;

  useEffect(() => {
    if (!isSlugLocked || !syncFromTitleWhenLocked) return;
    const next = normalizeSlug
      ? slugifyForLocale(slugLocale, titleEn ?? "")
      : String(titleEn ?? "").trim();
    if (value !== next) onChange(next);
  }, [
    titleEn,
    isSlugLocked,
    syncFromTitleWhenLocked,
    slugLocale,
    normalizeSlug,
    value,
    onChange,
  ]);

  const handleBlur = () => {
    if (normalizeSlug) {
      const raw = String(value ?? "");
      const fixed = slugifyForLocale(slugLocale, raw);
      if (fixed !== raw) onChange(fixed);
    }
    onBlur();
    void trigger?.(name);
  };

  return (
    <Input
      ref={ref}
      name={name}
      value={value ?? ""}
      onBlur={handleBlur}
      readOnly={isSlugLocked}
      dir="ltr"
      placeholder={placeholder}
      className={cn(
        "h-12 min-h-12 w-full min-w-0 rounded-2xl px-3 py-2 font-mono text-sm md:px-4",
        isSlugLocked && "cursor-not-allowed bg-muted/20",
        !isSlugLocked && "border-orange-200 focus-visible:border-orange-300",
        inputClassName,
      )}
      onChange={(e) => {
        const raw = e.target.value;
        onChange(normalizeSlug ? slugifyForLocale(slugLocale, raw) : raw);
      }}
    />
  );
}

export function SmartSlugField<T extends FieldValues>({
  control,
  name,
  titleEn,
  label,
  slugPrefix,
  placeholder,
  errorMessage,
  /** Default false: edit screens keep API slug; pass `true` (or `mode === "create"`) on create forms. */
  syncFromTitleWhenLocked = false,
  trigger,
  slugLocale = "en",
  normalizeSlug = true,
  className,
  inputClassName,
}: SmartSlugFieldProps<T>) {
  const { t } = useTranslation("translation", { keyPrefix: "forms.smart_slug" });
  const [isSlugLocked, setIsSlugLocked] = useState(() => syncFromTitleWhenLocked);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Field className={cn("min-w-0 w-full", className)}>
          <div className="flex w-full min-w-0 flex-col gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-fit shrink-0 gap-2 self-start px-2 font-semibold",
                !isSlugLocked && "text-orange-600 hover:bg-orange-50 hover:text-orange-700",
              )}
              onClick={() => setIsSlugLocked((v) => !v)}
            >
              {isSlugLocked ? (
                <>
                  <Lock className="h-3.5 w-3.5" />
                  {t("linked")}
                </>
              ) : (
                <>
                  <Unlock className="h-3.5 w-3.5" />
                  {t("manual")}
                </>
              )}
            </Button>
            <FieldLabel className="flex w-full min-w-0 flex-wrap items-center gap-2 wrap-break-word">{label}</FieldLabel>
          </div>
          {/* URLs stay LTR so prefix + input order is stable in RTL locales */}
          <div
            dir="ltr"
            className={cn(
              "flex w-full min-w-0 flex-col gap-2 sm:gap-3",
              slugPrefix != null && slugPrefix !== false && "sm:flex-row sm:items-center",
            )}
          >
            {slugPrefix != null && slugPrefix !== false && (
              <div className="flex shrink-0 items-center rounded-xl border border-border/50 bg-muted/15 px-3 py-2 font-mono text-[11px] leading-tight whitespace-nowrap text-muted-foreground sm:max-w-[min(100%,280px)] sm:border sm:shadow-none">
                {slugPrefix}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <SmartSlugFieldBody
                field={field}
                titleEn={titleEn}
                isSlugLocked={isSlugLocked}
                syncFromTitleWhenLocked={syncFromTitleWhenLocked}
                slugLocale={slugLocale}
                normalizeSlug={normalizeSlug}
                trigger={trigger}
                placeholder={placeholder}
                inputClassName={inputClassName}
              />
            </div>
          </div>
          <FieldError errors={errorMessage ? [{ message: errorMessage }] : undefined} />
        </Field>
      )}
    />
  );
}
