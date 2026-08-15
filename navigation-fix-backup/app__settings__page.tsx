"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

import {
  ArrowLeft,
  Bell,
  ChevronRight,
  UserCircle,
  ShieldCheck,
  BadgeCheck,
  Wallet,
  Languages,
  MoonStar,
  Bot,
  CircleHelp,
  Headset,
  FileText,
  Shield,
  Info,
  RefreshCw,
  Clock3,
  Settings,
  LogOut,
} from "lucide-react";

import { translations } from "@/lib/i18n/translations";
import { useLanguage } from "@/components/LanguageProvider";

type Language = keyof typeof translations;

type ExtraTranslation = {
  account: string;
  preferences: string;
  supportAbout: string;

  profileDescription: string;
  securityDescription: string;
  kycTitle: string;
  kycDescription: string;
  walletsDescription: string;

  appearance: string;
  notificationsDescription: string;
  aiTradeSettings: string;
  aiTradeDescription: string;

  helpCenter: string;
  helpCenterDescription: string;
  contactSupport: string;
  contactSupportDescription: string;
  termsOfService: string;
  termsDescription: string;
  privacyPolicy: string;
  privacyDescription: string;
  about: string;
  version: string;

  logoutDescription: string;
  premium: string;
  verifiedAccount: string;

  wallet: string;
  swap: string;
  aiTrade: string;
  history: string;
  settings: string;
};

