import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useActiveUniqueCountries } from "@/features/countries/hooks/useCountries";
import type { Country } from "@/features/countries/types";
import { remapCountryIds } from "@/features/countries/lib/dedupe-countries";
import {
  HOME_CONTENT_COUNTRY_IDS_STORAGE_KEY,
  HOME_CONTENT_COUNTRY_STORAGE_KEY,
} from "../lib/country-scope";

/* eslint-disable react-refresh/only-export-components */

export type CountrySelectionMode = "single" | "multi";

type HomeContentCountryContextValue = {
  mode: CountrySelectionMode;
  countries: Country[];
  /** Active filter / edit scope (one country). */
  countryId: number | null;
  setCountryId: (id: number) => void;
  /** List filter / visibility scope (one or more countries). */
  countryIds: number[];
  setCountryIds: (ids: number[]) => void;
  toggleCountryId: (id: number) => void;
  isLoadingCountries: boolean;
  isCountryReady: boolean;
};

const HomeContentCountryContext = createContext<HomeContentCountryContextValue | null>(
  null,
);

function countryNameText(country: Country): string {
  return `${country.name.en} ${country.name.ar}`.toLowerCase();
}

function findSaudiCountry(countries: Country[]): Country | undefined {
  return countries.find((country) => {
    const name = countryNameText(country);
    return (
      name.includes("saudi") ||
      name.includes("ksa") ||
      name.includes("\u0627\u0644\u0633\u0639\u0648\u062f")
    );
  });
}

function readStoredIds(): number[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(HOME_CONTENT_COUNTRY_IDS_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        return parsed
          .map((v) => Number(v))
          .filter((n) => Number.isFinite(n) && n > 0);
      }
    } catch {
      /* ignore */
    }
  }
  const legacy = localStorage.getItem(HOME_CONTENT_COUNTRY_STORAGE_KEY);
  const legacyId = legacy ? Number(legacy) : NaN;
  if (Number.isFinite(legacyId) && legacyId > 0) return [legacyId];
  return [];
}

function persistIds(ids: number[]) {
  localStorage.setItem(HOME_CONTENT_COUNTRY_IDS_STORAGE_KEY, JSON.stringify(ids));
  if (ids[0] != null) {
    localStorage.setItem(HOME_CONTENT_COUNTRY_STORAGE_KEY, String(ids[0]));
  }
}

type ProviderProps = {
  children: ReactNode;
  mode?: CountrySelectionMode;
};

export function HomeContentCountryProvider({
  children,
  mode = "multi",
}: ProviderProps) {
  const { countries, idAlias, isLoading: isLoadingCountries } = useActiveUniqueCountries();

  const [selectedIds, setSelectedIds] = useState<number[]>(() => readStoredIds());

  const countryIds = useMemo(() => {
    if (!countries.length) return [];
    const valid = remapCountryIds(selectedIds, idAlias).filter((id) =>
      countries.some((c) => c.id === id),
    );
    if (valid.length) return valid;
    const sa = findSaudiCountry(countries);
    return [sa?.id ?? countries[0].id];
  }, [countries, idAlias, selectedIds]);

  const countryId = countryIds[0] ?? null;

  const setCountryId = useCallback((id: number) => {
    setSelectedIds([id]);
    persistIds([id]);
  }, []);

  const setCountryIds = useCallback((ids: number[]) => {
    const next = [...new Set(ids.filter((id) => id > 0))];
    setSelectedIds(next);
    persistIds(next);
  }, []);

  const toggleCountryId = useCallback(
    (id: number) => {
      if (mode === "single") {
        setSelectedIds([id]);
        persistIds([id]);
        return;
      }
      setSelectedIds((prev) => {
        const has = prev.includes(id);
        const next = has ? prev.filter((x) => x !== id) : [...prev, id];
        const final = next.length ? next : [id];
        persistIds(final);
        return final;
      });
    },
    [mode],
  );

  const isCountryReady =
    mode === "multi"
      ? countryIds.length > 0
      : countryId != null && countryId > 0;

  const value = useMemo(
    () => ({
      mode,
      countries,
      countryId,
      setCountryId,
      countryIds,
      setCountryIds,
      toggleCountryId,
      isLoadingCountries,
      isCountryReady,
    }),
    [
      mode,
      countries,
      countryId,
      setCountryId,
      countryIds,
      setCountryIds,
      toggleCountryId,
      isLoadingCountries,
      isCountryReady,
    ],
  );

  return (
    <HomeContentCountryContext.Provider value={value}>
      {children}
    </HomeContentCountryContext.Provider>
  );
}

export function useHomeContentCountry(): HomeContentCountryContextValue {
  const ctx = useContext(HomeContentCountryContext);
  if (!ctx) {
    throw new Error("useHomeContentCountry must be used within HomeContentCountryProvider");
  }
  return ctx;
}
