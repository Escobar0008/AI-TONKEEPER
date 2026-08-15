"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  LockKeyhole,
  UserCircle,
  Wallet,
  ArrowLeftRight,
  Bot,
  LifeBuoy,
  Database,
  Eye,
  KeyRound,
  FileText,
  CheckCircle2,
} from "lucide-react";

import { useLanguage } from "@/components/LanguageProvider";

type PrivacyContent = {
  title: string;
  subtitle: string;

  introTitle: string;
  intro: string;

  collectionTitle: string;
  collection: string;

  accountTitle: string;
  account: string;

  documentsTitle: string;
  documents: string;

  transactionTitle: string;
  transaction: string;

  technicalTitle: string;
  technical: string;

  usageTitle: string;
  usage: string;

  protectionTitle: string;
  protection: string;

  sharingTitle: string;
  sharing: string;

  retentionTitle: string;
  retention: string;

  rightsTitle: string;
  rights: string;

  cookiesTitle: string;
  cookies: string;

  changesTitle: string;
  changes: string;

  contactTitle: string;
  contact: string;

  securityNotice: string;

  lastUpdated: string;
  version: string;

  back: string;
  profile: string;
  settings: string;
  wallet: string;
  swap: string;
  aiTrade: string;
  history: string;
  help: string;
};

