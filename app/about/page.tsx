"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  Wallet,
  Bot,
  Globe,
  LockKeyhole,
  CircleCheck,
  ChevronRight,
} from "lucide-react";

import { useLanguage } from "@/components/LanguageProvider";

type AboutContent = {
  title: string;
  subtitle: string;
  back: string;

  heroTitle: string;
  heroDescription: string;

  missionTitle: string;
  missionDescription: string;

  featuresTitle: string;

  walletTitle: string;
  walletDescription: string;

  securityTitle: string;
  securityDescription: string;

  aiTitle: string;
  aiDescription: string;

  multilingualTitle: string;
  multilingualDescription: string;

  principlesTitle: string;

  principle1: string;
  principle2: string;
  principle3: string;
  principle4: string;

  versionTitle: string;
  version: string;

  footer: string;

  settings: string;
  support: string;
};

const content: Record<string, AboutContent> = {
  en: {
    title: "About AI TONKEEPER",
    subtitle: "Secure wallet • Smart technology",
    back: "Back",

    heroTitle: "Your smart crypto platform",
    heroDescription:
      "AI TONKEEPER is a secure and modern crypto platform designed to make digital assets easier to manage, understand and use.",

    missionTitle: "Our mission",
    missionDescription:
      "Our goal is to build a simple, secure and accessible crypto experience where users can manage their assets, monitor their activity and access intelligent tools from one platform.",

    featuresTitle: "Platform features",

    walletTitle: "Smart Wallet",
    walletDescription:
      "Manage your crypto assets, balances, deposits, withdrawals and transactions from one secure interface.",

    securityTitle: "Security",
    securityDescription:
      "Account protection, identity verification and security features are designed to help protect your account and assets.",

    aiTitle: "AI Trading",
    aiDescription:
      "AI TONKEEPER includes a dedicated AI Trading system designed to automate trading strategies according to the platform configuration.",

    multilingualTitle: "Multilingual",
    multilingualDescription:
      "AI TONKEEPER is designed to support multiple languages so users can navigate the platform more comfortably.",

    principlesTitle: "Our principles",

    principle1: "Security comes first.",
    principle2: "User information must be protected.",
    principle3: "The platform should remain simple and transparent.",
    principle4: "Trading tools should never guarantee profits.",

    versionTitle: "Application version",
    version: "AI TONKEEPER • Version 1.0.0",

    footer: "AI TONKEEPER",
    settings: "Settings",
    support: "Support",
  },

  fr: {
    title: "À propos de AI TONKEEPER",
    subtitle: "Portefeuille sécurisé • Technologie intelligente",
    back: "Retour",

    heroTitle: "Votre plateforme crypto intelligente",
    heroDescription:
      "AI TONKEEPER est une plateforme crypto moderne et sécurisée conçue pour faciliter la gestion, la compréhension et l'utilisation des actifs numériques.",

    missionTitle: "Notre mission",
    missionDescription:
      "Notre objectif est de construire une expérience crypto simple, sécurisée et accessible permettant aux utilisateurs de gérer leurs actifs, suivre leur activité et accéder à des outils intelligents depuis une seule plateforme.",

    featuresTitle: "Fonctionnalités de la plateforme",

    walletTitle: "Smart Wallet",
    walletDescription:
      "Gérez vos actifs crypto, vos soldes, vos dépôts, vos retraits et vos transactions depuis une interface sécurisée.",

    securityTitle: "Sécurité",
    securityDescription:
      "La protection du compte, la vérification d'identité et les fonctionnalités de sécurité sont conçues pour contribuer à protéger votre compte et vos actifs.",

    aiTitle: "AI Trading",
    aiDescription:
      "AI TONKEEPER comprend un système AI Trading dédié conçu pour automatiser les stratégies de trading selon la configuration de la plateforme.",

    multilingualTitle: "Multilingue",
    multilingualDescription:
      "AI TONKEEPER est conçu pour prendre en charge plusieurs langues afin de permettre aux utilisateurs de naviguer plus facilement sur la plateforme.",

    principlesTitle: "Nos principes",

    principle1: "La sécurité passe avant tout.",
    principle2: "Les informations des utilisateurs doivent être protégées.",
    principle3: "La plateforme doit rester simple et transparente.",
    principle4: "Les outils de trading ne doivent jamais garantir des bénéfices.",

    versionTitle: "Version de l'application",
    version: "AI TONKEEPER • Version 1.0.0",

    footer: "AI TONKEEPER",
    settings: "Paramètres",
    support: "Assistance",
  },

  es: {
    title: "Acerca de AI TONKEEPER",
    subtitle: "Billetera segura • Tecnología inteligente",
    back: "Volver",

    heroTitle: "Tu plataforma cripto inteligente",
    heroDescription:
      "AI TONKEEPER es una plataforma cripto moderna y segura diseñada para facilitar la gestión, comprensión y uso de activos digitales.",

    missionTitle: "Nuestra misión",
    missionDescription:
      "Nuestro objetivo es crear una experiencia cripto sencilla, segura y accesible que permita gestionar activos, supervisar la actividad y utilizar herramientas inteligentes desde una sola plataforma.",

    featuresTitle: "Funciones de la plataforma",

    walletTitle: "Smart Wallet",
    walletDescription:
      "Gestiona tus activos cripto, saldos, depósitos, retiros y transacciones desde una interfaz segura.",

    securityTitle: "Seguridad",
    securityDescription:
      "La protección de la cuenta, la verificación de identidad y las funciones de seguridad están diseñadas para ayudar a proteger tu cuenta y tus activos.",

    aiTitle: "AI Trading",
    aiDescription:
      "AI TONKEEPER incluye un sistema dedicado de AI Trading diseñado para automatizar estrategias de trading según la configuración de la plataforma.",

    multilingualTitle: "Multilingüe",
    multilingualDescription:
      "AI TONKEEPER está diseñado para admitir varios idiomas para facilitar la navegación de los usuarios.",

    principlesTitle: "Nuestros principios",

    principle1: "La seguridad es lo primero.",
    principle2: "La información de los usuarios debe estar protegida.",
    principle3: "La plataforma debe seguir siendo sencilla y transparente.",
    principle4: "Las herramientas de trading nunca deben garantizar beneficios.",

    versionTitle: "Versión de la aplicación",
    version: "AI TONKEEPER • Versión 1.0.0",

    footer: "AI TONKEEPER",
    settings: "Configuración",
    support: "Soporte",
  },

  de: {
    title: "Über AI TONKEEPER",
    subtitle: "Sichere Wallet • Intelligente Technologie",
    back: "Zurück",

    heroTitle: "Deine intelligente Krypto-Plattform",
    heroDescription:
      "AI TONKEEPER ist eine moderne und sichere Krypto-Plattform, die entwickelt wurde, um die Verwaltung, das Verständnis und die Nutzung digitaler Assets zu vereinfachen.",

    missionTitle: "Unsere Mission",
    missionDescription:
      "Unser Ziel ist eine einfache, sichere und zugängliche Krypto-Erfahrung, mit der Nutzer ihre Assets verwalten, ihre Aktivitäten überwachen und intelligente Werkzeuge über eine einzige Plattform nutzen können.",

    featuresTitle: "Plattformfunktionen",

    walletTitle: "Smart Wallet",
    walletDescription:
      "Verwalte deine Krypto-Assets, Guthaben, Einzahlungen, Auszahlungen und Transaktionen über eine sichere Benutzeroberfläche.",

    securityTitle: "Sicherheit",
    securityDescription:
      "Kontoschutz, Identitätsprüfung und Sicherheitsfunktionen sollen dabei helfen, dein Konto und deine Assets zu schützen.",

    aiTitle: "AI Trading",
    aiDescription:
      "AI TONKEEPER verfügt über ein separates AI-Trading-System, das Trading-Strategien entsprechend der Plattformkonfiguration automatisieren kann.",

    multilingualTitle: "Mehrsprachig",
    multilingualDescription:
      "AI TONKEEPER unterstützt mehrere Sprachen, damit Nutzer die Plattform komfortabler verwenden können.",

    principlesTitle: "Unsere Prinzipien",

    principle1: "Sicherheit steht an erster Stelle.",
    principle2: "Benutzerinformationen müssen geschützt werden.",
    principle3: "Die Plattform soll einfach und transparent bleiben.",
    principle4: "Trading-Tools dürfen niemals Gewinne garantieren.",

    versionTitle: "Anwendungsversion",
    version: "AI TONKEEPER • Version 1.0.0",

    footer: "AI TONKEEPER",
    settings: "Einstellungen",
    support: "Support",
  },
};

