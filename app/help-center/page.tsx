"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  LifeBuoy,
  Search,
  MessageCircle,
  CircleHelp,
  ChevronRight,
  ShieldCheck,
  Wallet,
  ArrowLeftRight,
  Bot,
  UserCircle,
} from "lucide-react";

import { useLanguage } from "@/components/LanguageProvider";

type FAQ = {
  question: string;
  answer: string;
};

type HelpContent = {
  title: string;
  subtitle: string;
  search: string;
  popular: string;

  support: string;
  supportDescription: string;
  supportAvailable: string;
  contactButton: string;

  wallet: string;
  walletDescription: string;

  security: string;
  securityDescription: string;

  transactions: string;
  transactionsDescription: string;

  aiTrade: string;
  aiTradeDescription: string;

  noResults: string;

  myProfile: string;
  settings: string;

  back: string;

  footer: string;
  version: string;

  faq: FAQ[];
};

const content: Record<string, HelpContent> = {
  en: {
    title: "Help Center",
    subtitle: "FAQ and user guides",
    search: "Search help articles...",
    popular: "Popular questions",

    support: "Contact Support",
    supportDescription:
      "Get assistance from AI TONKEEPER support",
    supportAvailable:
      "AI TONKEEPER support is available to help you.",
    contactButton: "Contact Support",

    wallet: "Wallet",
    walletDescription:
      "Questions about your wallet and balance",

    security: "Security",
    securityDescription:
      "Account security and protection",

    transactions: "Transactions",
    transactionsDescription:
      "Deposits, withdrawals and swaps",

    aiTrade: "AI Trade",
    aiTradeDescription:
      "Questions about AI trading",

    faq: [
      {
        question: "How do I verify my identity?",
        answer:
          "Open Settings, select Identity Verification (KYC), then follow the verification steps.",
      },
      {
        question: "How do I deposit funds?",
        answer:
          "Open your wallet dashboard and select Deposit. Follow the instructions displayed for the selected asset.",
      },
      {
        question: "How do I withdraw funds?",
        answer:
          "Open Withdraw from your wallet and enter the required destination and amount.",
      },
      {
        question: "How does AI Trade work?",
        answer:
          "AI Trade allows you to configure automated trading preferences and monitor your trading activity.",
      },
      {
        question: "How do I swap assets?",
        answer:
          "Open Swap from the bottom navigation, select the asset you want to exchange, choose the destination asset, enter the amount and confirm the swap.",
      },
      {
        question: "How do I change my language?",
        answer:
          "Go to Settings → Preferences → Language and select your preferred language.",
      },
      {
        question: "How can I secure my account?",
        answer:
          "Use the Security section to manage your password, 2FA and other account protection settings.",
      },
      {
        question: "How do I contact support?",
        answer:
          "Open Contact Support from the Help Center and send your request to the AI TONKEEPER support team.",
      },
    ],

    noResults: "No help articles found.",

    myProfile: "My profile",
    settings: "Settings",

    back: "Back",

    footer: "AI TONKEEPER Help Center",
    version: "AI TONKEEPER • Version 1.0.0",
  },

  fr: {
    title: "Centre d'aide",
    subtitle: "FAQ et guides utilisateur",
    search: "Rechercher dans les articles d'aide...",
    popular: "Questions fréquentes",

    support: "Contacter l'assistance",
    supportDescription:
      "Obtenez de l'aide auprès de l'assistance AI TONKEEPER",
    supportAvailable:
      "L'assistance AI TONKEEPER est disponible pour vous aider.",
    contactButton: "Contacter l'assistance",

    wallet: "Portefeuille",
    walletDescription:
      "Questions concernant votre portefeuille et votre solde",

    security: "Sécurité",
    securityDescription:
      "Sécurité et protection de votre compte",

    transactions: "Transactions",
    transactionsDescription:
      "Dépôts, retraits et échanges",

    aiTrade: "AI Trade",
    aiTradeDescription:
      "Questions concernant le trading IA",

    faq: [
      {
        question: "Comment vérifier mon identité ?",
        answer:
          "Ouvrez Paramètres, sélectionnez Vérification d'identité (KYC), puis suivez les étapes de vérification.",
      },
      {
        question: "Comment effectuer un dépôt ?",
        answer:
          "Ouvrez votre portefeuille depuis le tableau de bord et sélectionnez Dépôt. Suivez ensuite les instructions affichées.",
      },
      {
        question: "Comment effectuer un retrait ?",
        answer:
          "Ouvrez Retrait depuis votre portefeuille, puis saisissez la destination et le montant demandé.",
      },
      {
        question: "Comment fonctionne AI Trade ?",
        answer:
          "AI Trade vous permet de configurer vos préférences de trading automatisé et de suivre votre activité de trading.",
      },
      {
        question: "Comment effectuer un échange ?",
        answer:
          "Ouvrez Échanger depuis la navigation inférieure, sélectionnez l'actif à échanger, choisissez l'actif de destination, saisissez le montant puis confirmez.",
      },
      {
        question: "Comment changer la langue ?",
        answer:
          "Allez dans Paramètres → Préférences → Langue, puis sélectionnez votre langue préférée.",
      },
      {
        question: "Comment sécuriser mon compte ?",
        answer:
          "Utilisez la section Sécurité pour gérer votre mot de passe, la 2FA et les autres paramètres de protection.",
      },
      {
        question: "Comment contacter l'assistance ?",
        answer:
          "Ouvrez Contacter l'assistance depuis le Centre d'aide et envoyez votre demande à l'équipe AI TONKEEPER.",
      },
    ],

    noResults: "Aucun article d'aide trouvé.",

    myProfile: "Mon profil",
    settings: "Paramètres",

    back: "Retour",

    footer: "Centre d'aide AI TONKEEPER",
    version: "AI TONKEEPER • Version 1.0.0",
  },

  es: {
    title: "Centro de ayuda",
    subtitle: "Preguntas frecuentes y guías de usuario",
    search: "Buscar artículos de ayuda...",
    popular: "Preguntas frecuentes",

    support: "Contactar con soporte",
    supportDescription:
      "Obtén ayuda del equipo de soporte de AI TONKEEPER",
    supportAvailable:
      "El soporte de AI TONKEEPER está disponible para ayudarte.",
    contactButton: "Contactar con soporte",

    wallet: "Billetera",
    walletDescription:
      "Preguntas sobre tu billetera y saldo",

    security: "Seguridad",
    securityDescription:
      "Seguridad y protección de tu cuenta",

    transactions: "Transacciones",
    transactionsDescription:
      "Depósitos, retiros e intercambios",

    aiTrade: "AI Trade",
    aiTradeDescription:
      "Preguntas sobre el trading con IA",

    faq: [
      {
        question: "¿Cómo verifico mi identidad?",
        answer:
          "Abre Configuración, selecciona Verificación de identidad (KYC) y sigue los pasos de verificación.",
      },
      {
        question: "¿Cómo realizo un depósito?",
        answer:
          "Abre tu billetera desde el panel y selecciona Depósito. Sigue las instrucciones mostradas.",
      },
      {
        question: "¿Cómo realizo un retiro?",
        answer:
          "Abre Retiro desde tu billetera e introduce el destino y la cantidad solicitada.",
      },
      {
        question: "¿Cómo funciona AI Trade?",
        answer:
          "AI Trade permite configurar preferencias de trading automatizado y supervisar tu actividad.",
      },
      {
        question: "¿Cómo realizo un intercambio?",
        answer:
          "Abre Intercambiar desde la navegación inferior, selecciona el activo de origen y destino, introduce la cantidad y confirma.",
      },
      {
        question: "¿Cómo cambio el idioma?",
        answer:
          "Ve a Configuración → Preferencias → Idioma y selecciona tu idioma preferido.",
      },
      {
        question: "¿Cómo puedo proteger mi cuenta?",
        answer:
          "Utiliza la sección Seguridad para gestionar tu contraseña, 2FA y otras opciones de protección.",
      },
      {
        question: "¿Cómo contacto con soporte?",
        answer:
          "Abre Contactar con soporte desde el Centro de ayuda y envía tu solicitud al equipo de AI TONKEEPER.",
      },
    ],

    noResults: "No se encontraron artículos de ayuda.",

    myProfile: "Mi perfil",
    settings: "Configuración",

    back: "Volver",

    footer: "Centro de ayuda AI TONKEEPER",
    version: "AI TONKEEPER • Versión 1.0.0",
  },

  de: {
    title: "Hilfe-Center",
    subtitle: "FAQs und Benutzerhandbücher",
    search: "Hilfeartikel durchsuchen...",
    popular: "Häufig gestellte Fragen",

    support: "Support kontaktieren",
    supportDescription:
      "Erhalte Hilfe vom AI TONKEEPER Support",
    supportAvailable:
      "Der AI TONKEEPER Support steht dir zur Verfügung.",
    contactButton: "Support kontaktieren",

    wallet: "Wallet",
    walletDescription:
      "Fragen zu Wallet und Kontostand",

    security: "Sicherheit",
    securityDescription:
      "Kontosicherheit und Schutz",

    transactions: "Transaktionen",
    transactionsDescription:
      "Einzahlungen, Auszahlungen und Tausch",

    aiTrade: "AI Trade",
    aiTradeDescription:
      "Fragen zum KI-Trading",

    faq: [
      {
        question: "Wie verifiziere ich meine Identität?",
        answer:
          "Öffne Einstellungen, wähle Identitätsprüfung (KYC) und folge den Verifizierungsschritten.",
      },
      {
        question: "Wie zahle ich Geld ein?",
        answer:
          "Öffne deine Wallet im Dashboard und wähle Einzahlung. Folge anschließend den angezeigten Anweisungen.",
      },
      {
        question: "Wie kann ich Geld auszahlen?",
        answer:
          "Öffne Auszahlung in deiner Wallet und gib Zieladresse und Betrag ein.",
      },
      {
        question: "Wie funktioniert AI Trade?",
        answer:
          "AI Trade ermöglicht die Konfiguration automatisierter Trading-Einstellungen und die Überwachung deiner Aktivitäten.",
      },
      {
        question: "Wie kann ich Assets tauschen?",
        answer:
          "Öffne Tauschen über die untere Navigation, wähle die Ausgangs- und Ziel-Assets, gib den Betrag ein und bestätige den Tausch.",
      },
      {
        question: "Wie ändere ich die Sprache?",
        answer:
          "Gehe zu Einstellungen → Präferenzen → Sprache und wähle deine bevorzugte Sprache.",
      },
      {
        question: "Wie kann ich mein Konto schützen?",
        answer:
          "Verwende den Bereich Sicherheit, um Passwort, 2FA und weitere Schutzoptionen zu verwalten.",
      },
      {
        question: "Wie kontaktiere ich den Support?",
        answer:
          "Öffne Support kontaktieren im Hilfe-Center und sende deine Anfrage an das AI TONKEEPER Support-Team.",
      },
    ],

    noResults: "Keine Hilfeartikel gefunden.",

    myProfile: "Mein Profil",
    settings: "Einstellungen",

    back: "Zurück",

    footer: "AI TONKEEPER Hilfe-Center",
    version: "AI TONKEEPER • Version 1.0.0",
  },
};

