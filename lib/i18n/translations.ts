import en from "../../locales/en/common";
import fr from "../../locales/fr/common";
import es from "../../locales/es/common";
import de from "../../locales/de/common";

export const translations = {
  en,
  fr,
  es,
  de,
} as const;

export type Language = keyof typeof translations;

export type TranslationKey = keyof typeof translations.en;

export const defaultLanguage: Language = "en";

export function getTranslations(
  language: Language,
) {
  return translations[language];
}

export function isSupportedLanguage(
  language: string,
): language is Language {
  return (
    language === "en" ||
    language === "fr" ||
    language === "es" ||
    language === "de"
  );
}

/**
 * Convertit une langue de navigateur/téléphone
 * comme "fr-FR", "de-DE", "es-ES" ou "en-US"
 * en langue supportée par AI TONKEEPER.
 */
export function normalizeLanguage(
  language: string | null | undefined,
): Language {
  if (!language) {
    return defaultLanguage;
  }

  const normalized = language
    .toLowerCase()
    .split("-")[0];

  if (isSupportedLanguage(normalized)) {
    return normalized;
  }

  return defaultLanguage;
}

/**
 * Détecte automatiquement la langue du navigateur
 * ou du téléphone du client.
 *
 * Exemple :
 * fr-FR → fr
 * de-DE → de
 * es-ES → es
 * en-US → en
 */
export function detectBrowserLanguage(): Language {
  if (typeof window === "undefined") {
    return defaultLanguage;
  }

  const browserLanguages = [
    ...(navigator.languages ?? []),
    navigator.language,
  ];

  for (const browserLanguage of browserLanguages) {
    const language = normalizeLanguage(browserLanguage);

    if (isSupportedLanguage(language)) {
      return language;
    }
  }

  return defaultLanguage;
}

/**
 * Retourne la langue enregistrée par le client
 * ou détecte automatiquement celle du téléphone.
 */
export function getClientLanguage(): Language {
  if (typeof window === "undefined") {
    return defaultLanguage;
  }

  const savedLanguage = localStorage.getItem(
    "ai-tonkeeper-language",
  );

  if (savedLanguage) {
    return normalizeLanguage(savedLanguage);
  }

  return detectBrowserLanguage();
}

/**
 * Enregistre le choix de langue du client.
 */
export function setClientLanguage(
  language: Language,
): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    "ai-tonkeeper-language",
    language,
  );
}

/**
 * Retourne directement une traduction.
 */
export function t(
  language: Language,
  key: TranslationKey,
): string {
  return translations[language][key];
}