const content: Record<string, PrivacyContent> = {
  en: {
    title: "Privacy Policy",
    subtitle: "How AI TONKEEPER handles your information",

    introTitle: "Your privacy matters",
    intro:
      "This Privacy Policy explains how AI TONKEEPER collects, uses, protects and manages information when you use our platform and services.",

    collectionTitle: "1. Information We Collect",
    collection:
      "We may collect information necessary to create and maintain your account, provide platform services, process transactions, provide support and maintain platform security.",

    accountTitle: "2. Account Information",
    account:
      "Account information may include your name, email address, account preferences and other information you provide when using AI TONKEEPER.",

    documentsTitle: "3. Identity Verification",
    documents:
      "When identity verification is required, you may provide identification documents and related information. These documents are handled for verification and compliance purposes and are protected using appropriate security measures.",

    transactionTitle: "4. Transaction Information",
    transaction:
      "Information related to deposits, withdrawals, swaps, trading activity and other transactions may be recorded to provide services, maintain accurate account records and protect the platform.",

    technicalTitle: "5. Technical Information",
    technical:
      "We may collect technical information such as device information, browser information, IP-related security information, logs and platform activity needed to operate and protect the service.",

    usageTitle: "6. How We Use Information",
    usage:
      "Information may be used to provide and improve AI TONKEEPER services, authenticate users, process transactions, perform security checks, support users, prevent fraud and maintain platform functionality.",

    protectionTitle: "7. Data Protection",
    protection:
      "We use reasonable technical and organizational measures to protect information against unauthorized access, alteration, disclosure or destruction. No internet-based service can guarantee absolute security.",

    sharingTitle: "8. Sharing of Information",
    sharing:
      "Information may be shared with service providers or infrastructure partners when necessary to operate the platform, process services, provide security or comply with applicable legal requirements. We do not sell personal information simply because you use the platform.",

    retentionTitle: "9. Data Retention",
    retention:
      "Information may be retained for as long as necessary to provide services, maintain security, comply with applicable obligations, resolve disputes and maintain appropriate business records.",

    rightsTitle: "10. Your Rights",
    rights:
      "Depending on applicable law, you may have rights concerning access, correction, deletion or other processing of your personal information. Requests can be submitted through AI TONKEEPER support.",

    cookiesTitle: "11. Cookies and Similar Technologies",
    cookies:
      "AI TONKEEPER may use cookies or similar technologies to maintain sessions, remember preferences, improve functionality and support platform security.",

    changesTitle: "12. Changes to This Policy",
    changes:
      "This Privacy Policy may be updated when necessary. Changes may become effective when the updated policy is published on the platform.",

    contactTitle: "13. Contact",
    contact:
      "If you have questions about this Privacy Policy or how your information is handled, contact AI TONKEEPER support through the Support section.",

    securityNotice:
      "Never share your password, seed phrase, private key or authentication codes with anyone claiming to provide support.",

    lastUpdated: "Last updated: August 2026",
    version: "AI TONKEEPER • Version 1.0.0",

    back: "Back",
    profile: "My profile",
    settings: "Settings",
    wallet: "Wallet",
    swap: "Swap",
    aiTrade: "AI Trade",
    history: "History",
    help: "Help",
  },

  fr: {
    title: "Politique de confidentialité",
    subtitle: "Comment AI TONKEEPER protège vos informations",

    introTitle: "Votre confidentialité compte",
    intro:
      "Cette Politique de confidentialité explique comment AI TONKEEPER collecte, utilise, protège et gère les informations lorsque vous utilisez notre plateforme et nos services.",

    collectionTitle: "1. Informations collectées",
    collection:
      "Nous pouvons collecter les informations nécessaires à la création et au fonctionnement de votre compte, à la fourniture des services, au traitement des transactions, à l'assistance et à la sécurité de la plateforme.",

    accountTitle: "2. Informations du compte",
    account:
      "Les informations du compte peuvent inclure votre nom, votre adresse e-mail, vos préférences et les autres informations que vous fournissez lors de l'utilisation de AI TONKEEPER.",

    documentsTitle: "3. Vérification d'identité",
    documents:
      "Lorsque la vérification d'identité est nécessaire, vous pouvez fournir des documents d'identité et des informations associées. Ces documents sont traités à des fins de vérification et de conformité et sont protégés par des mesures de sécurité appropriées.",

    transactionTitle: "4. Informations sur les transactions",
    transaction:
      "Les informations relatives aux dépôts, retraits, swaps, activités de trading et autres transactions peuvent être enregistrées afin de fournir les services, maintenir des comptes exacts et protéger la plateforme.",

    technicalTitle: "5. Informations techniques",
    technical:
      "Nous pouvons collecter certaines informations techniques telles que les informations relatives à l'appareil, au navigateur, les informations de sécurité liées à l'adresse IP, les journaux et l'activité nécessaires au fonctionnement et à la protection du service.",

    usageTitle: "6. Utilisation des informations",
    usage:
      "Les informations peuvent être utilisées pour fournir et améliorer les services AI TONKEEPER, authentifier les utilisateurs, traiter les transactions, effectuer des contrôles de sécurité, assister les utilisateurs, prévenir la fraude et maintenir le fonctionnement de la plateforme.",

    protectionTitle: "7. Protection des données",
    protection:
      "Nous utilisons des mesures techniques et organisationnelles raisonnables pour protéger les informations contre l'accès non autorisé, la modification, la divulgation ou la destruction. Aucun service Internet ne peut garantir une sécurité absolue.",

    sharingTitle: "8. Partage des informations",
    sharing:
      "Les informations peuvent être partagées avec des prestataires de services ou partenaires d'infrastructure lorsque cela est nécessaire au fonctionnement de la plateforme, au traitement des services, à la sécurité ou au respect des obligations légales applicables. Nous ne vendons pas vos informations personnelles simplement parce que vous utilisez la plateforme.",

    retentionTitle: "9. Conservation des données",
    retention:
      "Les informations peuvent être conservées aussi longtemps que nécessaire pour fournir les services, maintenir la sécurité, respecter les obligations applicables, résoudre les litiges et conserver les documents nécessaires.",

    rightsTitle: "10. Vos droits",
    rights:
      "Selon les lois applicables, vous pouvez disposer de droits concernant l'accès, la correction, la suppression ou d'autres traitements de vos informations personnelles. Les demandes peuvent être adressées à l'assistance AI TONKEEPER.",

    cookiesTitle: "11. Cookies et technologies similaires",
    cookies:
      "AI TONKEEPER peut utiliser des cookies ou technologies similaires afin de maintenir les sessions, mémoriser les préférences, améliorer les fonctionnalités et renforcer la sécurité de la plateforme.",

    changesTitle: "12. Modifications de cette politique",
    changes:
      "Cette Politique de confidentialité peut être mise à jour lorsque cela est nécessaire. Les modifications peuvent prendre effet lorsque la politique mise à jour est publiée sur la plateforme.",

    contactTitle: "13. Contact",
    contact:
      "Si vous avez des questions concernant cette Politique de confidentialité ou la manière dont vos informations sont traitées, contactez l'assistance AI TONKEEPER depuis la section Assistance.",

    securityNotice:
      "Ne partagez jamais votre mot de passe, votre phrase secrète, votre clé privée ou vos codes d'authentification avec une personne prétendant faire partie de l'assistance.",

    lastUpdated: "Dernière mise à jour : août 2026",
    version: "AI TONKEEPER • Version 1.0.0",

    back: "Retour",
    profile: "Mon profil",
    settings: "Paramètres",
    wallet: "Portefeuille",
    swap: "Échanger",
    aiTrade: "AI Trade",
    history: "Historique",
    help: "Aide",
  },

  es: {
    title: "Política de privacidad",
    subtitle: "Cómo AI TONKEEPER gestiona tu información",

    introTitle: "Tu privacidad es importante",
    intro:
      "Esta Política de privacidad explica cómo AI TONKEEPER recopila, utiliza, protege y gestiona la información cuando utilizas nuestra plataforma y nuestros servicios.",

    collectionTitle: "1. Información que recopilamos",
    collection:
      "Podemos recopilar la información necesaria para crear y mantener tu cuenta, proporcionar servicios, procesar transacciones, ofrecer soporte y mantener la seguridad de la plataforma.",

    accountTitle: "2. Información de la cuenta",
    account:
      "La información de la cuenta puede incluir tu nombre, dirección de correo electrónico, preferencias y otra información que proporciones al utilizar AI TONKEEPER.",

    documentsTitle: "3. Verificación de identidad",
    documents:
      "Cuando sea necesaria la verificación de identidad, puedes proporcionar documentos de identificación e información relacionada. Estos documentos se procesan para fines de verificación y cumplimiento y se protegen mediante medidas de seguridad adecuadas.",

    transactionTitle: "4. Información de transacciones",
    transaction:
      "La información relacionada con depósitos, retiros, intercambios, actividad de trading y otras transacciones puede registrarse para proporcionar servicios, mantener registros precisos y proteger la plataforma.",

    technicalTitle: "5. Información técnica",
    technical:
      "Podemos recopilar información técnica como información del dispositivo, navegador, información de seguridad relacionada con la IP, registros y actividad necesaria para operar y proteger el servicio.",

    usageTitle: "6. Uso de la información",
    usage:
      "La información puede utilizarse para proporcionar y mejorar los servicios de AI TONKEEPER, autenticar usuarios, procesar transacciones, realizar controles de seguridad, ofrecer soporte, prevenir fraudes y mantener la plataforma.",

    protectionTitle: "7. Protección de datos",
    protection:
      "Utilizamos medidas técnicas y organizativas razonables para proteger la información contra accesos no autorizados, alteraciones, divulgación o destrucción. Ningún servicio de Internet puede garantizar una seguridad absoluta.",

    sharingTitle: "8. Compartición de información",
    sharing:
      "La información puede compartirse con proveedores de servicios o socios de infraestructura cuando sea necesario para operar la plataforma, procesar servicios, proporcionar seguridad o cumplir obligaciones legales aplicables. No vendemos información personal simplemente por utilizar la plataforma.",

    retentionTitle: "9. Conservación de datos",
    retention:
      "La información puede conservarse durante el tiempo necesario para prestar los servicios, mantener la seguridad, cumplir obligaciones aplicables, resolver disputas y mantener registros adecuados.",

    rightsTitle: "10. Tus derechos",
    rights:
      "Dependiendo de la legislación aplicable, puedes tener derechos relacionados con el acceso, corrección, eliminación u otros tratamientos de tu información personal. Las solicitudes pueden enviarse al soporte de AI TONKEEPER.",

    cookiesTitle: "11. Cookies y tecnologías similares",
    cookies:
      "AI TONKEEPER puede utilizar cookies o tecnologías similares para mantener sesiones, recordar preferencias, mejorar funcionalidades y reforzar la seguridad de la plataforma.",

    changesTitle: "12. Cambios en esta política",
    changes:
      "Esta Política de privacidad puede actualizarse cuando sea necesario. Los cambios pueden entrar en vigor cuando la política actualizada se publique en la plataforma.",

    contactTitle: "13. Contacto",
    contact:
      "Si tienes preguntas sobre esta Política de privacidad o sobre cómo se gestiona tu información, contacta con el soporte de AI TONKEEPER desde la sección de Soporte.",

    securityNotice:
      "Nunca compartas tu contraseña, frase semilla, clave privada o códigos de autenticación con alguien que afirme proporcionar soporte.",

    lastUpdated: "Última actualización: agosto de 2026",
    version: "AI TONKEEPER • Versión 1.0.0",

    back: "Volver",
    profile: "Mi perfil",
    settings: "Configuración",
    wallet: "Billetera",
    swap: "Intercambiar",
    aiTrade: "AI Trade",
    history: "Historial",
    help: "Ayuda",
  },

  de: {
    title: "Datenschutzerklärung",
    subtitle: "Wie AI TONKEEPER deine Informationen verarbeitet",

    introTitle: "Deine Privatsphäre ist wichtig",
    intro:
      "Diese Datenschutzerklärung erklärt, wie AI TONKEEPER Informationen sammelt, verwendet, schützt und verwaltet, wenn du unsere Plattform und Dienste nutzt.",

    collectionTitle: "1. Erhobene Informationen",
    collection:
      "Wir können Informationen erfassen, die für die Erstellung und Verwaltung deines Kontos, die Bereitstellung von Diensten, die Verarbeitung von Transaktionen, den Support und die Sicherheit der Plattform erforderlich sind.",

    accountTitle: "2. Kontoinformationen",
    account:
      "Zu den Kontoinformationen können dein Name, deine E-Mail-Adresse, deine Einstellungen und andere Informationen gehören, die du bei der Nutzung von AI TONKEEPER bereitstellst.",

    documentsTitle: "3. Identitätsprüfung",
    documents:
      "Wenn eine Identitätsprüfung erforderlich ist, kannst du Ausweisdokumente und damit verbundene Informationen bereitstellen. Diese Dokumente werden zu Verifizierungs- und Compliance-Zwecken verarbeitet und durch geeignete Sicherheitsmaßnahmen geschützt.",

    transactionTitle: "4. Transaktionsinformationen",
    transaction:
      "Informationen zu Einzahlungen, Auszahlungen, Swaps, Trading-Aktivitäten und anderen Transaktionen können gespeichert werden, um Dienste bereitzustellen, korrekte Kontodaten zu führen und die Plattform zu schützen.",

    technicalTitle: "5. Technische Informationen",
    technical:
      "Wir können technische Informationen wie Geräteinformationen, Browserinformationen, IP-bezogene Sicherheitsinformationen, Protokolle und Plattformaktivitäten erfassen, die für den Betrieb und Schutz des Dienstes erforderlich sind.",

    usageTitle: "6. Verwendung von Informationen",
    usage:
      "Informationen können verwendet werden, um AI TONKEEPER Dienste bereitzustellen und zu verbessern, Benutzer zu authentifizieren, Transaktionen zu verarbeiten, Sicherheitsprüfungen durchzuführen, Benutzer zu unterstützen, Betrug zu verhindern und die Plattform zu betreiben.",

    protectionTitle: "7. Datenschutz",
    protection:
      "Wir verwenden angemessene technische und organisatorische Maßnahmen, um Informationen vor unbefugtem Zugriff, Veränderung, Offenlegung oder Zerstörung zu schützen. Kein internetbasierter Dienst kann absolute Sicherheit garantieren.",

    sharingTitle: "8. Weitergabe von Informationen",
    sharing:
      "Informationen können an Dienstleister oder Infrastrukturpartner weitergegeben werden, wenn dies für den Betrieb der Plattform, die Verarbeitung von Diensten, Sicherheitsmaßnahmen oder die Einhaltung gesetzlicher Anforderungen erforderlich ist. Wir verkaufen persönliche Informationen nicht allein deshalb, weil du die Plattform nutzt.",

    retentionTitle: "9. Speicherung von Daten",
    retention:
      "Informationen können so lange gespeichert werden, wie dies für die Bereitstellung von Diensten, die Sicherheit, die Erfüllung gesetzlicher Verpflichtungen, die Beilegung von Streitigkeiten und die Führung geeigneter Geschäftsunterlagen erforderlich ist.",

    rightsTitle: "10. Deine Rechte",
    rights:
      "Je nach geltendem Recht kannst du Rechte bezüglich des Zugriffs, der Berichtigung, Löschung oder anderer Verarbeitung deiner persönlichen Informationen haben. Anfragen können über den AI TONKEEPER Support gestellt werden.",

    cookiesTitle: "11. Cookies und ähnliche Technologien",
    cookies:
      "AI TONKEEPER kann Cookies oder ähnliche Technologien verwenden, um Sitzungen aufrechtzuerhalten, Einstellungen zu speichern, Funktionen zu verbessern und die Plattform zu schützen.",

    changesTitle: "12. Änderungen dieser Richtlinie",
    changes:
      "Diese Datenschutzerklärung kann bei Bedarf aktualisiert werden. Änderungen können mit der Veröffentlichung der aktualisierten Richtlinie auf der Plattform wirksam werden.",

    contactTitle: "13. Kontakt",
    contact:
      "Wenn du Fragen zu dieser Datenschutzerklärung oder zur Verarbeitung deiner Informationen hast, kontaktiere den AI TONKEEPER Support über den Support-Bereich.",

    securityNotice:
      "Teile niemals dein Passwort, deine Seed-Phrase, deinen privaten Schlüssel oder deine Authentifizierungscodes mit Personen, die behaupten, Support anzubieten.",

    lastUpdated: "Letzte Aktualisierung: August 2026",
    version: "AI TONKEEPER • Version 1.0.0",

    back: "Zurück",
    profile: "Mein Profil",
    settings: "Einstellungen",
    wallet: "Wallet",
    swap: "Tauschen",
    aiTrade: "AI Trade",
    history: "Verlauf",
    help: "Hilfe",
  },
};

