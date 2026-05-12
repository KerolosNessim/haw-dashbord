import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader2, Save, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";
import type { Country } from "@/features/countries/types";
import { useSaveCountry } from "@/features/countries/hooks/useCountries";

import { toast } from "sonner";

const countrySchema = z.object({
  id: z.number().optional(),
  name_ar: z.string().min(1, { message: "validation.required" }),
  name_en: z.string().min(1, { message: "validation.required" }),
  is_active: z.boolean(),
  image: z.any().optional(),
});

type CountryFormValues = z.infer<typeof countrySchema>;

interface CountryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  country?: Country | null;
}

export default function CountryDialog({
  open,
  onOpenChange,
  country,
}: CountryDialogProps) {
  const { t } = useTranslation("translation", { keyPrefix: "countries" });
  const { t: commonT } = useTranslation("translation");
  const { mutateAsync: saveCountry, isPending } = useSaveCountry();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CountryFormValues>({
    resolver: zodResolver(countrySchema),
    defaultValues: {
      name_ar: "",
      name_en: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (country) {
      reset({
        id: country.id,
        name_ar: country.name.ar,
        name_en: country.name.en,
        is_active: country.is_active,
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setImagePreview(country.image);
    } else {
      reset({
        name_ar: "",
        name_en: "",
        is_active: true,
      });
      setImagePreview(null);
    }
  }, [country, reset, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("image", file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setValue("image", null, { shouldValidate: true });
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const onSubmit = async (values: CountryFormValues) => {
    try {
      const formData = new FormData();
      if (values.id) formData.append("id", String(values.id));
      formData.append("name[ar]", values.name_ar);
      formData.append("name[en]", values.name_en);
      formData.append("is_active", values.is_active ? "1" : "0");
      if (values.image instanceof File) {
        formData.append("image", values.image);
      }

      await saveCountry(formData);
      toast.success(commonT("success_message") || "Saved successfully");
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error(commonT("error_message") || "Something went wrong");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl! max-h-[90vh] overflow-y-auto no-scrollbar rounded-[32px] p-0 border-none shadow-2xl">
        <DialogHeader className="p-8 bg-muted/30 border-b">
          <DialogTitle className="text-2xl font-black">
            {country ? t("edit_country") : t("add_button")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              name="name_ar"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("form.name_ar")}</FieldLabel>
                  <Input
                    {...field}
                    dir="rtl"
                    className="h-12 rounded-2xl bg-muted/20 border-border/50"
                  />
                  <FieldError errors={[{ message: errors.name_ar?.message ? commonT(errors.name_ar.message) : undefined }]} />
                </Field>
              )}
            />

            <Controller
              name="name_en"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("form.name_en")}</FieldLabel>
                  <Input
                    {...field}
                    dir="ltr"
                    className="h-12 rounded-2xl bg-muted/20 border-border/50"
                  />
                  <FieldError errors={[{ message: errors.name_en?.message ? commonT(errors.name_en.message) : undefined }]} />
                </Field>
              )}
            />
          </div>

          <div className="space-y-4">
            <FieldLabel>{t("form.image")}</FieldLabel>
            <div
              className={cn(
                "relative  rounded-3xl border-2 border-dashed transition-all overflow-hidden bg-muted/10 flex flex-col items-center justify-center cursor-pointer",
                imagePreview ? "border-primary/20" : "border-border hover:border-primary/40"
              )}
              onClick={() => !imagePreview && imageInputRef.current?.click()}
            >
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-all flex items-center justify-center">
                    <Button
                      type="button"
                      size="icon"
                      className="rounded-full h-10 w-10 shadow-xl bg-red-500 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 p-8">
                  <ImagePlus className="w-10 h-10 opacity-20" />
                  <p className="text-xs font-bold opacity-30">{t("form.upload_image")}</p>
                </div>
              )}
              <input
                type="file"
                ref={imageInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>

          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/10 border border-dashed">
                <FieldLabel className="m-0">{t("form.is_active")}</FieldLabel>
                <Switch
                  dir="ltr"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </div>
            )}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl h-12 px-8"
            >
              {commonT("cancel") || "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-xl h-12 px-8 min-w-[140px] font-bold shadow-lg shadow-primary/20"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  {t("form.save")}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
