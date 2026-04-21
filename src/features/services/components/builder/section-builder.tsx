import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  ImageIcon,
  Layout,
  SquareEqual,
  AlignLeft,
  HelpCircle,
  PhoneCall,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Import Section Components
import ImageTextSection from "./sections/image-text-section";
import CardsSection from "./sections/cards-section";
import FullSection from "./sections/full-section";
import DualDescSection from "./sections/dual-desc-section";
import FAQSection from "./sections/faq-section";
import ContactSection from "./sections/contact-section";

export type SectionType =
  | "image_text"
  | "cards"
  | "full_section"
  | "dual_desc"
  | "faq"
  | "contact";

interface SectionInstance {
  id: string;
  type: SectionType;
  data?: any;
}

interface SectionBuilderProps {
  serviceId: number;
}

export default function SectionBuilder({ serviceId }: SectionBuilderProps) {
  const { t } = useTranslation("translation", { keyPrefix: "services.form" });
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [sections, setSections] = useState<SectionInstance[]>([]);

  const sectionTypes = [
    { id: "image_text", icon: ImageIcon, color: "bg-blue-50 text-blue-600" },
    { id: "cards", icon: SquareEqual, color: "bg-indigo-50 text-indigo-600" },
    { id: "full_section", icon: Layout, color: "bg-purple-50 text-purple-600" },
    {
      id: "dual_desc",
      icon: AlignLeft,
      color: "bg-emerald-50 text-emerald-600",
    },
    { id: "faq", icon: HelpCircle, color: "bg-orange-50 text-orange-600" },
    { id: "contact", icon: PhoneCall, color: "bg-rose-50 text-rose-600" },
  ] as const;

  const addSection = (type: SectionType) => {
    const newSection: SectionInstance = {
      id: Math.random().toString(36).substr(2, 9),
      type,
    };
    setSections([...sections, newSection]);
    setIsPickerOpen(false);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const moveSection = (from: number, to: number) => {
    const newSections = [...sections];
    const [movedItem] = newSections.splice(from, 1);
    newSections.splice(to, 0, movedItem);
    setSections(newSections);
  };

  const renderSectionContent = (section: SectionInstance, index: number) => {
    const props = {
      serviceId,
      index,
      initialData: section.data,
    };

    switch (section.type) {
      case "image_text":
        return <ImageTextSection {...props} />;
      case "cards":
        return <CardsSection {...props} />;
      case "full_section":
        return <FullSection {...props} />;
      case "dual_desc":
        return <DualDescSection {...props} />;
      case "faq":
        return <FAQSection {...props} />;
      case "contact":
        return <ContactSection {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header Area */}
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold">{t("sections.title")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("sections.description")}
          </p>
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-6">
        {sections.length === 0 ? (
          <div className="p-16 border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
            <Layout className="w-16 h-16 mb-4 opacity-10" />
            <p className="text-lg font-medium opacity-40">
              {t("sections.empty_state")}
            </p>
            <Button
              variant="ghost"
              onClick={() => setIsPickerOpen(true)}
              className="mt-4 text-primary font-bold hover:bg-primary/5"
            >
              {t("sections.start_adding")}
            </Button>
          </div>
        ) : (
          sections.map((section, index) => (
            <div
              key={section.id}
              className="group relative p-6 rounded-[24px] border bg-card shadow-sm hover:shadow-md transition-all space-y-6"
            >
              {/* Section Header/Actions */}
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <h4 className="font-bold text-sm uppercase tracking-wider opacity-60">
                    {t(`sections.types.${section.type}`)}
                  </h4>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => index > 0 && moveSection(index, index - 1)}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      index < sections.length - 1 &&
                      moveSection(index, index + 1)
                    }
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => removeSection(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Section Content */}
              <div className="pt-2">{renderSectionContent(section, index)}</div>
            </div>
          ))
        )}

        {serviceId && (
          <Button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            size="lg"
            className="rounded-xl shadow-md gap-2 font-bold px-6"
          >
            <Plus className="w-5 h-5" /> {t("sections.add_button")}
          </Button>
        )}
      </div>

      {/* Picker Dialog */}
      <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <DialogContent className="sm:max-w-[650px] rounded-[32px] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">
              {t("sections.picker_title")}
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              {t("sections.picker_desc")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-8">
            {sectionTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => addSection(type.id)}
                className="flex flex-col items-center gap-4 p-6 rounded-3xl border bg-card hover:bg-muted/50 transition-all text-center group outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div
                  className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-active:scale-95",
                    type.color,
                  )}
                >
                  <type.icon className="w-8 h-8" />
                </div>
                <span className="font-bold text-sm leading-tight text-card-foreground">
                  {t(`sections.types.${type.id}`)}
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
