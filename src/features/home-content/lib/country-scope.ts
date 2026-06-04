/** Persists list-filter country selection (multi) on dashboard resource pages. */
export const HOME_CONTENT_COUNTRY_IDS_STORAGE_KEY = "home-content-country-ids";

/** Legacy single-country filter key (migrated to array on load). */
export const HOME_CONTENT_COUNTRY_STORAGE_KEY = "home-content-country-id";

export function countryIdQuery(
  countryId: number | null | undefined,
): Record<string, string> | undefined {
  if (countryId == null || countryId <= 0) return undefined;
  return { country_id: String(countryId) };
}

/** Query params for filtering lists by one or more countries (`country_ids[]`). */
export function countryIdsQuery(
  countryIds: number[] | null | undefined,
): Record<string, string | string[]> | undefined {
  const ids = (countryIds ?? []).filter((id) => id > 0);
  if (!ids.length) return undefined;
  if (ids.length === 1) return { country_id: String(ids[0]) };
  return { country_ids: ids.map(String) };
}

export function appendCountryIdToFormData(
  formData: FormData,
  countryId: number | null | undefined,
): void {
  if (countryId != null && countryId > 0) {
    formData.append("country_id", String(countryId));
  }
}

export function appendCountryIdsToFormData(
  formData: FormData,
  countryIds: number[] | string[] | null | undefined,
): void {
  const ids = (countryIds ?? [])
    .map((id) => Number(id))
    .filter((n) => Number.isFinite(n) && n > 0);
  ids.forEach((id, index) => {
    formData.append(`country_ids[${index}]`, String(id));
  });
}

/** JSON body field for PUT/POST JSON endpoints. */
export function withCountryIdsPayload<T extends Record<string, unknown>>(
  payload: T,
  countryIds: number[] | string[] | null | undefined,
): T & { country_ids: number[] } {
  const ids = (countryIds ?? [])
    .map((id) => Number(id))
    .filter((n) => Number.isFinite(n) && n > 0);
  return { ...payload, country_ids: ids };
}
