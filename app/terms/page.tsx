"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  ShieldCheck,
  Wallet,
  ArrowLeftRight,
  Bot,
  LifeBuoy,
  UserCircle,
  CheckCircle2,
} from "lucide-react";

import { useLanguage } from "@/components/LanguageProvider";

type TermsContent = {
  title: string;
  subtitle: string;

  introTitle: string;
  intro: string;

  acceptanceTitle: string;
  acceptance: string;

  accountTitle: string;
  account: string;

  walletTitle: string;
  wallet: string;

  transactionsTitle: string;
  transactions: string;

  aiTradingTitle: string;
  aiTrading: string;

  securityTitle: string;
  security: string;

  risksTitle: string;
  risks: string;

  prohibitedTitle: string;
  prohibited: string;

  availabilityTitle: string;
  availability: string;

  changesTitle: string;
  changes: string;

  contactTitle: string;
  contact: string;

  lastUpdated: string;
  version: string;

  back: string;
  profile: string;
  settings: string;
  walletNav: string;
  swap: string;
  aiTrade: string;
  history: string;
  help: string;
};

const content: Record<string, TermsContent> = {
  en: {
    title: "Terms of Service",
    subtitle: "AI TONKEEPER terms and conditions",

    introTitle: "Welcome to AI TONKEEPER",
    intro:
      "These Terms of Service govern your use of the AI TONKEEPER platform, including wallet services, transactions, swaps, account features and AI Trading services.",

    acceptanceTitle: "1. Acceptance of Terms",
    acceptance:
      "By creating an account or using AI TONKEEPER, you agree to these Terms of Service. If you do not agree with these terms, you should not use the platform.",

    accountTitle: "2. Account",
    account:
      "You are responsible for providing accurate information and keeping your account credentials secure. You must not share your password, authentication codes or other security credentials with anyone.",

    walletTitle: "3. Wallet Services",
    wallet:
      "AI TONKEEPER provides wallet-related functionality that allows users to view balances and use supported deposit, withdrawal and transaction services. Available assets, networks and services may change over time.",

    transactionsTitle: "4. Transactions",
    transactions:
      "Transactions must be initiated by the authorized account holder. Blockchain transactions may be irreversible once confirmed. You are responsible for verifying destination addresses, networks and transaction amounts before confirmation.",

    aiTradingTitle: "5. AI Trading",
    aiTrading:
      "AI Trading is an automated trading service operating independently from the AI Assistant. Trading involves financial risk and does not guarantee profits. Past performance or displayed information must not be interpreted as a guarantee of future results.",

    securityTitle: "6. Security",
    security:
      "You are responsible for maintaining the security of your account and device. AI TONKEEPER will never request your seed phrase, private key, password or authentication code through unofficial channels.",

    risksTitle: "7. Risks",
    risks:
      "Cryptocurrency markets are volatile and may result in partial or total loss of funds. Network congestion, blockchain failures, market conditions, technical issues and third-party services may affect transactions or availability.",

    prohibitedTitle: "8. Prohibited Use",
    prohibited:
      "You must not use AI TONKEEPER for unlawful activities, fraud, unauthorized transactions, money laundering, attacks against the platform or any activity that violates applicable laws or regulations.",

    availabilityTitle: "9. Service Availability",
    availability:
      "We aim to maintain reliable services, but access may occasionally be interrupted because of maintenance, technical problems, network issues, security measures or circumstances outside our control.",

    changesTitle: "10. Changes to These Terms",
    changes:
      "AI TONKEEPER may update these Terms of Service when necessary. Updated terms may become effective when published on the platform. Continued use of the service after an update means that you accept the revised terms.",

    contactTitle: "11. Contact",
    contact:
      "If you have questions about these Terms of Service, please contact AI TONKEEPER support through the Support section of the platform.",

    lastUpdated: "Last updated: August 2026",
    version: "AI TONKEEPER • Version 1.0.0",

    back: "Back",
    profile: "My profile",
    settings: "Settings",
    walletNav: "Wallet",
    swap: "Swap",
    aiTrade: "AI Trade",
    history: "History",
    help: "Help",
  },

  fr: {
    title: "Conditions d'utilisation",
    subtitle: "Conditions générales de AI TONKEEPER",

    introTitle: "Bienvenue sur AI TONKEEPER",
    intro:
      "Les présentes Conditions d'utilisation régissent votre utilisation de la plateforme AI TONKEEPER, notamment les services de portefeuille, les transactions, les échanges, les fonctionnalités du compte et les services AI Trading.",

    acceptanceTitle: "1. Acceptation des conditions",
    acceptance:
      "En créant un compte ou en utilisant AI TONKEEPER, vous acceptez les présentes Conditions d'utilisation. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser la plateforme.",

    accountTitle: "2. Compte",
    account:
      "Vous êtes responsable de l'exactitude des informations fournies et de la sécurité de vos identifiants. Vous ne devez jamais partager votre mot de passe, vos codes d'authentification ou autres informations de sécurité.",

    walletTitle: "3. Services de portefeuille",
    wallet:
      "AI TONKEEPER fournit des fonctionnalités liées au portefeuille permettant notamment de consulter les soldes et d'utiliser les services disponibles de dépôt, retrait et transaction. Les actifs, réseaux et services disponibles peuvent évoluer.",

    transactionsTitle: "4. Transactions",
    transactions:
      "Les transactions doivent être effectuées par le titulaire autorisé du compte. Une transaction blockchain peut devenir irréversible après confirmation. Vous êtes responsable de vérifier l'adresse de destination, le réseau et le montant avant confirmation.",

    aiTradingTitle: "5. AI Trading",
    aiTrading:
      "AI Trading est un service de trading automatisé fonctionnant indépendamment de l'Assistant IA. Le trading comporte des risques financiers et ne garantit aucun bénéfice. Les performances passées ou les informations affichées ne constituent pas une garantie de résultats futurs.",

    securityTitle: "6. Sécurité",
    security:
      "Vous êtes responsable de la sécurité de votre compte et de votre appareil. AI TONKEEPER ne vous demandera jamais votre phrase secrète, votre clé privée, votre mot de passe ou votre code d'authentification via un canal non officiel.",

    risksTitle: "7. Risques",
    risks:
      "Les marchés des cryptomonnaies sont volatils et peuvent entraîner une perte partielle ou totale des fonds. La congestion du réseau, les problèmes blockchain, les conditions de marché, les problèmes techniques et les services tiers peuvent affecter les transactions ou la disponibilité.",

    prohibitedTitle: "8. Utilisations interdites",
    prohibited:
      "Vous ne devez pas utiliser AI TONKEEPER pour des activités illégales, la fraude, des transactions non autorisées, le blanchiment d'argent, des attaques contre la plateforme ou toute activité contraire aux lois et réglementations applicables.",

    availabilityTitle: "9. Disponibilité du service",
    availability:
      "Nous faisons notre possible pour maintenir des services fiables. Toutefois, l'accès peut être temporairement interrompu en raison de maintenance, de problèmes techniques, de problèmes réseau, de mesures de sécurité ou de circonstances indépendantes de notre volonté.",

    changesTitle: "10. Modification des conditions",
    changes:
      "AI TONKEEPER peut mettre à jour les présentes Conditions d'utilisation lorsque cela est nécessaire. Les nouvelles conditions peuvent prendre effet lorsqu'elles sont publiées sur la plateforme. La poursuite de l'utilisation du service après une modification vaut acceptation des nouvelles conditions.",

    contactTitle: "11. Contact",
    contact:
      "Pour toute question concernant les présentes Conditions d'utilisation, contactez l'assistance AI TONKEEPER depuis la section Assistance de la plateforme.",

    lastUpdated: "Dernière mise à jour : août 2026",
    version: "AI TONKEEPER • Version 1.0.0",

    back: "Retour",
    profile: "Mon profil",
    settings: "Paramètres",
    walletNav: "Portefeuille",
    swap: "Échanger",
    aiTrade: "AI Trade",
    history: "Historique",
    help: "Aide",
  },

  es: {
    title: "Términos de servicio",
    subtitle: "Términos y condiciones de AI TONKEEPER",

    introTitle: "Bienvenido a AI TONKEEPER",
    intro:
      "Estos Términos de servicio regulan el uso de la plataforma AI TONKEEPER, incluidos los servicios de billetera, transacciones, intercambios, funciones de cuenta y servicios de AI Trading.",

    acceptanceTitle: "1. Aceptación de los términos",
    acceptance:
      "Al crear una cuenta o utilizar AI TONKEEPER, aceptas estos Términos de servicio. Si no estás de acuerdo con ellos, no debes utilizar la plataforma.",

    accountTitle: "2. Cuenta",
    account:
      "Eres responsable de proporcionar información correcta y mantener seguras tus credenciales. No debes compartir tu contraseña, códigos de autenticación u otra información de seguridad.",

    walletTitle: "3. Servicios de billetera",
    wallet:
      "AI TONKEEPER proporciona funciones relacionadas con la billetera que permiten consultar saldos y utilizar los servicios disponibles de depósito, retiro y transacciones. Los activos, redes y servicios disponibles pueden cambiar.",

    transactionsTitle: "4. Transacciones",
    transactions:
      "Las transacciones deben ser iniciadas por el titular autorizado de la cuenta. Las transacciones blockchain pueden ser irreversibles una vez confirmadas. Eres responsable de verificar la dirección, la red y el importe antes de confirmar.",

    aiTradingTitle: "5. AI Trading",
    aiTrading:
      "AI Trading es un servicio de trading automatizado que funciona independientemente del Asistente IA. El trading implica riesgos financieros y no garantiza beneficios. El rendimiento pasado no garantiza resultados futuros.",

    securityTitle: "6. Seguridad",
    security:
      "Eres responsable de mantener la seguridad de tu cuenta y dispositivo. AI TONKEEPER nunca solicitará tu frase semilla, clave privada, contraseña o código de autenticación mediante canales no oficiales.",

    risksTitle: "7. Riesgos",
    risks:
      "Los mercados de criptomonedas son volátiles y pueden provocar pérdidas parciales o totales. La congestión de la red, problemas de blockchain, condiciones del mercado, problemas técnicos y servicios de terceros pueden afectar las transacciones o la disponibilidad.",

    prohibitedTitle: "8. Uso prohibido",
    prohibited:
      "No debes utilizar AI TONKEEPER para actividades ilegales, fraude, transacciones no autorizadas, blanqueo de dinero, ataques contra la plataforma o cualquier actividad que infrinja las leyes aplicables.",

    availabilityTitle: "9. Disponibilidad del servicio",
    availability:
      "Intentamos mantener servicios fiables, pero el acceso puede interrumpirse temporalmente debido a mantenimiento, problemas técnicos, problemas de red, medidas de seguridad o circunstancias fuera de nuestro control.",

    changesTitle: "10. Cambios en estos términos",
    changes:
      "AI TONKEEPER puede actualizar estos Términos de servicio cuando sea necesario. Los términos actualizados pueden entrar en vigor cuando se publiquen en la plataforma. El uso continuado del servicio implica la aceptación de los términos modificados.",

    contactTitle: "11. Contacto",
    contact:
      "Si tienes preguntas sobre estos Términos de servicio, contacta con el soporte de AI TONKEEPER desde la sección de Soporte de la plataforma.",

    lastUpdated: "Última actualización: agosto de 2026",
    version: "AI TONKEEPER • Versión 1.0.0",

    back: "Volver",
    profile: "Mi perfil",
    settings: "Configuración",
    walletNav: "Billetera",
    swap: "Intercambiar",
    aiTrade: "AI Trade",
    history: "Historial",
    help: "Ayuda",
  },

  de: {
    title: "Nutzungsbedingungen",
    subtitle: "Allgemeine Bedingungen von AI TONKEEPER",

    introTitle: "Willkommen bei AI TONKEEPER",
    intro:
      "Diese Nutzungsbedingungen regeln die Verwendung der AI TONKEEPER Plattform, einschließlich Wallet-Diensten, Transaktionen, Tauschvorgängen, Kontofunktionen und AI-Trading-Diensten.",

    acceptanceTitle: "1. Zustimmung zu den Bedingungen",
    acceptance:
      "Durch die Erstellung eines Kontos oder die Nutzung von AI TONKEEPER stimmst du diesen Nutzungsbedingungen zu. Wenn du ihnen nicht zustimmst, darfst du die Plattform nicht verwenden.",

    accountTitle: "2. Konto",
    account:
      "Du bist dafür verantwortlich, korrekte Informationen bereitzustellen und deine Zugangsdaten sicher aufzubewahren. Teile niemals dein Passwort, deine Authentifizierungscodes oder andere Sicherheitsinformationen.",

    walletTitle: "3. Wallet-Dienste",
    wallet:
      "AI TONKEEPER stellt Wallet-Funktionen bereit, mit denen Nutzer Guthaben anzeigen und verfügbare Einzahlungs-, Auszahlungs- und Transaktionsdienste nutzen können. Verfügbare Assets, Netzwerke und Dienste können sich ändern.",

    transactionsTitle: "4. Transaktionen",
    transactions:
      "Transaktionen dürfen nur vom autorisierten Kontoinhaber durchgeführt werden. Blockchain-Transaktionen können nach der Bestätigung unumkehrbar sein. Du bist dafür verantwortlich, Zieladresse, Netzwerk und Betrag vor der Bestätigung zu überprüfen.",

    aiTradingTitle: "5. AI Trading",
    aiTrading:
      "AI Trading ist ein automatisierter Trading-Dienst, der unabhängig vom KI-Assistenten arbeitet. Trading beinhaltet finanzielle Risiken und garantiert keine Gewinne. Vergangene Ergebnisse garantieren keine zukünftigen Ergebnisse.",

    securityTitle: "6. Sicherheit",
    security:
      "Du bist für die Sicherheit deines Kontos und Geräts verantwortlich. AI TONKEEPER wird niemals deine Seed-Phrase, deinen privaten Schlüssel, dein Passwort oder deinen Authentifizierungscode über nicht offizielle Kanäle verlangen.",

    risksTitle: "7. Risiken",
    risks:
      "Kryptowährungsmärkte sind volatil und können zu teilweisen oder vollständigen Verlusten führen. Netzwerküberlastungen, Blockchain-Probleme, Marktbedingungen, technische Probleme und Drittanbieterdienste können Transaktionen oder die Verfügbarkeit beeinflussen.",

    prohibitedTitle: "8. Verbotene Nutzung",
    prohibited:
      "AI TONKEEPER darf nicht für illegale Aktivitäten, Betrug, nicht autorisierte Transaktionen, Geldwäsche, Angriffe auf die Plattform oder andere Verstöße gegen geltende Gesetze verwendet werden.",

    availabilityTitle: "9. Verfügbarkeit des Dienstes",
    availability:
      "Wir bemühen uns um zuverlässige Dienste. Der Zugriff kann jedoch aufgrund von Wartungsarbeiten, technischen Problemen, Netzwerkproblemen, Sicherheitsmaßnahmen oder Umständen außerhalb unserer Kontrolle vorübergehend unterbrochen werden.",

    changesTitle: "10. Änderungen dieser Bedingungen",
    changes:
      "AI TONKEEPER kann diese Nutzungsbedingungen bei Bedarf aktualisieren. Aktualisierte Bedingungen können mit ihrer Veröffentlichung auf der Plattform wirksam werden. Die weitere Nutzung des Dienstes bedeutet die Zustimmung zu den geänderten Bedingungen.",

    contactTitle: "11. Kontakt",
    contact:
      "Bei Fragen zu diesen Nutzungsbedingungen kannst du den AI TONKEEPER Support über den Support-Bereich der Plattform kontaktieren.",

    lastUpdated: "Letzte Aktualisierung: August 2026",
    version: "AI TONKEEPER • Version 1.0.0",

    back: "Zurück",
    profile: "Mein Profil",
    settings: "Einstellungen",
    walletNav: "Wallet",
    swap: "Tauschen",
    aiTrade: "AI Trade",
    history: "Verlauf",
    help: "Hilfe",
  },
};

