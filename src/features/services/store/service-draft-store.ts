import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { BasicInfoValues } from "../components/builder/basic-info-form";
import type { SectionType } from "../components/builder/section-builder";
import { getServiceQueryNamespace } from "../services/service-resource-config";

export const SERVICE_DRAFT_STORAGE_KEY = "service-form-drafts";

export type ServiceDraftKey = string;

export type SectionDraftInstance = {
  id: string;
  type: SectionType;
  data?: Record<string, unknown>;
};

export type ServiceFormDraft = {
  basic: BasicInfoValues;
  coverPreviewAr: string | null;
  coverPreviewEn: string | null;
  sections: SectionDraftInstance[];
  sectionDataById: Record<string, Record<string, unknown>>;
  updatedAt: number;
};

type ServiceDraftState = {
  drafts: Record<ServiceDraftKey, ServiceFormDraft>;
  saveDraft: (key: ServiceDraftKey, draft: Omit<ServiceFormDraft, "updatedAt">) => void;
  clearDraft: (key: ServiceDraftKey) => void;
  getDraft: (key: ServiceDraftKey) => ServiceFormDraft | undefined;
};

export function serviceDraftKey(serviceId?: number | null): ServiceDraftKey {
  const namespace = getServiceQueryNamespace();
  return serviceId != null ? `${namespace}:edit:${serviceId}` : `${namespace}:new`;
}

export const useServiceDraftStore = create<ServiceDraftState>()(
  persist(
    (set, get) => ({
      drafts: {},
      saveDraft: (key, draft) =>
        set((state) => ({
          drafts: {
            ...state.drafts,
            [key]: { ...draft, updatedAt: Date.now() },
          },
        })),
      clearDraft: (key) =>
        set((state) => {
          const next = { ...state.drafts };
          delete next[key];
          return { drafts: next };
        }),
      getDraft: (key) => get().drafts[key],
    }),
    {
      name: SERVICE_DRAFT_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ drafts: state.drafts }),
    },
  ),
);
