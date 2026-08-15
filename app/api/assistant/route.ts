import { NextRequest, NextResponse } from "next/server";

type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

type AssistantRequest = {
  message?: string;
  conversation?: ConversationMessage[];
};

type AssistantResponse = {
  success: boolean;
  reply?: string;
  message?: string;
};

/**
 * ============================================================
 * AI TONKEEPER LOCAL ASSISTANT
 * ============================================================
 *
 * Temporary local assistant.
 *
 * No OpenAI API.
 * No external AI provider.
 * No API key required.
 *
 * This keeps the Assistant interface/API operational while
 * allowing the project to be deployed without paid AI services.
 *
 * The dedicated AI Trading engine remains completely separate.
 * ============================================================
 */

function detectLanguage(message: string): "fr" | "en" | "es" | "de" {
  const text = message.toLowerCase();

  if (
    /[àâäçéèêëîïôöùûüÿœ]/.test(text) ||
    /\b(bonjour|salut|merci|comment|pourquoi|comment ça|portefeuille|sécurité|trading)\b/.test(
      text
    )
  ) {
    return "fr";
  }

  if (
    /\b(hola|gracias|cómo|porque|cartera|seguridad|trading)\b/.test(
      text
    )
  ) {
    return "es";
  }

  if (
    /\b(hallo|danke|wie|warum|wallet|sicherheit|handel|trading)\b/.test(
      text
    )
  ) {
    return "de";
  }

  return "en";
}