export default function AboutPage() {
  const router = useRouter();
  const { language } = useLanguage();

  const current = content[language] ?? content.en;

  return (
    <main className="min-h-screen bg-[#050B18] pb-10 text-white">
      <div className="mx-auto max-w-md px-5 py-6">

        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label={current.back}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-[#101A2C] transition hover:bg-[#16233D]"
          >
            <ArrowLeft size={22} />
          </button>

          <div className="text-center">
            <h1 className="text-xl font-bold">
              {current.title}
            </h1>

            <p className="mt-1 text-xs text-slate-400">
              {current.subtitle}
            </p>
          </div>

          <div className="h-12 w-12" />
        </div>

        {/* HERO */}
        <section className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10">
              <Bot size={30} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                AI TONKEEPER
              </h2>

              <p className="mt-1 text-sm text-cyan-100">
                {current.heroTitle}
              </p>
            </div>
          </div>

          <p className="mt-6 text-sm leading-6 text-cyan-50">
            {current.heroDescription}
          </p>
        </section>

        {/* MISSION */}
        <section className="mt-7 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10">
              <Globe
                size={23}
                className="text-cyan-400"
              />
            </div>

            <h2 className="text-lg font-bold">
              {current.missionTitle}
            </h2>
          </div>

          <p className="text-sm leading-6 text-slate-400">
            {current.missionDescription}
          </p>
        </section>

        {/* FEATURES */}
        <section className="mt-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
            {current.featuresTitle}
          </h2>

          <div className="space-y-4">

            {/* WALLET */}
            <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10">
                  <Wallet
                    size={24}
                    className="text-cyan-400"
                  />
                </div>

                <div>
                  <h3 className="font-bold">
                    {current.walletTitle}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {current.walletDescription}
                  </p>
                </div>
              </div>
            </div>

            {/* SECURITY */}
            <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-500/10">
                  <ShieldCheck
                    size={24}
                    className="text-green-400"
                  />
                </div>

                <div>
                  <h3 className="font-bold">
                    {current.securityTitle}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {current.securityDescription}
                  </p>
                </div>
              </div>
            </div>

            {/* AI TRADING */}
            <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10">
                  <Bot
                    size={24}
                    className="text-blue-400"
                  />
                </div>

                <div>
                  <h3 className="font-bold">
                    {current.aiTitle}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {current.aiDescription}
                  </p>
                </div>
              </div>
            </div>

            {/* MULTILINGUAL */}
            <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-500/10">
                  <Globe
                    size={24}
                    className="text-purple-400"
                  />
                </div>

                <div>
                  <h3 className="font-bold">
                    {current.multilingualTitle}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {current.multilingualDescription}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* PRINCIPLES */}
        <section className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-500/10">
              <LockKeyhole
                size={22}
                className="text-green-400"
              />
            </div>

            <h2 className="text-lg font-bold">
              {current.principlesTitle}
            </h2>
          </div>

          <div className="space-y-4">
            {[current.principle1, current.principle2, current.principle3, current.principle4].map(
              (principle) => (
                <div
                  key={principle}
                  className="flex items-start gap-3"
                >
                  <CircleCheck
                    size={19}
                    className="mt-0.5 shrink-0 text-cyan-400"
                  />

                  <p className="text-sm leading-6 text-slate-400">
                    {principle}
                  </p>
                </div>
              )
            )}
          </div>
        </section>

        {/* NAVIGATION */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-slate-800 bg-[#101A2C]">

          <button
            type="button"
            onClick={() => router.push("/settings")}
            className="flex w-full items-center justify-between border-b border-slate-800 px-5 py-5 text-left transition hover:bg-[#16233D]"
          >
            <span className="font-medium">
              {current.settings}
            </span>

            <ChevronRight
              size={19}
              className="text-slate-500"
            />
          </button>

          <button
            type="button"
            onClick={() => router.push("/support")}
            className="flex w-full items-center justify-between px-5 py-5 text-left transition hover:bg-[#16233D]"
          >
            <span className="font-medium">
              {current.support}
            </span>

            <ChevronRight
              size={19}
              className="text-slate-500"
            />
          </button>

        </section>

        {/* VERSION */}
        <section className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-5 text-center">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            {current.versionTitle}
          </p>

          <p className="mt-2 text-sm font-medium text-slate-300">
            {current.version}
          </p>
        </section>

        {/* FOOTER */}
        <footer className="mt-8 border-t border-slate-800 pt-6 text-center">
          <p className="text-sm font-semibold text-slate-500">
            {current.footer}
          </p>

          <p className="mt-2 text-xs text-slate-600">
            {current.version}
          </p>
        </footer>

      </div>
    </main>
  );
}