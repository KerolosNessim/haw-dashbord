import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Upload } from "lucide-react";
import { useRef, type ComponentProps, type ReactNode } from "react";

type ExcelImportButtonProps = {
  onFile: (file: File) => void;
  isPending?: boolean;
  disabled?: boolean;
  label: string;
  accept?: string;
  className?: string;
  size?: ComponentProps<typeof Button>["size"];
  variant?: ComponentProps<typeof Button>["variant"];
};

export function ExcelImportButton({
  onFile,
  isPending = false,
  disabled = false,
  label,
  accept = ".xlsx,.xls",
  className,
  size = "lg",
  variant = "outline",
}: ExcelImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled || isPending}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          if (inputRef.current) inputRef.current.value = "";
        }}
      />
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={disabled || isPending}
        className={cn("rounded-xl font-semibold", className)}
        onClick={() => inputRef.current?.click()}
      >
        {isPending ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <Upload className="mr-2 size-4" />
        )}
        {label}
      </Button>
    </>
  );
}

type ExcelImportIconButtonProps = {
  onFile: (file: File) => void;
  isPending?: boolean;
  disabled?: boolean;
  title: string;
  accept?: string;
  className?: string;
  children?: ReactNode;
};

export function ExcelImportIconButton({
  onFile,
  isPending = false,
  disabled = false,
  title,
  accept = ".xlsx,.xls",
  className,
  children,
}: ExcelImportIconButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled || isPending}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          if (inputRef.current) inputRef.current.value = "";
        }}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        title={title}
        disabled={disabled || isPending}
        className={className}
        onClick={() => inputRef.current?.click()}
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : children ?? <Upload className="w-4 h-4" />}
      </Button>
    </>
  );
}
