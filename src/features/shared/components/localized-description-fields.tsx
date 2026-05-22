import { useId } from "react";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
  type UseFormClearErrors,
  type UseFormTrigger,
} from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import RichTextEditor, { editorOnChangeToHtml } from "./editor";
import { hasRichTextContent } from "@/lib/zod-rich-text";

type Props<T extends FieldValues> = {
  control: Control<T>;
  nameAr: FieldPath<T>;
  nameEn: FieldPath<T>;
  labelAr: string;
  labelEn: string;
  placeholder?: string;
  translateError?: (msg: string | undefined) => string | undefined;
  clearErrors?: UseFormClearErrors<T>;
  trigger?: UseFormTrigger<T>;
  className?: string;
  minHeightClass?: string;
};

function bindRichTextField<T extends FieldValues>(
  field: { value: unknown; onChange: (v: string) => void; onBlur: () => void },
  name: FieldPath<T>,
  clearErrors: (name?: FieldPath<T> | FieldPath<T>[]) => void,
  trigger: (name?: FieldPath<T> | FieldPath<T>[]) => Promise<boolean>,
  val: unknown,
) {
  const html = editorOnChangeToHtml(val);
  field.onChange(html);
  if (hasRichTextContent(html) && clearErrors && trigger) {
    clearErrors(name);
    void trigger(name);
  }
}

/** Bilingual description fields using the shared Lexical rich text editor. */
export function LocalizedDescriptionFields<T extends FieldValues>({
  control,
  nameAr,
  nameEn,
  labelAr,
  labelEn,
  placeholder,
  translateError = (msg) => msg,
  clearErrors,
  trigger,
  className = "grid grid-cols-1 gap-6 lg:grid-cols-2",
  minHeightClass = "min-h-[160px]",
}: Props<T>) {
  const instanceId = useId().replace(/:/g, "");

  return (
    <div className={className}>
      <Controller
        name={nameAr}
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>{labelAr}</FieldLabel>
            <div className={minHeightClass}>
              <RichTextEditor
                editorNamespace={`editor-ar-${instanceId}`}
                value={field.value}
                onChange={(val) =>
                  bindRichTextField(
                    field,
                    nameAr,
                    clearErrors,
                    trigger,
                    val,
                  )
                }
                dir="rtl"
                placeholder={placeholder}
                autoFocus={false}
              />
            </div>
            {fieldState.error?.message ? (
              <FieldError
                errors={[
                  { message: translateError(fieldState.error.message) },
                ]}
              />
            ) : null}
          </Field>
        )}
      />
      <Controller
        name={nameEn}
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>{labelEn}</FieldLabel>
            <div className={minHeightClass}>
              <RichTextEditor
                editorNamespace={`editor-en-${instanceId}`}
                value={field.value}
                onChange={(val) =>
                  bindRichTextField(field, nameEn, clearErrors, trigger, val)
                }
                dir="ltr"
                placeholder={placeholder}
                autoFocus={false}
              />
            </div>
            {fieldState.error?.message ? (
              <FieldError
                errors={[
                  { message: translateError(fieldState.error.message) },
                ]}
              />
            ) : null}
          </Field>
        )}
      />
    </div>
  );
}