const extraTranslations: Record<Language, ExtraTranslation> = {
  en: {
    account: "Account",
    preferences: "Preferences",
    supportAbout: "Support & About",

    profileDescription:
      "View and edit your profile information",

    securityDescription:
      "Password, 2FA and security settings",

    kycTitle:
      "Identity Verification (KYC)",

    kycDescription:
      "Verify your identity to unlock all features",

    walletsDescription:
      "Manage your connected wallets",

    appearance:
      "Appearance",

    notificationsDescription:
      "Push & Email Alerts",

    aiTradeSettings:
      "AI Trade Settings",

    aiTradeDescription:
      "Configure your AI trading preferences",

    helpCenter:
      "Help Center",

    helpCenterDescription:
      "FAQs and user guides",

    contactSupport:
      "Contact Support",

    contactSupportDescription:
      "24/7 AI TONKEEPER assistance",

    termsOfService:
      "Terms of Service",

    termsDescription:
      "Read our terms and conditions",

    privacyPolicy:
      "Privacy Policy",

    privacyDescription:
      "Learn how your data is protected",

    about:
      "About AI TONKEEPER",

    version:
      "Version 1.0.0",

    logoutDescription:
      "Sign out from your AI TONKEEPER account",

    premium:
      "Premium",

    verifiedAccount:
      "Verified Account",

    wallet:
      "Wallet",

    swap:
      "Swap",

    aiTrade:
      "AI Trade",

    history:
      "History",

    settings:
      "Settings",
  },

  fr: {
    account: "Compte",
    preferences: "Préférences",
    supportAbout: "Assistance et informations",

    profileDescription:
      "Consultez et modifiez les informations de votre profil",

    securityDescription:
      "Mot de passe, 2FA et paramètres de sécurité",

    kycTitle:
      "Vérification d'identité (KYC)",

    kycDescription:
      "Vérifiez votre identité pour débloquer toutes les fonctionnalités",

    walletsDescription:
      "Gérez vos portefeuilles connectés",

    appearance:
      "Apparence",

    notificationsDescription:
      "Alertes push et e-mail",

    aiTradeSettings:
      "Paramètres AI Trade",

    aiTradeDescription:
      "Configurez vos préférences de trading IA",

    helpCenter:
      "Centre d'aide",

    helpCenterDescription:
      "FAQ et guides utilisateur",

    contactSupport:
      "Contacter l'assistance",

    contactSupportDescription:
      "Assistance AI TONKEEPER 24/7",

    termsOfService:
      "Conditions d'utilisation",

    termsDescription:
      "Consultez nos conditions générales",

    privacyPolicy:
      "Politique de confidentialité",

    privacyDescription:
      "Découvrez comment vos données sont protégées",

    about:
      "À propos de AI TONKEEPER",

    version:
      "Version 1.0.0",

    logoutDescription:
      "Se déconnecter de votre compte AI TONKEEPER",

    premium:
      "Premium",

    verifiedAccount:
      "Compte vérifié",

    wallet:
      "Portefeuille",

    swap:
      "Échanger",

    aiTrade:
      "AI Trade",

    history:
      "Historique",

    settings:
      "Paramètres",
  },

  es: {
    account: "Cuenta",
    preferences: "Preferencias",
    supportAbout: "Soporte e información",

    profileDescription:
      "Consulta y edita la información de tu perfil",

    securityDescription:
      "Contraseña, 2FA y configuración de seguridad",

    kycTitle:
      "Verificación de identidad (KYC)",

    kycDescription:
      "Verifica tu identidad para desbloquear todas las funciones",

    walletsDescription:
      "Administra tus billeteras conectadas",

    appearance:
      "Apariencia",

    notificationsDescription:
      "Alertas push y por correo electrónico",

    aiTradeSettings:
      "Configuración de AI Trade",

    aiTradeDescription:
      "Configura tus preferencias de trading con IA",

    helpCenter:
      "Centro de ayuda",

    helpCenterDescription:
      "Preguntas frecuentes y guías de usuario",

    contactSupport:
      "Contactar con soporte",

    contactSupportDescription:
      "Asistencia de AI TONKEEPER 24/7",

    termsOfService:
      "Términos del servicio",

    termsDescription:
      "Lee nuestros términos y condiciones",

    privacyPolicy:
      "Política de privacidad",

    privacyDescription:
      "Descubre cómo protegemos tus datos",

    about:
      "Acerca de AI TONKEEPER",

    version:
      "Versión 1.0.0",

    logoutDescription:
      "Cerrar sesión de tu cuenta de AI TONKEEPER",

    premium:
      "Premium",

    verifiedAccount:
      "Cuenta verificada",

    wallet:
      "Billetera",

    swap:
      "Intercambiar",

    aiTrade:
      "AI Trade",

    history:
      "Historial",

    settings:
      "Configuración",
  },

  de: {
    account: "Konto",
    preferences: "Einstellungen",
    supportAbout: "Support & Informationen",

    profileDescription:
      "Profilinformationen anzeigen und bearbeiten",

    securityDescription:
      "Passwort, 2FA und Sicherheitseinstellungen",

    kycTitle:
      "Identitätsprüfung (KYC)",

    kycDescription:
      "Bestätige deine Identität, um alle Funktionen freizuschalten",

    walletsDescription:
      "Verwalte deine verbundenen Wallets",

    appearance:
      "Darstellung",

    notificationsDescription:
      "Push- und E-Mail-Benachrichtigungen",

    aiTradeSettings:
      "AI-Trade-Einstellungen",

    aiTradeDescription:
      "Konfiguriere deine KI-Trading-Einstellungen",

    helpCenter:
      "Hilfe-Center",

    helpCenterDescription:
      "FAQs und Benutzerhandbücher",

    contactSupport:
      "Support kontaktieren",

    contactSupportDescription:
      "AI TONKEEPER Unterstützung rund um die Uhr",

    termsOfService:
      "Nutzungsbedingungen",

    termsDescription:
      "Lies unsere Nutzungsbedingungen",

    privacyPolicy:
      "Datenschutzerklärung",

    privacyDescription:
      "Erfahre, wie deine Daten geschützt werden",

    about:
      "Über AI TONKEEPER",

    version:
      "Version 1.0.0",

    logoutDescription:
      "Von deinem AI TONKEEPER-Konto abmelden",

    premium:
      "Premium",

    verifiedAccount:
      "Verifiziertes Konto",

    wallet:
      "Wallet",

    swap:
      "Tauschen",

    aiTrade:
      "AI Trade",

    history:
      "Verlauf",

    settings:
      "Einstellungen",
  },
};

