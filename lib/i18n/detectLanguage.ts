export type DetectedLanguage =
  | "en"
  | "fr"
  | "es"
  | "de";

const supportedLanguages: DetectedLanguage[] = [
  "en",
  "fr",
  "es",
  "de",
];

/**
 * Détecte automatiquement la langue du téléphone
 * ou du navigateur du client.
 *
 * Exemples :
 * fr-FR → fr
 * fr-CA → fr
 * es-ES → es
 * es-MX → es
 * de-DE → de
 * en-US → en
 * en-GB → en
 *
 * Si la langue n'est pas encore supportée,
 * English est utilisé comme langue par défaut.
 */
export function detectBrowserLanguage(): DetectedLanguage {
  if (typeof window === "undefined") {
    return "en";
  }

  const browserLanguages = [
    ...(navigator.languages ?? []),
    navigator.language,
  ];

  for (const browserLanguage of browserLanguages) {
    if (!browserLanguage) {
      continue;
    }

    const languageCode = browserLanguage
      .toLowerCase()
      .split("-")[0]
      .split("_")[0];

    if (
      supportedLanguages.includes(
        languageCode as DetectedLanguage,
      )
    ) {
      return languageCode as DetectedLanguage;
    }
  }

  return "en";
}

/**
 * Détecte la langue du client avec priorité
 * au choix déjà enregistré.
 *
 * Si le client a déjà choisi une langue
 * manuellement, elle reste prioritaire.
 *
 * Sinon, la langue du téléphone/navigateur
 * est utilisée automatiquement.
 */
export function getInitialLanguage(): DetectedLanguage {
  if (typeof window === "undefined") {
    return "en";
  }

  const savedLanguage = localStorage.getItem(
    "ai-tonkeeper-language",
  );

  if (
    savedLanguage &&
    supportedLanguages.includes(
      savedLanguage as DetectedLanguage,
    )
  ) {
    return savedLanguage as DetectedLanguage;
  }

  return detectBrowserLanguage();
}

/**
 * Enregistre la langue choisie par le client.
 */
export function saveLanguage(
  language: DetectedLanguage,
): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    "ai-tonkeeper-language",
    language,
  );
}