export default function HelpCenterPage() {
  const router = useRouter();
  const { language } = useLanguage();

  const [search, setSearch] = useState("");

  const current =
    content[language] ?? content.en;

  const filteredFAQ = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return current.faq;
    }

    return current.faq.filter((item) => {
      return (
        item.question.toLowerCase().includes(value) ||
        item.answer.toLowerCase().includes(value)
      );
    });
  }, [current, search]);

  function searchCategory(value: string) {
    setSearch(value);
  }

  return (
    <main className="min-h-screen bg-[#050B18] pb-28 text-white">

      <div className="mx-auto max-w-md px-5 py-6">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="mb-8 flex items-center justify-between">

          <button
            type="button"
            onClick={() => router.push("/settings")}
            aria-label={current.back}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-[#101A2C] transition hover:bg-[#16233D]"
          >
            <ArrowLeft size={22} />
          </button>

          <div className="text-center">
            <h1 className="text-2xl font-bold">
              {current.title}
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              {current.subtitle}
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-[#101A2C]">
            <LifeBuoy
              size={22}
              className="text-cyan-400"
            />
          </div>

        </div>

        {/* ================================================== */}
        {/* HERO */}
        {/* ================================================== */}

        <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <LifeBuoy size={26} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                {current.title}
              </h2>

              <p className="text-sm text-cyan-100">
                {current.subtitle}
              </p>
            </div>

          </div>

          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/10 p-4">

            <ShieldCheck
              size={22}
              className="shrink-0"
            />

            <p className="text-sm text-cyan-50">
              {current.supportAvailable}
            </p>

          </div>

        </div>

        {/* ================================================== */}
        {/* SEARCH */}
        {/* ================================================== */}

        <div className="mt-7">

          <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-[#101A2C] px-4 py-4">

            <Search
              size={20}
              className="shrink-0 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder={current.search}
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
            />

          </div>

        </div>

        {/* ================================================== */}
        {/* QUICK CATEGORIES */}
        {/* ================================================== */}

        <div className="mt-8">

          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
            {current.popular}
          </h2>

          <div className="grid grid-cols-2 gap-4">

            {/* WALLET */}

            <button
              type="button"
              onClick={() =>
                searchCategory(current.wallet)
              }
              className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5 text-left transition hover:bg-[#16233D] active:scale-[0.98]"
            >

              <Wallet
                size={28}
                className="mb-4 text-cyan-400"
              />

              <p className="font-semibold">
                {current.wallet}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                {current.walletDescription}
              </p>

            </button>

            {/* SECURITY */}

            <button
              type="button"
              onClick={() =>
                searchCategory(current.security)
              }
              className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5 text-left transition hover:bg-[#16233D] active:scale-[0.98]"
            >

              <ShieldCheck
                size={28}
                className="mb-4 text-green-400"
              />

              <p className="font-semibold">
                {current.security}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                {current.securityDescription}
              </p>

            </button>

            {/* TRANSACTIONS */}

            <button
              type="button"
              onClick={() =>
                searchCategory(current.transactions)
              }
              className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5 text-left transition hover:bg-[#16233D] active:scale-[0.98]"
            >

              <ArrowLeftRight
                size={28}
                className="mb-4 text-purple-400"
              />

              <p className="font-semibold">
                {current.transactions}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                {current.transactionsDescription}
              </p>

            </button>

            {/* AI TRADE */}

            <button
              type="button"
              onClick={() =>
                searchCategory(current.aiTrade)
              }
              className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5 text-left transition hover:bg-[#16233D] active:scale-[0.98]"
            >

              <Bot
                size={28}
                className="mb-4 text-blue-400"
              />

              <p className="font-semibold">
                {current.aiTrade}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                {current.aiTradeDescription}
              </p>

            </button>

          </div>

        </div>

        {/* ================================================== */}
        {/* FAQ */}
        {/* ================================================== */}

        <div className="mt-8">

          <div className="mb-4 flex items-center justify-between">

            <h2 className="text-xl font-bold">
              {current.popular}
            </h2>

            <CircleHelp
              size={21}
              className="text-cyan-400"
            />

          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-[#101A2C]">

            {filteredFAQ.length > 0 ? (

              filteredFAQ.map((item, index) => (

                <details
                  key={item.question}
                  className={
                    index !== filteredFAQ.length - 1
                      ? "border-b border-slate-800"
                      : ""
                  }
                >

                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 font-semibold transition hover:bg-[#16233D]">

                    <span className="text-sm leading-6">
                      {item.question}
                    </span>

                    <ChevronRight
                      size={19}
                      className="shrink-0 text-slate-500"
                    />

                  </summary>

                  <div className="px-5 pb-5 text-sm leading-6 text-slate-400">
                    {item.answer}
                  </div>

                </details>

              ))

            ) : (

              <div className="px-5 py-10 text-center">

                <Search
                  size={38}
                  className="mx-auto text-slate-600"
                />

                <p className="mt-4 text-sm text-slate-400">
                  {current.noResults}
                </p>

              </div>

            )}

          </div>

        </div>

        {/* ================================================== */}
        {/* CONTACT SUPPORT */}
        {/* ================================================== */}

        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-500/20">

              <MessageCircle
                size={24}
                className="text-green-400"
              />

            </div>

            <div>

              <h2 className="font-bold">
                {current.support}
              </h2>

              <p className="mt-1 text-sm leading-5 text-slate-400">
                {current.supportDescription}
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={() => router.push("/support")}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 py-4 font-semibold text-white transition hover:bg-cyan-600 active:scale-[0.98]"
          >

            <MessageCircle size={19} />

            {current.contactButton}

          </button>

        </div>

        {/* ================================================== */}
        {/* ACCOUNT LINKS */}
        {/* ================================================== */}

        <div className="mt-8 overflow-hidden rounded-3xl border border-slate-800 bg-[#101A2C]">

          {/* PROFILE */}

          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="flex w-full items-center justify-between border-b border-slate-800 px-5 py-5 text-left transition hover:bg-[#16233D]"
          >

            <div className="flex items-center gap-4">

              <UserCircle
                size={22}
                className="text-cyan-400"
              />

              <span className="font-medium">
                {current.myProfile}
              </span>

            </div>

            <ChevronRight
              size={19}
              className="text-slate-500"
            />

          </button>

          {/* SETTINGS */}

          <button
            type="button"
            onClick={() => router.push("/settings")}
            className="flex w-full items-center justify-between px-5 py-5 text-left transition hover:bg-[#16233D]"
          >

            <div className="flex items-center gap-4">

              <LifeBuoy
                size={22}
                className="text-green-400"
              />

              <span className="font-medium">
                {current.settings}
              </span>

            </div>

            <ChevronRight
              size={19}
              className="text-slate-500"
            />

          </button>

        </div>

        {/* ================================================== */}
        {/* FOOTER */}
        {/* ================================================== */}

        <footer className="mt-10 border-t border-slate-800 pt-6 text-center">

          <p className="text-sm text-slate-500">
            {current.footer}
          </p>

          <p className="mt-2 text-xs text-slate-600">
            {current.version}
          </p>

        </footer>

      </div>

      {/* ================================================== */}
      {/* BOTTOM NAVIGATION */}
      {/* ================================================== */}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-[#0B1220]/95 backdrop-blur-xl">

        <div className="mx-auto grid h-20 max-w-md grid-cols-5">

          {/* WALLET */}

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="flex flex-col items-center justify-center text-slate-500 transition hover:text-white"
          >

            <Wallet size={21} />

            <span className="mt-1 text-[10px]">
              {current.wallet}
            </span>

          </button>

          {/* SWAP */}

          <button
            type="button"
            onClick={() => router.push("/swap")}
            className="flex flex-col items-center justify-center text-slate-500 transition hover:text-white"
          >

            <ArrowLeftRight size={21} />

            <span className="mt-1 text-[10px]">
              {language === "fr"
                ? "Échanger"
                : language === "es"
                  ? "Intercambiar"
                  : language === "de"
                    ? "Tauschen"
                    : "Swap"}
            </span>

          </button>

          {/* AI TRADE */}

          <button
            type="button"
            onClick={() => router.push("/ai-trade")}
            className="flex flex-col items-center justify-center text-slate-500 transition hover:text-white"
          >

            <Bot size={21} />

            <span className="mt-1 text-[10px]">
              AI Trade
            </span>

          </button>

          {/* HISTORY */}

          <button
            type="button"
            onClick={() => router.push("/history")}
            className="flex flex-col items-center justify-center text-slate-500 transition hover:text-white"
          >

            <MessageCircle size={21} />

            <span className="mt-1 text-[10px]">
              {language === "fr"
                ? "Historique"
                : language === "es"
                  ? "Historial"
                  : language === "de"
                    ? "Verlauf"
                    : "History"}
            </span>

          </button>

          {/* HELP */}

          <button
            type="button"
            onClick={() => router.push("/help")}
            className="flex flex-col items-center justify-center text-cyan-400"
          >

            <LifeBuoy size={21} />

            <span className="mt-1 text-[10px] font-semibold">
              {language === "fr"
                ? "Aide"
                : language === "es"
                  ? "Ayuda"
                  : language === "de"
                    ? "Hilfe"
                    : "Help"}
            </span>

          </button>

        </div>

      </nav>

    </main>
  );
}