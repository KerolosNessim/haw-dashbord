import { useCallback, useEffect, useRef, useState } from "react";
import {
  serviceDraftKey,
  useServiceDraftStore,
  type SectionDraftInstance,
  type ServiceFormDraft,
} from "../store/service-draft-store";
import {
  serializeBasicInfoForDraft,
  serializeSectionDataForDraft,
} from "../utils/service-draft-serializer";
import type { BasicInfoValues } from "../components/builder/basic-info-form";

const SAVE_DEBOUNCE_MS = 600;

export function useServiceDraftHydrated() {
  const [hydrated, setHydrated] = useState(
    () => useServiceDraftStore.persist.hasHydrated(),
  );

  useEffect(() => {
    const unsub = useServiceDraftStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    setHydrated(useServiceDraftStore.persist.hasHydrated());
    return unsub;
  }, []);

  return hydrated;
}

export function useServiceDraftKey(serviceId?: number | null) {
  return serviceDraftKey(serviceId);
}

export function useServiceFormDraft(serviceId?: number | null) {
  const isEditMode = serviceId != null;
  const draftKey = serviceDraftKey(serviceId);
  const hydrated = useServiceDraftHydrated();
  const draft = useServiceDraftStore((s) =>
    isEditMode ? undefined : s.drafts[draftKey],
  );
  const saveDraft = useServiceDraftStore((s) => s.saveDraft);
  const clearDraft = useServiceDraftStore((s) => s.clearDraft);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveChainRef = useRef<Promise<void>>(Promise.resolve());

  // Edit pages always load from the API; drop any stale edit:* draft on open.
  useEffect(() => {
    if (!hydrated || !isEditMode) return;
    clearDraft(draftKey);
  }, [hydrated, isEditMode, draftKey, clearDraft]);

  const queueSave = useCallback(
    (payload: Omit<ServiceFormDraft, "updatedAt">) => {
      if (isEditMode) return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveChainRef.current = saveChainRef.current
          .then(async () => {
            const [basic, sectionDataById] = await Promise.all([
              serializeBasicInfoForDraft(
                payload.basic,
                payload.coverPreviewAr,
                payload.coverPreviewEn,
              ),
              serializeSectionDataForDraft(payload.sectionDataById),
            ]);
            const sections: SectionDraftInstance[] = payload.sections.map(
              (section) => ({
                ...section,
                data:
                  sectionDataById[section.id] ??
                  section.data ??
                  undefined,
              }),
            );
            saveDraft(draftKey, {
              basic,
              coverPreviewAr: payload.coverPreviewAr,
              coverPreviewEn: payload.coverPreviewEn,
              sections,
              sectionDataById,
            });
          })
          .catch(() => {
            /* ignore serialization errors */
          });
      }, SAVE_DEBOUNCE_MS);
    },
    [draftKey, saveDraft, isEditMode],
  );

  const clearServiceDraft = useCallback(() => {
    clearDraft(draftKey);
    clearDraft("new");
  }, [clearDraft, draftKey]);

  useEffect(
    () => () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    },
    [],
  );

  return {
    draftKey,
    hydrated,
    draft: hydrated && !isEditMode ? draft : undefined,
    isEditMode,
    queueSave,
    clearServiceDraft,
  };
}

export type { BasicInfoValues };