export default function SettingsPage() {
  const router = useRouter();

  const { language, t } = useLanguage();

  const extra = extraTranslations[language];

  // ============================================================
  // LOGOUT
  // ============================================================

  async function handleLogout() {
    try {
      await signOut({
        callbackUrl: "/login",
      });
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
    }
  }

  return (
    <main className="min-h-screen bg-[#050B18] text-white pb-32">

      <div className="max-w-md mx-auto px-5 py-6">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="flex items-center justify-between mb-8">

          <button
            type="button"
            onClick={() => router.back()}
            className="w-12 h-12 rounded-2xl bg-[#101A2C] border border-slate-800 flex items-center justify-center hover:bg-[#16233D] transition"
            aria-label={t.settings}
          >
            <ArrowLeft size={22} />
          </button>

          <h1 className="text-2xl font-bold">
            {t.settings}
          </h1>

          <button
            type="button"
            onClick={() => router.push("/notifications")}
            className="relative w-12 h-12 rounded-2xl bg-[#101A2C] border border-slate-800 flex items-center justify-center"
            aria-label={t.notifications}
          >
            <Bell size={22} />

            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-cyan-400" />
          </button>

        </div>

        {/* ================================================== */}
        {/* PROFILE CARD */}
        {/* ================================================== */}

        <div className="rounded-3xl bg-[#101A2C] border border-slate-800 p-5">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-4">

              <Image
                src="/logo.png"
                alt="AI TONKEEPER"
                width={64}
                height={64}
                className="rounded-full"
              />

              <div>

                <div className="flex items-center gap-2">

                  <h2 className="text-lg font-bold">
                    AI TONKEEPER
                  </h2>

                  <span className="rounded-lg bg-purple-600 px-2 py-1 text-[10px] font-semibold">
                    {extra.premium}
                  </span>

                </div>

                <div className="mt-2 flex items-center gap-2">

                  <span className="rounded-xl border border-slate-700 bg-[#050B18] px-4 py-2 font-mono text-cyan-400">
                    ID: ATK-000001
                  </span>

                </div>

                <div className="mt-2 flex items-center gap-2">

                  <div className="w-2 h-2 rounded-full bg-green-400" />

                  <span className="text-green-400 text-sm font-medium">
                    {extra.verifiedAccount}
                  </span>

                </div>

              </div>

            </div>

            <ChevronRight
              size={22}
              className="text-gray-500"
            />

          </div>

        </div>

        {/* ================================================== */}
        {/* ACCOUNT */}
        {/* ================================================== */}

        <div className="mt-7">

          <h3 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-4">
            {extra.account}
          </h3>

          <div className="rounded-3xl bg-[#101A2C] border border-slate-800 overflow-hidden">

            {/* PROFILE */}

            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="w-full flex items-center justify-between px-5 py-5 border-b border-slate-800 hover:bg-[#16233D] transition"
            >

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
                  <UserCircle
                    size={24}
                    className="text-cyan-400"
                  />
                </div>

                <div className="text-left">

                  <p className="font-semibold">
                    {t.profile}
                  </p>

                  <p className="text-sm text-gray-400">
                    {extra.profileDescription}
                  </p>

                </div>

              </div>

              <ChevronRight
                size={20}
                className="text-gray-500"
              />

            </button>

            {/* SECURITY */}

            <button
              type="button"
              onClick={() => router.push("/security")}
              className="w-full flex items-center justify-between px-5 py-5 border-b border-slate-800 hover:bg-[#16233D] transition"
            >

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
                  <ShieldCheck
                    size={24}
                    className="text-green-400"
                  />
                </div>

                <div className="text-left">

                  <p className="font-semibold">
                    {t.security}
                  </p>

                  <p className="text-sm text-gray-400">
                    {extra.securityDescription}
                  </p>

                </div>

              </div>

              <ChevronRight
                size={20}
                className="text-gray-500"
              />

            </button>

            {/* KYC */}

            <button
              type="button"
              onClick={() => router.push("/kyc")}
              className="w-full flex items-center justify-between px-5 py-5 border-b border-slate-800 hover:bg-[#16233D] transition"
            >

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                  <BadgeCheck
                    size={24}
                    className="text-purple-400"
                  />
                </div>

                <div className="text-left">

                  <p className="font-semibold">
                    {extra.kycTitle}
                  </p>

                  <p className="text-sm text-gray-400">
                    {extra.kycDescription}
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-3">

                <span className="rounded-lg bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400">
                  {extra.verifiedAccount}
                </span>

                <ChevronRight
                  size={20}
                  className="text-gray-500"
                />

              </div>

            </button>

            {/* WALLETS */}

            <button
              type="button"
              onClick={() => router.push("/wallets")}
              className="w-full flex items-center justify-between px-5 py-5 hover:bg-[#16233D] transition"
            >

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                  <Wallet
                    size={24}
                    className="text-blue-400"
                  />
                </div>

                <div className="text-left">

                  <p className="font-semibold">
                    {extra.wallet}
                  </p>

                  <p className="text-sm text-gray-400">
                    {extra.walletsDescription}
                  </p>

                </div>

              </div>

              <ChevronRight
                size={20}
                className="text-gray-500"
              />

            </button>

          </div>

        </div>

        {/* ================================================== */}
        {/* PREFERENCES */}
        {/* ================================================== */}

        <div className="mt-7">

          <h3 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-4">
            {extra.preferences}
          </h3>

          <div className="rounded-3xl bg-[#101A2C] border border-slate-800 overflow-hidden">

            {/* LANGUAGE */}

            <button
              type="button"
              onClick={() => router.push("/app-settings")}
              className="w-full flex items-center justify-between px-5 py-5 border-b border-slate-800 hover:bg-[#16233D] transition"
            >

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
                  <Languages
                    size={24}
                    className="text-cyan-400"
                  />
                </div>

                <div className="text-left">

                  <p className="font-semibold">
                    {t.language}
                  </p>

                  <p className="text-sm text-gray-400">
                    {language === "en"
                      ? t.english
                      : language === "fr"
                        ? t.french
                        : language === "es"
                          ? t.spanish
                          : t.german}
                  </p>

                </div>

              </div>

              <ChevronRight
                size={20}
                className="text-gray-500"
              />

            </button>

            {/* APPEARANCE */}

            <button
              type="button"
              onClick={() => router.push("/app-settings")}
              className="w-full flex items-center justify-between px-5 py-5 border-b border-slate-800 hover:bg-[#16233D] transition"
            >

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                  <MoonStar
                    size={24}
                    className="text-purple-400"
                  />
                </div>

                <div className="text-left">

                  <p className="font-semibold">
                    {extra.appearance}
                  </p>

                  <p className="text-sm text-gray-400">
                    {t.darkTheme}
                  </p>

                </div>

              </div>

              <ChevronRight
                size={20}
                className="text-gray-500"
              />

            </button>

            {/* NOTIFICATIONS */}

            <button
              type="button"
              onClick={() => router.push("/notifications")}
              className="w-full flex items-center justify-between px-5 py-5 border-b border-slate-800 hover:bg-[#16233D] transition"
            >

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center">
                  <Bell
                    size={24}
                    className="text-yellow-400"
                  />
                </div>

                <div className="text-left">

                  <p className="font-semibold">
                    {t.notifications}
                  </p>

                  <p className="text-sm text-gray-400">
                    {extra.notificationsDescription}
                  </p>

                </div>

              </div>

              <ChevronRight
                size={20}
                className="text-gray-500"
              />

            </button>

            {/* AI TRADE */}

            <button
              type="button"
              onClick={() => router.push("/ai-trade")}
              className="w-full flex items-center justify-between px-5 py-5 hover:bg-[#16233D] transition"
            >

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                  <Bot
                    size={24}
                    className="text-blue-400"
                  />
                </div>

                <div className="text-left">

                  <p className="font-semibold">
                    {extra.aiTradeSettings}
                  </p>

                  <p className="text-sm text-gray-400">
                    {extra.aiTradeDescription}
                  </p>

                </div>

              </div>

              <ChevronRight
                size={20}
                className="text-gray-500"
              />

            </button>

          </div>

        </div>

        {/* ================================================== */}
        {/* SUPPORT & ABOUT */}
        {/* ================================================== */}

        <div className="mt-7">

          <h3 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-4">
            {extra.supportAbout}
          </h3>

          <div className="rounded-3xl bg-[#101A2C] border border-slate-800 overflow-hidden">

            {/* HELP CENTER */}

            <button
              type="button"
              onClick={() => router.push("/help")}
              className="w-full flex items-center justify-between px-5 py-5 border-b border-slate-800 hover:bg-[#16233D] transition"
            >

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
                  <CircleHelp
                    size={24}
                    className="text-cyan-400"
                  />
                </div>

                <div className="text-left">

                  <p className="font-semibold">
                    {extra.helpCenter}
                  </p>

                  <p className="text-sm text-gray-400">
                    {extra.helpCenterDescription}
                  </p>

                </div>

              </div>

              <ChevronRight
                size={20}
                className="text-gray-500"
              />

            </button>

            {/* CONTACT SUPPORT */}

            <button
              type="button"
              onClick={() => router.push("/support")}
              className="w-full flex items-center justify-between px-5 py-5 border-b border-slate-800 hover:bg-[#16233D] transition"
            >

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
                  <Headset
                    size={24}
                    className="text-green-400"
                  />
                </div>

                <div className="text-left">

                  <p className="font-semibold">
                    {extra.contactSupport}
                  </p>

                  <p className="text-sm text-gray-400">
                    {extra.contactSupportDescription}
                  </p>

                </div>

              </div>

              <ChevronRight
                size={20}
                className="text-gray-500"
              />

            </button>

            {/* TERMS */}

            <button
              type="button"
              onClick={() => router.push("/terms")}
              className="w-full flex items-center justify-between px-5 py-5 border-b border-slate-800 hover:bg-[#16233D] transition"
            >

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                  <FileText
                    size={24}
                    className="text-purple-400"
                  />
                </div>

                <div className="text-left">

                  <p className="font-semibold">
                    {extra.termsOfService}
                  </p>

                  <p className="text-sm text-gray-400">
                    {extra.termsDescription}
                  </p>

                </div>

              </div>

              <ChevronRight
                size={20}
                className="text-gray-500"
              />

            </button>

            {/* PRIVACY */}

            <button
              type="button"
              onClick={() => router.push("/privacy")}
              className="w-full flex items-center justify-between px-5 py-5 border-b border-slate-800 hover:bg-[#16233D] transition"
            >

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center">
                  <Shield
                    size={24}
                    className="text-yellow-400"
                  />
                </div>

                <div className="text-left">

                  <p className="font-semibold">
                    {extra.privacyPolicy}
                  </p>

                  <p className="text-sm text-gray-400">
                    {extra.privacyDescription}
                  </p>

                </div>

              </div>

              <ChevronRight
                size={20}
                className="text-gray-500"
              />

            </button>

            {/* ABOUT */}

            <button
              type="button"
              onClick={() => router.push("/about")}
              className="w-full flex items-center justify-between px-5 py-5 hover:bg-[#16233D] transition"
            >

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                  <Info
                    size={24}
                    className="text-blue-400"
                  />
                </div>

                <div className="text-left">

                  <p className="font-semibold">
                    {extra.about}
                  </p>

                  <p className="text-sm text-gray-400">
                    {extra.version}
                  </p>

                </div>

              </div>

              <ChevronRight
                size={20}
                className="text-gray-500"
              />

            </button>

          </div>

        </div>

        {/* ================================================== */}
        {/* LOG OUT */}
        {/* ================================================== */}

        <div className="mt-8 mb-28">

          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-3xl bg-[#101A2C] border border-red-500/20 hover:bg-red-500/10 active:bg-red-500/20 transition p-5"
          >

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center">

                  <LogOut
                    size={24}
                    className="text-red-400"
                  />

                </div>

                <div className="text-left">

                  <p className="font-semibold text-red-400">
                    {t.logout}
                  </p>

                  <p className="text-sm text-gray-400">
                    {extra.logoutDescription}
                  </p>

                </div>

              </div>

              <ChevronRight
                size={20}
                className="text-gray-500"
              />

            </div>

          </button>

        </div>

      </div>

      {/* ================================================== */}
      {/* BOTTOM NAVIGATION */}
      {/* ================================================== */}

      <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-800 bg-[#0B1220]/95 backdrop-blur-xl">

        <div className="max-w-md mx-auto h-20 grid grid-cols-5">

          {/* WALLET */}

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="flex flex-col items-center justify-center text-gray-500"
          >

            <Wallet size={22} />

            <span className="text-[11px] mt-1">
              {extra.wallet}
            </span>

          </button>

          {/* SWAP */}

          <button
            type="button"
            onClick={() => router.push("/swap")}
            className="flex flex-col items-center justify-center text-gray-500"
          >

            <RefreshCw size={22} />

            <span className="text-[11px] mt-1">
              {extra.swap}
            </span>

          </button>

          {/* AI TRADE */}

          <button
            type="button"
            onClick={() => router.push("/ai-trade")}
            className="flex flex-col items-center justify-center text-gray-500"
          >

            <Bot size={22} />

            <span className="text-[11px] mt-1">
              {extra.aiTrade}
            </span>

          </button>

          {/* HISTORY */}

          <button
            type="button"
            onClick={() => router.push("/history")}
            className="flex flex-col items-center justify-center text-gray-500"
          >

            <Clock3 size={22} />

            <span className="text-[11px] mt-1">
              {extra.history}
            </span>

          </button>

          {/* SETTINGS */}

          <button
            type="button"
            className="flex flex-col items-center justify-center text-cyan-400"
          >

            <Settings size={22} />

            <span className="text-[11px] mt-1 font-semibold">
              {extra.settings}
            </span>

          </button>

        </div>

      </nav>

    </main>
  );
}