export default function PrivacyPage() {
  const router = useRouter();
  const { language } = useLanguage();

  const current = content[language] ?? content.en;

  const sections = [
    {
      title: current.collectionTitle,
      text: current.collection,
      icon: Database,
    },
    {
      title: current.accountTitle,
      text: current.account,
      icon: UserCircle,
    },
    {
      title: current.documentsTitle,
      text: current.documents,
      icon: FileText,
    },
    {
      title: current.transactionTitle,
      text: current.transaction,
      icon: Wallet,
    },
    {
      title: current.technicalTitle,
      text: current.technical,
      icon: Database,
    },
    {
      title: current.usageTitle,
      text: current.usage,
      icon: Eye,
    },
    {
      title: current.protectionTitle,
      text: current.protection,
      icon: ShieldCheck,
    },
    {
      title: current.sharingTitle,
      text: current.sharing,
      icon: ArrowLeftRight,
    },
    {
      title: current.retentionTitle,
      text: current.retention,
      icon: LockKeyhole,
    },
    {
      title: current.rightsTitle,
      text: current.rights,
      icon: CheckCircle2,
    },
    {
      title: current.cookiesTitle,
      text: current.cookies,
      icon: Database,
    },
    {
      title: current.changesTitle,
      text: current.changes,
      icon: FileText,
    },
    {
      title: current.contactTitle,
      text: current.contact,
      icon: LifeBuoy,
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
            <ShieldCheck
              size={22}
              className="text-cyan-400"
            />
          </div>
        </div>

        {/* HERO */}

        <section className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10">
              <ShieldCheck size={28} />
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

        {/* PRIVACY SECTIONS */}

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
              <KeyRound
                size={22}
                className="text-green-400"
              />
            </div>

            <div>
              <h2 className="font-bold">
                {current.protectionTitle}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                {current.securityNotice}
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
              {current.wallet}
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