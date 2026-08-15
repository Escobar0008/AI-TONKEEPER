"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getTranslations,
  translations,
} from "@/lib/i18n/translations";

import { detectBrowserLanguage } from "@/lib/i18n/detectLanguage";

type Language = keyof typeof translations;

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: ReturnType<typeof getTranslations>;
};

const LanguageContext =
  createContext<LanguageContextType | undefined>(
    undefined,
  );

type LanguageProviderProps = {
  children: ReactNode;
};

export function LanguageProvider({
  children,
}: LanguageProviderProps) {
  const [language, setLanguageState] =
    useState<Language>("en");

  useEffect(() => {
    const detectedLanguage =
      detectBrowserLanguage();

    setLanguageState(detectedLanguage);

    document.documentElement.lang =
      detectedLanguage;
  }, []);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);

    document.documentElement.lang =
      newLanguage;
  };

  const t = useMemo(
    () => getTranslations(language),
    [language],
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context =
    useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider",
    );
  }

  return context;
}