function getLocalReply(message: string): string {
  const text = message.toLowerCase().trim();
  const language = detectLanguage(message);

  const asksAboutTrading =
    text.includes("ai trading") ||
    text.includes("trading") ||
    text.includes("trade") ||
    text.includes("trader") ||
    text.includes("bot");

  const asksAboutSecurity =
    text.includes("security") ||
    text.includes("sécurité") ||
    text.includes("secure") ||
    text.includes("password") ||
    text.includes("mot de passe") ||
    text.includes("private key") ||
    text.includes("clé privée") ||
    text.includes("seed phrase") ||
    text.includes("phrase de récupération");

  const asksAboutWallet =
    text.includes("wallet") ||
    text.includes("portefeuille") ||
    text.includes("tonkeeper") ||
    text.includes("balance") ||
    text.includes("solde");

  const asksAboutSwap =
    text.includes("swap") ||
    text.includes("exchange") ||
    text.includes("échanger") ||
    text.includes("échange");

  const asksAboutDeposit =
    text.includes("deposit") ||
    text.includes("dépôt") ||
    text.includes("déposer") ||
    text.includes("deposit");

  const asksAboutWithdraw =
    text.includes("withdraw") ||
    text.includes("retrait") ||
    text.includes("retirer");

  const asksAboutStaking =
    text.includes("staking") ||
    text.includes("stake");

  if (language === "fr") {
    if (asksAboutSecurity) {
      return (
        "La sécurité est une priorité sur AI TONKEEPER. " +
        "Ne partage jamais ta phrase de récupération, ta clé privée, ton mot de passe ou un code d'authentification. " +
        "L'Assistant ne te demandera jamais ces informations."
      );
    }

    if (asksAboutTrading) {
      return (
        "AI Trading est géré par un moteur de trading dédié et indépendant de l'Assistant. " +
        "L'Assistant peut expliquer les concepts de trading et les informations disponibles, " +
        "mais il n'exécute pas directement les trades et ne modifie pas la configuration du moteur."
      );
    }

    if (asksAboutWallet) {
      return (
        "AI TONKEEPER est conçu comme une plateforme de gestion de portefeuille crypto. " +
        "Pour les informations réelles concernant ton compte, ton solde ou tes transactions, " +
        "je dois utiliser les données disponibles dans ton compte et je ne dois jamais les inventer."
      );
    }

    if (asksAboutSwap) {
      return (
        "Le Swap permet d'échanger un actif crypto contre un autre selon le taux disponible. " +
        "Avant de confirmer une opération, vérifie toujours l'actif, le montant, le taux et les frais."
      );
    }

    if (asksAboutDeposit) {
      return (
        "Pour un dépôt, utilise l'adresse de dépôt affichée par AI TONKEEPER pour l'actif et le réseau concernés. " +
        "Vérifie toujours le réseau avant d'envoyer des fonds."
      );
    }

    if (asksAboutWithdraw) {
      return (
        "Pour un retrait, vérifie soigneusement l'adresse destinataire, le réseau, l'actif et le montant avant confirmation. " +
        "Une transaction blockchain peut être irréversible."
      );
    }

    if (asksAboutStaking) {
      return (
        "Le staking consiste généralement à immobiliser ou déléguer certains actifs afin de participer au fonctionnement d'un réseau ou d'un protocole. " +
        "Les conditions et les risques dépendent de l'actif et du protocole concernés."
      );
    }

    return (
      "Bonjour 👋 Je suis l'Assistant AI TONKEEPER. " +
      "Je fonctionne actuellement en mode local. " +
      "Je peux t'aider à comprendre les wallets, la sécurité, le Swap, les dépôts, les retraits, le staking et AI Trading. " +
      "Une connexion à un fournisseur IA pourra être ajoutée plus tard."
    );
  }

  if (language === "es") {
    if (asksAboutSecurity) {
      return (
        "La seguridad es una prioridad en AI TONKEEPER. " +
        "Nunca compartas tu frase de recuperación, clave privada, contraseña o código de autenticación."
      );
    }

    if (asksAboutTrading) {
      return (
        "AI Trading está gestionado por un motor de trading independiente. " +
        "El Assistant puede explicar conceptos de trading, pero no ejecuta operaciones directamente."
      );
    }

    if (asksAboutWallet) {
      return (
        "AI TONKEEPER está diseñado para gestionar activos y operaciones de criptomonedas. " +
        "No debo inventar información real sobre tu saldo o tus transacciones."
      );
    }

    return (
      "Hola 👋 Soy el Assistant de AI TONKEEPER. " +
      "Actualmente funciono en modo local y puedo ayudarte con wallets, seguridad, Swap, depósitos, retiros, staking y AI Trading."
    );
  }

  if (language === "de") {
    if (asksAboutSecurity) {
      return (
        "Sicherheit hat bei AI TONKEEPER Priorität. " +
        "Teile niemals deine Wiederherstellungsphrase, deinen privaten Schlüssel, dein Passwort oder einen Authentifizierungscode."
      );
    }

    if (asksAboutTrading) {
      return (
        "AI Trading wird von einer unabhängigen Trading-Engine verwaltet. " +
        "Der Assistant kann Trading-Konzepte erklären, führt aber selbst keine Trades aus."
      );
    }

    if (asksAboutWallet) {
      return (
        "AI TONKEEPER dient zur Verwaltung von Krypto-Assets und Wallet-Funktionen. " +
        "Ich darf keine echten Kontostände oder Transaktionen erfinden."
      );
    }

    return (
      "Hallo 👋 Ich bin der AI TONKEEPER Assistant. " +
      "Ich arbeite derzeit im lokalen Modus und kann bei Wallets, Sicherheit, Swap, Einzahlungen, Auszahlungen, Staking und AI Trading helfen."
    );
  }

  if (asksAboutSecurity) {
    return (
      "Security is a priority on AI TONKEEPER. " +
      "Never share your recovery phrase, private key, password, or authentication code."
    );
  }

  if (asksAboutTrading) {
    return (
      "AI Trading is handled by a dedicated and independent trading engine. " +
      "The Assistant can explain trading concepts and available information, but it does not execute trades or modify the trading engine."
    );
  }

  if (asksAboutWallet) {
    return (
      "AI TONKEEPER is designed to provide crypto wallet and asset-management functionality. " +
      "I must never invent real account balances or transaction information."
    );
  }

  if (asksAboutSwap) {
    return (
      "Swap allows one crypto asset to be exchanged for another using the available exchange rate. " +
      "Always review the asset, amount, rate, network and fees before confirming."
    );
  }

  if (asksAboutDeposit) {
    return (
      "For a deposit, use the deposit address provided by AI TONKEEPER for the selected asset and network. " +
      "Always verify the network before sending funds."
    );
  }

  if (asksAboutWithdraw) {
    return (
      "For a withdrawal, carefully verify the destination address, network, asset and amount before confirming. " +
      "Blockchain transactions may be irreversible."
    );
  }

  if (asksAboutStaking) {
    return (
      "Staking generally involves locking or delegating crypto assets to participate in a network or protocol. " +
      "Conditions and risks depend on the specific asset and protocol."
    );
  }

  return (
    "Hello 👋 I'm the AI TONKEEPER Assistant. " +
    "I'm currently running in local mode. " +
    "I can help explain wallets, security, Swap, deposits, withdrawals, staking and AI Trading. " +
    "An external AI provider can be connected later."
  );
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<AssistantResponse>> {
  try {
    /*
     * ----------------------------------------------------------
     * READ REQUEST
     * ----------------------------------------------------------
     */

    const body =
      (await request.json()) as AssistantRequest;

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a message.",
        },
        { status: 400 }
      );
    }

    /*
     * ----------------------------------------------------------
     * SANITIZE CONVERSATION
     * ----------------------------------------------------------
     */

    const conversation: ConversationMessage[] =
      Array.isArray(body.conversation)
        ? body.conversation
            .filter(
              (item) =>
                item &&
                (item.role === "user" ||
                  item.role === "assistant") &&
                typeof item.content === "string" &&
                item.content.trim().length > 0
            )
            .slice(-20)
            .map((item) => ({
              role: item.role,
              content: item.content
                .trim()
                .slice(0, 8000),
            }))
        : [];

    /*
     * Conversation is intentionally accepted and sanitized
     * so the API contract remains compatible with the existing
     * Assistant interface.
     *
     * The local assistant currently generates a response from
     * the latest user message.
     */

    void conversation;

    /*
     * ----------------------------------------------------------
     * LOCAL ASSISTANT RESPONSE
     * ----------------------------------------------------------
     */

    const reply = getLocalReply(message);

    return NextResponse.json(
      {
        success: true,
        reply,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "AI ASSISTANT API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to process the Assistant request right now.",
      },
      { status: 500 }
    );
  }
}