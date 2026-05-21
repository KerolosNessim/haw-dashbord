import { useEffect, useRef } from "react";
import type {
  FieldValues,
  UseFormGetValues,
  UseFormWatch,
} from "react-hook-form";

/**
 * When embedded in the page-builder form, push section values to parent on mount and on every change.
 * Uses a ref for the callback so parent re-renders do not retrigger effects.
 */
export function useEmbeddedSectionWatch<T extends FieldValues>(
  embedded: boolean | undefined,
  onDataChange: ((data: Record<string, unknown>) => void) | undefined,
  watch: UseFormWatch<T>,
  getValues: UseFormGetValues<T>,
  transform?: (data: T) => Record<string, unknown>,
) {
  const onDataChangeRef = useRef(onDataChange);
  onDataChangeRef.current = onDataChange;

  const transformRef = useRef(transform);
  transformRef.current = transform;

  useEffect(() => {
    if (!embedded || !onDataChangeRef.current) return;

    const push = (values: T) => {
      const payload = transformRef.current
        ? transformRef.current(values)
        : (values as Record<string, unknown>);
      onDataChangeRef.current?.(payload);
    };

    push(getValues());

    const subscription = watch((values) => {
      push(values as T);
    });

    return () => subscription.unsubscribe();
    // getValues is stable; omit from deps to avoid effect churn on parent re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [embedded, watch]);
}
