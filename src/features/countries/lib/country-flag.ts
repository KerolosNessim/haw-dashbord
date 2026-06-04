import type { Country } from "@/features/countries/types";

function countryText(country: Country): string {
  return `${country.name.en} ${country.name.ar}`.toLowerCase();
}

export function countryFlagEmoji(country: Country): string {
  const text = countryText(country);
  if (
    text.includes("oman") ||
    text.includes("\u0639\u0645\u0627\u0646") ||
    text.includes("\u0639\u064f\u0645\u0627\u0646")
  ) {
    return "\ud83c\uddf4\ud83c\uddf2";
  }
  return "\ud83c\uddf8\ud83c\udde6";
}
