import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import RichTextEditor, { editorOnChangeToHtml } from "@/features/shared/components/editor";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";

type LocalizedRichTextFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: React.ReactNode;
  dir: "rtl" | "ltr";
  placeholder?: string;
  minHeightClass?: string;
  errorMessage?: string;
  labelClassName?: string;
};

export function LocalizedRichTextField<T extends FieldValues>({
  control,
  name,
  label,
  dir,
  placeholder,
  minHeightClass = "min-h-[120px]",
  errorMessage,
  labelClassName,
}: LocalizedRichTextFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Field>
          <FieldLabel className={labelClassName}>{label}</FieldLabel>
          <div className={minHeightClass}>
            <RichTextEditor
              value={field.value}
              onChange={(val) => field.onChange(editorOnChangeToHtml(val))}
              dir={dir}
              placeholder={placeholder}
            />
          </div>
          {errorMessage ? (
            <FieldError errors={[{ message: errorMessage }]} />
          ) : null}
        </Field>
      )}
    />
  );
}
