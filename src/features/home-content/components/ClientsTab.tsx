import { zodResolver } from "@hookform/resolvers/zod";
import { AlignLeft, Loader2, Plus, Save, Type, Users, X } from "lucide-react";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useClients } from "../hooks/useCliets";

/**
 * Validation schema for the Clients section
 */
const clientsSchema = z.object({
  title_ar: z.string().min(1, "Required"),
  title_en: z.string().min(1, "Required"),
  des_ar: z.string().min(1, "Required"),
  des_en: z.string().min(1, "Required"),
  images: z.array(z.string()),
});

type ClientsFormValues = z.infer<typeof clientsSchema>;

/**
 * ClientsTab Component
 *
 * Manages the "Our Clients" section with a title, description, and multi-logo gallery.
 */
export default function ClientsTab() {
  const { t } = useTranslation("translation", {
    keyPrefix: "home_content.our_clients",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getClientsQuery, updateClients, isPending } = useClients();
  const apiData = getClientsQuery?.data?.data[0];

  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [deletedImages, setDeletedImages] = useState<number[]>([]);
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClientsFormValues>({
    resolver: zodResolver(clientsSchema),
    values: {
      title_ar: apiData?.title?.ar ?? "",
      title_en: apiData?.title?.en ?? "",
      des_ar: apiData?.description?.ar ?? "",
      des_en: apiData?.description?.en ?? "",
      images: apiData?.images?.map((img) => img?.url) ?? [],
    },
  });

  const images = watch("images");

  const onSubmit = (data: ClientsFormValues) => {
    const formData = new FormData();
    formData.append("title[ar]", data.title_ar);
    formData.append("title[en]", data.title_en);
    formData.append("description[ar]", data.des_ar);
    formData.append("description[en]", data.des_en);

    // نرسل الملفات الجديدة فقط
    newImageFiles.forEach((file) => {
      formData.append("images[]", file);
    });

    // نرسل الـ IDs الخاصة بالصور المراد حذفها
    deletedImages.forEach((id) => {
      formData.append("deleted_images[]", String(id));
    });

    updateClients({ data: formData });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      setNewImageFiles((prev) => [...prev, file]);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setValue("images", [...watch("images"), result], {
          shouldValidate: true,
        });
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    const imgUrl = images[index];

    if (imgUrl.startsWith("http")) {
      // إذا كانت صورة موجودة مسبقاً، نضيف الـ ID الخاص بها لقائمة الحذف
      const existingImage = apiData?.images?.find((img) => img.url === imgUrl);
      if (existingImage?.id) {
        setDeletedImages((prev) => [...prev, existingImage.id]);
      }
    } else {
      // إذا كانت صورة مرفوعة حديثاً، نحذفها من قائمة الملفات الجديدة
      const newFileIndex = images
        .slice(0, index)
        .filter((img) => !img.startsWith("http")).length;
      setNewImageFiles((prev) => {
        const copy = [...prev];
        copy.splice(newFileIndex, 1);
        return copy;
      });
    }

    const updated = [...images];
    updated.splice(index, 1);
    setValue("images", updated, { shouldValidate: true });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            {t("title")}
          </h2>
          <p className="text-muted-foreground text-sm font-medium mt-1">
            {t("description")}
          </p>
        </div>
      </div>

      {/* Left: Text Content */}
      <div className="lg:col-span-7 space-y-10">
        {/* Section Titles */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Controller
              name="title_ar"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-base font-bold flex items-center gap-2 justify-end">
                    ({t("ar", { defaultValue: "AR" })}) {t("sec_title")}
                    <Type className="w-4 h-4 text-primary" />
                  </FieldLabel>
                  <Input
                    {...field}
                    dir="rtl"
                    placeholder="..."
                    className="h-14 rounded-2xl bg-muted/5 border-border/60 focus:bg-white transition-all px-5"
                  />
                  <FieldError
                    errors={[{ message: errors.title_ar?.message }]}
                  />
                </Field>
              )}
            />
            <Controller
              name="title_en"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-base font-bold flex items-center gap-2">
                    <Type className="w-4 h-4 text-primary" />
                    {t("sec_title")} (EN)
                  </FieldLabel>
                  <Input
                    {...field}
                    placeholder="..."
                    className="h-14 rounded-2xl bg-muted/5 border-border/60 focus:bg-white transition-all px-5"
                  />
                  <FieldError
                    errors={[{ message: errors.title_en?.message }]}
                  />
                </Field>
              )}
            />
          </div>
        </div>

        {/* Section Descriptions */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Controller
              name="des_ar"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-base font-bold flex items-center gap-2 justify-end">
                    ({t("ar", { defaultValue: "AR" })}) {t("sec_des")}
                    <AlignLeft className="w-4 h-4 text-primary" />
                  </FieldLabel>
                  <Textarea
                    {...field}
                    dir="rtl"
                    placeholder="..."
                    className="min-h-[140px] rounded-[24px] bg-muted/5 border-border/60 focus:bg-white transition-all resize-none p-5"
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
                    {t("sec_des")} (EN)
                  </FieldLabel>
                  <Textarea
                    {...field}
                    placeholder="..."
                    className="min-h-[140px] rounded-[24px] bg-muted/5 border-border/60 focus:bg-white transition-all resize-none p-5"
                  />
                  <FieldError errors={[{ message: errors.des_en?.message }]} />
                </Field>
              )}
            />
          </div>
        </div>
      </div>

      {/* Right: Gallery */}
      <div className="lg:col-span-5 space-y-6">
        <div className="sticky top-6">
          <FieldLabel className="text-base font-bold mb-4 flex items-center justify-between">
            <span>{t("images")}</span>
            <span className="text-xs font-medium text-muted-foreground bg-muted/10 px-2 py-1 rounded-full border">
              {images.length} {t("images")}
            </span>
          </FieldLabel>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Image Preview Cards */}
            {images.map((img, idx) => (
              <div
                key={idx}
                className="group relative aspect-square rounded-2xl border border-border/60 overflow-hidden bg-white shadow-sm hover:shadow-md transition-all"
              >
                <img
                  src={img}
                  className="w-full h-full object-contain p-2"
                  alt="Preview"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Add More Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/5 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/40 hover:text-primary transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-border/60 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                {t("add_images")}
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

          {errors.images && (
            <p className="text-xs text-destructive mt-3 font-medium">
              {errors.images.message}
            </p>
          )}
        </div>
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={isPending}
        className="rounded-2xl h-14 px-12 font-black text-lg gap-2 shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all bg-primary text-white"
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Save className="w-5 h-5" />
        )}
        {t("save")}
      </Button>
    </form>
  );
}
