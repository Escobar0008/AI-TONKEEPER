export const SUPPORTED_LOCALES = ["en", "fr", "es", "de"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export function isSupportedLocale(
  value: string | null | undefined
): value is Locale {
  return (
    value !== null &&
    value !== undefined &&
    SUPPORTED_LOCALES.includes(value as Locale)
  );
}

export function detectLocaleFromBrowser(): Locale {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  const languages = [
    ...(navigator.languages ?? []),
    navigator.language,
  ];

  for (const language of languages) {
    const normalized = language.toLowerCase().split("-")[0];

    if (isSupportedLocale(normalized)) {
      return normalized;
    }
  }

  return DEFAULT_LOCALE;
}