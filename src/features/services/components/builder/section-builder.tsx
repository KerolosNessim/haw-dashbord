import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  AlignLeft,
  HelpCircle,
  ImageIcon,
  Layout,
  PhoneCall,
  Plus,
  SquareEqual,
  ClipboardCheck,
} from "lucide-react";
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { SectionBuilderList } from "./section-builder-list";

// Import Section Components
import { useEffect } from "react";
import { useServiceFormDraft } from "../../hooks/useServiceFormDraft";
import { builderSectionsFromService } from "../../lib/section-order";
import type { ServiceSectionsPayload } from "../../service-section-types";
import type { Service } from "../../type";
import {
  buildSectionsPayloadFromInstances,
  type SectionInstanceInput,
} from "../../utils/section-form-mappers";
import { SectionLinkField } from "./section-link-field";
import CardsSection from "./sections/cards-section";
import ContactSection from "./sections/contact-section";
import DualDescSection from "./sections/dual-desc-section";
import FAQSection from "./sections/faq-section";
import FullSection from "./sections/full-section";
import ImageTextSection from "./sections/image-text-section";

export type SectionType =
  | "image_text"
  | "cards"
  | "full_section"
  | "dual_desc"
  | "faq"
  | "contact"
  | "audits";

interface SectionInstance {
  id: string;
  type: SectionType;
  data?: any;
}

export interface SectionBuilderHandle {
  getSectionsPayload: () => ServiceSectionsPayload;
}

interface SectionBuilderProps {
  serviceId?: number;
  initialService?: Service;
  isLoading?: boolean;
  onSectionsDraftChange?: (payload: {
    sections: SectionInstance[];
    sectionDataById: Record<string, Record<string, unknown>>;
  }) => void;
}

const SectionBuilder = forwardRef<SectionBuilderHandle, SectionBuilderProps>(
  function SectionBuilder(
    { serviceId, initialService, isLoading, onSectionsDraftChange },
    ref,
  ) {
  const { t } = useTranslation("translation", { keyPrefix: "services.form" });
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [sections, setSections] = useState<SectionInstance[]>([]);
  const [sectionDataById, setSectionDataById] = useState<
    Record<string, Record<string, unknown>>
  >({});
  const { draft, hydrated } = useServiceFormDraft(serviceId);
  const restoredDraftRef = useRef(false);
  const initialServiceLoadedRef = useRef(false);
  const onSectionsDraftChangeRef = useRef(onSectionsDraftChange);
  onSectionsDraftChangeRef.current = onSectionsDraftChange;

  useEffect(() => {
    if (!hydrated) return;

    // Restore draft on create page (only once)
    if (serviceId == null && draft?.sections?.length && !restoredDraftRef.current) {
      restoredDraftRef.current = true;
      const restoredSections = draft.sections.map((section) => ({
        id: section.id,
        type: section.type,
        data: draft.sectionDataById[section.id] ?? section.data,
      }));
      setSections(restoredSections);
      setSectionDataById(draft.sectionDataById ?? {});
      return;
    }

    // Populate from API service data (only once, independent of draft ref)
    if (initialService && !initialServiceLoadedRef.current) {
      initialServiceLoadedRef.current = true;
      const defs = builderSectionsFromService(initialService);
      const mappedSections: SectionInstance[] = defs.map((def) => ({
        id: def.id,
        type: def.type,
        data: def.data,
      }));

      const nextDataById: Record<string, Record<string, unknown>> = {};
      for (const def of defs) {
        const row = (def.data ?? {}) as Record<string, unknown>;
        nextDataById[def.id] = row;
      }

      setSections(mappedSections);
      setSectionDataById(nextDataById);
    }
  }, [serviceId, hydrated, draft, initialService]);

  useEffect(() => {
    if (!hydrated) return;
    onSectionsDraftChangeRef.current?.({ sections, sectionDataById });
  }, [hydrated, sections, sectionDataById]);

  useImperativeHandle(
    ref,
    () => ({
      getSectionsPayload: () => {
        const instances: SectionInstanceInput[] = sections.map((s) => ({
          id: s.id,
          type: s.type,
        }));
        return buildSectionsPayloadFromInstances(instances, sectionDataById);
      },
    }),
    [sections, sectionDataById],
  );

  const handleSectionDataChange = useCallback(
    (sectionId: string, data: Record<string, unknown>) => {
      setSectionDataById((prev) => {
        const preservedId = prev[sectionId]?.id ?? data.id;
        const base =
          preservedId != null && data.id == null
            ? { ...data, id: preservedId }
            : data;
        const nextData = {
          ...base,
          link:
            typeof data.link === "string"
              ? data.link
              : (prev[sectionId]?.link as string | undefined),
        };
        const prevData = prev[sectionId];
        if (prevData && JSON.stringify(prevData) === JSON.stringify(nextData)) {
          return prev;
        }
        return { ...prev, [sectionId]: nextData };
      });
    },
    [],
  );

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
    const removed = sections[index];
    setSections(sections.filter((_, i) => i !== index));
    if (removed) {
      setSectionDataById((prev) => {
        const next = { ...prev };
        delete next[removed.id];
        return next;
      });
    }
  };

  const sectionTypeLabel = (section: SectionInstance) =>
    section.type === "cards"
      ? t("sections.types.offerings")
      : section.type === "audits"
        ? t("sections.types.audits")
        : t(`sections.types.${section.type}`);

  const renderSectionContent = (section: SectionInstance, index: number) => {
    const props = {
      serviceId: serviceId ?? 0,
      index,
      initialData: section.data,
      embedded: true,
      onDataChange: (data: Record<string, unknown>) =>
        handleSectionDataChange(section.id, data),
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
          <SectionBuilderList
            items={sections}
            onReorder={setSections}
            onRemove={removeSection}
            renderHeaderLabel={(section) => sectionTypeLabel(section)}
            renderContent={(section, index) => (
              <div className="space-y-0">
                <SectionLinkField
                  value={String(sectionDataById[section.id]?.link ?? "")}
                  onChange={(link) =>
                    handleSectionDataChange(section.id, {
                      ...(sectionDataById[section.id] ?? {}),
                      link,
                    })
                  }
                />
                {renderSectionContent(section, index)}
              </div>
            )}
          />
        )}

        <Button
          type="button"
          onClick={() => setIsPickerOpen(true)}
          size="lg"
          className="rounded-xl shadow-md gap-2 font-bold px-6"
        >
          <Plus className="w-5 h-5" /> {t("sections.add_button")}
        </Button>
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
                  {type.id === "cards"
                    ? t("sections.types.offerings")
                    : t(`sections.types.${type.id}`)}
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default SectionBuilder;
