/** Move one item from `fromIndex` to `toIndex` (stable reorder). */
export function reorderList<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length
  ) {
    return items;
  }
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

/** Clamp 1-based display order to valid range. */
export function clampDisplayOrder(value: number, length: number): number {
  if (length <= 0) return 1;
  return Math.max(1, Math.min(length, Math.round(value)));
}
