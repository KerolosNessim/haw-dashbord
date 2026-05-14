import { zodResolver } from "@hookform/resolvers/zod";
import { AlignLeft, ImageIcon, Loader2, Plus, Save, Trash2, Type, X } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useHelpYou } from "../hooks/useHelpYou";
import type { HelpYouItem } from "../types";
import { slugify, slugifyAr } from "@/lib/slugify";

const itemSchema = z.object({
  id: z.number().optional(),
  title_ar: z.string().min(1, "Required"),
  title_en: z.string().min(1, "Required"),
  des_ar: z.string().min(1, "Required"),
  des_en: z.string().min(1, "Required"),
  image: z.any().optional(),
});

type FormValues = {
  items: z.infer<typeof itemSchema>[];
};

export default function ContentTab() {
  const { t } = useTranslation("translation", { keyPrefix: "help_you.content" });
  const { getHelpYouQuery, updateHelpYou, isPending } = useHelpYou();
  
  const apiItems = Array.isArray(getHelpYouQuery?.data?.data?.data) ? getHelpYouQuery?.data?.data?.data : [];
console.log("apiItemshelp", apiItems);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(z.object({ items: z.array(itemSchema) })),
    values: {
      items: apiItems.length > 0 
        ? apiItems.map((f: HelpYouItem) => ({
            id: f.id,
            title_ar: f.title?.ar ?? "",
            title_en: f.title?.en ?? "",
            des_ar: f.description?.ar ?? "",
            des_en: f.description?.en ?? "",
            image: f.image ?? null,
          }))
        : [{ title_ar: "", title_en: "", des_ar: "", des_en: "", image: null }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const onSubmit = (data: FormValues) => {
    const formData = new FormData();
    
    data.items.forEach((item, index) => {
      if (item.id) {
        formData.append(`items[${index}][id]`, String(item.id));
      }
      formData.append(`items[${index}][title][ar]`, item.title_ar);
      formData.append(`items[${index}][title][en]`, item.title_en);
      formData.append(`items[${index}][description][ar]`, item.des_ar);
      formData.append(`items[${index}][description][en]`, item.des_en);
      formData.append(`items[${index}][slug][ar]`, slugifyAr(item.title_ar));
      formData.append(`items[${index}][slug][en]`, slugify(item.title_en));
      
      if (item.image instanceof File) {
        formData.append(`items[${index}][image]`, item.image);
      }
    });

    updateHelpYou(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-primary" />
            {t("title")}
          </h2>
          <p className="text-muted-foreground text-sm font-medium mt-1">
            {t("description")}
          </p>
        </div>

        <Button
          type="button"
          onClick={() => append({ title_ar: "", title_en: "", des_ar: "", des_en: "", image: null })}
          className="rounded-2xl h-12 px-6 font-bold gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
        >
          <Plus className="w-5 h-5" />
          {t("add_item")}
        </Button>
      </div>

      <div className="space-y-12">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="group relative bg-muted/5 rounded-[40px] border border-border/60 p-8 md:p-10 transition-all hover:bg-white hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20"
          >
            {fields.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => remove(index)}
                className="absolute -top-4 -right-4 rounded-full w-12 h-12 shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
              >
                <X className="w-5 h-5" />
              </Button>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-3">
                <Controller
                  name={`items.${index}.image`}
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <div className="space-y-4">
                      <FieldLabel className="text-sm font-bold flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-primary" />
                        {t("image")}
                      </FieldLabel>
                      
                      <div 
                        className={cn(
                          "relative aspect-square rounded-[32px] border-2 border-dashed transition-all overflow-hidden bg-white flex flex-col items-center justify-center cursor-pointer group/img",
                          value ? "border-primary/20" : "border-border hover:border-primary/40"
                        )}
                        onClick={() => {
                          const input = document.getElementById(`file-input-help-you-${index}`);
                          input?.click();
                        }}
                      >
                        {value ? (
                          <>
                            <img 
                              src={typeof value === 'string' ? value : URL.createObjectURL(value)} 
                              className="w-full h-full object-cover" 
                              alt="Preview" 
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center">
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
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-2 p-4 text-center">
                            <Plus className="w-8 h-8 text-muted-foreground/40" />
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                              {t("upload_image")}
                            </p>
                          </div>
                        )}
                        <input
                          id={`file-input-help-you-${index}`}
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onChange(file);
                          }}
                        />
                      </div>
                    </div>
                  )}
                />
              </div>

              <div className="lg:col-span-9 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Controller
                    name={`items.${index}.title_ar`}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel className="text-sm font-bold flex items-center gap-2 ">
                          (AR) {t("item_title")}
                          <Type className="w-4 h-4 text-primary" />
                        </FieldLabel>
                        <Input
                          {...field}
                          dir="rtl"
                          placeholder="..."
                          className="h-12 rounded-xl bg-white border-border/60"
                        />
                        {errors.items?.[index]?.title_ar && (
                          <p className="text-xs text-destructive font-bold mt-1">
                            {errors.items[index].title_ar.message}
                          </p>
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name={`items.${index}.title_en`}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel className="text-sm font-bold flex items-center gap-2">
                          <Type className="w-4 h-4 text-primary" />
                          {t("item_title")} (EN)
                        </FieldLabel>
                        <Input
                          {...field}
                          placeholder="..."
                          className="h-12 rounded-xl bg-white border-border/60"
                        />
                        {errors.items?.[index]?.title_en && (
                          <p className="text-xs text-destructive font-bold mt-1">
                            {errors.items[index].title_en.message}
                          </p>
                        )}
                      </Field>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Controller
                    name={`items.${index}.des_ar`}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel className="text-sm font-bold flex items-center gap-2 ">
                          (AR) {t("item_description")}
                          <AlignLeft className="w-4 h-4 text-primary" />
                        </FieldLabel>
                        <Textarea
                          {...field}
                          dir="rtl"
                          placeholder="..."
                          className="min-h-[100px] rounded-xl bg-white border-border/60 resize-none"
                        />
                        {errors.items?.[index]?.des_ar && (
                          <p className="text-xs text-destructive font-bold mt-1">
                            {errors.items[index].des_ar.message}
                          </p>
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name={`items.${index}.des_en`}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel className="text-sm font-bold flex items-center gap-2">
                          <AlignLeft className="w-4 h-4 text-primary" />
                          {t("item_description")} (EN)
                        </FieldLabel>
                        <Textarea
                          {...field}
                          placeholder="..."
                          className="min-h-[100px] rounded-xl bg-white border-border/60 resize-none"
                        />
                        {errors.items?.[index]?.des_en && (
                          <p className="text-xs text-destructive font-bold mt-1">
                            {errors.items[index].des_en.message}
                          </p>
                        )}
                      </Field>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-10 border-t flex ">
        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          className="rounded-2xl h-16 px-16 font-black text-xl gap-3 shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all bg-primary text-white"
        >
          {isPending ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Save className="w-6 h-6" />
          )}
          {t("save")}
        </Button>
      </div>
    </form>
  );
}