export default function TermsPage() {
  const router = useRouter();
  const { language } = useLanguage();

  const current = content[language] ?? content.en;

  const sections = [
    {
      title: current.acceptanceTitle,
      text: current.acceptance,
      icon: CheckCircle2,
    },
    {
      title: current.accountTitle,
      text: current.account,
      icon: UserCircle,
    },
    {
      title: current.walletTitle,
      text: current.wallet,
      icon: Wallet,
    },
    {
      title: current.transactionsTitle,
      text: current.transactions,
      icon: ArrowLeftRight,
    },
    {
      title: current.aiTradingTitle,
      text: current.aiTrading,
      icon: Bot,
    },
    {
      title: current.securityTitle,
      text: current.security,
      icon: ShieldCheck,
    },
    {
      title: current.risksTitle,
      text: current.risks,
      icon: FileText,
    },
    {
      title: current.prohibitedTitle,
      text: current.prohibited,
      icon: ShieldCheck,
    },
    {
      title: current.availabilityTitle,
      text: current.availability,
      icon: LifeBuoy,
    },
    {
      title: current.changesTitle,
      text: current.changes,
      icon: FileText,
    },
    {
      title: current.contactTitle,
      text: current.contact,
      icon: MessageCircleIcon,
    },
  ];

  return (
    <main className="min-h-screen bg-[#050B18] pb-28 text-white">
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
            <h1 className="text-2xl font-bold">
              {current.title}
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              {current.subtitle}
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-[#101A2C]">
            <FileText
              size={22}
              className="text-cyan-400"
            />
          </div>
        </div>

        {/* HERO */}

        <section className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10">
              <FileText size={28} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                {current.introTitle}
              </h2>

              <p className="mt-1 text-sm text-cyan-100">
                {current.subtitle}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-white/10 p-4">
            <p className="text-sm leading-6 text-cyan-50">
              {current.intro}
            </p>
          </div>
        </section>

        {/* TERMS */}

        <section className="mt-8 space-y-4">
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <article
                key={section.title}
                className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10">
                    <Icon
                      size={21}
                      className="text-cyan-400"
                    />
                  </div>

                  <div className="min-w-0">
                    <h2 className="font-bold leading-6">
                      {section.title}
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      {section.text}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {/* SECURITY NOTICE */}

        <section className="mt-8 rounded-3xl border border-green-500/20 bg-green-500/5 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-500/10">
              <ShieldCheck
                size={22}
                className="text-green-400"
              />
            </div>

            <div>
              <h2 className="font-bold">
                {current.securityTitle}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                {current.security}
              </p>
            </div>
          </div>
        </section>

        {/* LAST UPDATED */}

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500">
            {current.lastUpdated}
          </p>

          <p className="mt-2 text-xs text-slate-600">
            {current.version}
          </p>
        </div>

        {/* ACCOUNT LINKS */}

        <div className="mt-8 overflow-hidden rounded-3xl border border-slate-800 bg-[#101A2C]">
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
                {current.profile}
              </span>
            </div>

            <ArrowLeft
              size={19}
              className="rotate-180 text-slate-500"
            />
          </button>

          <button
            type="button"
            onClick={() => router.push("/settings")}
            className="flex w-full items-center justify-between px-5 py-5 text-left transition hover:bg-[#16233D]"
          >
            <div className="flex items-center gap-4">
              <ShieldCheck
                size={22}
                className="text-green-400"
              />

              <span className="font-medium">
                {current.settings}
              </span>
            </div>

            <ArrowLeft
              size={19}
              className="rotate-180 text-slate-500"
            />
          </button>
        </div>

        {/* FOOTER */}

        <footer className="mt-10 border-t border-slate-800 pt-6 text-center">
          <p className="text-sm text-slate-500">
            AI TONKEEPER
          </p>

          <p className="mt-2 text-xs text-slate-600">
            {current.lastUpdated}
          </p>
        </footer>
      </div>

      {/* BOTTOM NAVIGATION */}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-[#0B1220]/95 backdrop-blur-xl">
        <div className="mx-auto grid h-20 max-w-md grid-cols-5">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="flex flex-col items-center justify-center text-slate-500 transition hover:text-white"
          >
            <Wallet size={21} />

            <span className="mt-1 text-[10px]">
              {current.walletNav}
            </span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/swap")}
            className="flex flex-col items-center justify-center text-slate-500 transition hover:text-white"
          >
            <ArrowLeftRight size={21} />

            <span className="mt-1 text-[10px]">
              {current.swap}
            </span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/ai-trade")}
            className="flex flex-col items-center justify-center text-slate-500 transition hover:text-white"
          >
            <Bot size={21} />

            <span className="mt-1 text-[10px]">
              {current.aiTrade}
            </span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/history")}
            className="flex flex-col items-center justify-center text-slate-500 transition hover:text-white"
          >
            <FileText size={21} />

            <span className="mt-1 text-[10px]">
              {current.history}
            </span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/help")}
            className="flex flex-col items-center justify-center text-slate-500 transition hover:text-white"
          >
            <LifeBuoy size={21} />

            <span className="mt-1 text-[10px]">
              {current.help}
            </span>
          </button>
        </div>
      </nav>
    </main>
  );
}

function MessageCircleIcon(
  props: React.ComponentProps<
    typeof LifeBuoy
  >
) {
  return <LifeBuoy {...props} />;
}