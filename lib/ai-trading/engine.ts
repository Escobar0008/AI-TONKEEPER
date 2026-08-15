import { prisma } from "@/lib/prisma";
import type {
  AITradeSignal,
  AITradeStrategy,
  AIRiskLevel,
  Coin,
} from "@prisma/client";

/*
|--------------------------------------------------------------------------
| MARKET SNAPSHOT
|--------------------------------------------------------------------------
|
| Les données arrivent depuis notre couche marché.
|
| La source actuelle est CoinGecko via:
|
| /api/crypto
|
| Ce moteur ne contacte directement aucun exchange.
|
|--------------------------------------------------------------------------
*/

export type MarketSnapshot = {
  coin: Coin;
  price: number;
  change24h: number;
};

/*
|--------------------------------------------------------------------------
| AI DECISION
|--------------------------------------------------------------------------
*/

export type AIEngineDecision = {
  signal: AITradeSignal;
  confidence: number;
  reason: string;
  price: number;
  coin: Coin;
  pair: string;
  allowed: boolean;
};

/*
|--------------------------------------------------------------------------
| ENGINE RESULT
|--------------------------------------------------------------------------
*/

export type EngineResult = {
  success: boolean;
  decision?: AIEngineDecision;
  message?: string;
};

/*
|--------------------------------------------------------------------------
| SUPPORTED AI COINS
|--------------------------------------------------------------------------
|
| AI Spot Trading utilise actuellement:
|
| BTC/USDT
| ETH/USDT
| BNB/USDT
|
| Aucun ordre réel n'est exécuté.
|
|--------------------------------------------------------------------------
*/

const SUPPORTED_AI_COINS: Coin[] = [
  "BTC",
  "ETH",
  "BNB",
];

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.min(
    Math.max(value, min),
    max
  );
}

function isSupportedCoin(
  coin: Coin
): boolean {
  return SUPPORTED_AI_COINS.includes(
    coin
  );
}

/*
|--------------------------------------------------------------------------
| CONFIDENCE
|--------------------------------------------------------------------------
|
| La confiance est calculée à partir:
|
| - du mouvement 24h
| - de la stratégie choisie
|
|--------------------------------------------------------------------------
*/

function calculateConfidence(
  change24h: number,
  strategy: AITradeStrategy
): number {
  const absoluteChange =
    Math.abs(change24h);

  let confidence = 50;

  if (absoluteChange >= 10) {
    confidence += 25;
  } else if (absoluteChange >= 7) {
    confidence += 20;
  } else if (absoluteChange >= 5) {
    confidence += 18;
  } else if (absoluteChange >= 3) {
    confidence += 12;
  } else if (absoluteChange >= 2) {
    confidence += 10;
  } else if (absoluteChange >= 1) {
    confidence += 5;
  }

  switch (strategy) {
    case "CONSERVATIVE":
      confidence -= 10;
      break;

    case "AGGRESSIVE":
      confidence += 10;
      break;

    case "BALANCED":
    default:
      break;
  }

  return clamp(
    confidence,
    0,
    100
  );
}

/*
|--------------------------------------------------------------------------
| SIGNAL
|--------------------------------------------------------------------------
|
| Mouvement positif important:
| BUY
|
| Mouvement négatif important:
| SELL
|
| Marché faible:
| WAIT
|
|--------------------------------------------------------------------------
*/

function calculateSignal(
  change24h: number
): AITradeSignal {
  if (change24h >= 5) {
    return "BUY";
  }

  if (change24h <= -5) {
    return "SELL";
  }

  return "WAIT";
}

/*
|--------------------------------------------------------------------------
| RISK CHECK
|--------------------------------------------------------------------------
*/

function isRiskAllowed(
  riskLevel: AIRiskLevel,
  confidence: number,
  minimumConfidence: number
): boolean {
  if (
    !Number.isFinite(
      minimumConfidence
    )
  ) {
    return false;
  }

  if (
    minimumConfidence < 0 ||
    minimumConfidence > 100
  ) {
    return false;
  }

  if (
    confidence <
    minimumConfidence
  ) {
    return false;
  }

  switch (riskLevel) {
    case "LOW":
      return confidence >= 85;

    case "MEDIUM":
      return confidence >= 75;

    case "HIGH":
      return confidence >= 65;

    default:
      return false;
  }
}

/*
|--------------------------------------------------------------------------
| SAVE DECISION
|--------------------------------------------------------------------------
*/

async function saveDecision(
  userId: string,
  settingsId: string,
  market: MarketSnapshot,
  signal: AITradeSignal,
  confidence: number,
  reason: string
) {
  return prisma.aITradeDecision.create({
    data: {
      userId,
      settingsId,

      coin: market.coin,

      pair: `${market.coin}/USDT`,

      signal,

      confidence,

      price: market.price,

      reason,

      executed: false,
    },
  });
}

/*
|--------------------------------------------------------------------------
| BUILD DECISION
|--------------------------------------------------------------------------
*/

function buildDecision(
  market: MarketSnapshot,
  signal: AITradeSignal,
  confidence: number,
  reason: string,
  allowed: boolean
): AIEngineDecision {
  return {
    signal,

    confidence,

    reason,

    price: market.price,

    coin: market.coin,

    pair: `${market.coin}/USDT`,

    allowed,
  };
}

/*
|--------------------------------------------------------------------------
| MAIN AI ENGINE
|--------------------------------------------------------------------------
|
| RESPONSABILITÉS:
|
| 1. Vérifier l'utilisateur
| 2. Vérifier les paramètres AI
| 3. Vérifier les protections
| 4. Analyser le marché réel
| 5. Produire BUY / SELL / WAIT
| 6. Calculer la confiance
| 7. Enregistrer la décision
|
| IMPORTANT:
|
| Ce fichier ne réalise AUCUNE transaction réelle.
|
|--------------------------------------------------------------------------
*/

export async function runAITradingEngine(
  userId: string,
  market: MarketSnapshot
): Promise<EngineResult> {
  try {
    /*
    |--------------------------------------------------------------------------
    | USER VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!userId) {
      return {
        success: false,
        message:
          "User ID is required.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | LOAD USER
    |--------------------------------------------------------------------------
    */

    const user =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },

        select: {
          id: true,
          accountLocked: true,
        },
      });

    if (!user) {
      return {
        success: false,
        message:
          "User not found.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | ACCOUNT LOCK
    |--------------------------------------------------------------------------
    */

    if (user.accountLocked) {
      return {
        success: false,
        message:
          "User account is locked.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | MARKET VALIDATION
    |--------------------------------------------------------------------------
    */

    if (
      !Number.isFinite(
        market.price
      ) ||
      market.price <= 0
    ) {
      return {
        success: false,
        message:
          "Invalid market price.",
      };
    }

    if (
      !Number.isFinite(
        market.change24h
      )
    ) {
      return {
        success: false,
        message:
          "Invalid 24h market change.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | COIN VALIDATION
    |--------------------------------------------------------------------------
    */

    if (
      !isSupportedCoin(
        market.coin
      )
    ) {
      return {
        success: false,
        message:
          `${market.coin} is not supported by AI Spot Trading.`,
      };
    }

    /*
    |--------------------------------------------------------------------------
    | LOAD AI SETTINGS
    |--------------------------------------------------------------------------
    */

    const settings =
      await prisma.aITradeSettings.findUnique(
        {
          where: {
            userId,
          },
        }
      );

    if (!settings) {
      return {
        success: false,
        message:
          "AI Trading settings not found.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | AI ENABLED
    |--------------------------------------------------------------------------
    */

    if (!settings.enabled) {
      return {
        success: false,
        message:
          "AI Trading is not enabled by the client.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | EMERGENCY STOP
    |--------------------------------------------------------------------------
    */

    if (
      settings.emergencyStop
    ) {
      return {
        success: false,
        message:
          "AI Trading emergency stop is active.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | MINIMUM CONFIDENCE
    |--------------------------------------------------------------------------
    */

    const minimumConfidence =
      Number(
        settings.minimumConfidence
      );

    if (
      !Number.isFinite(
        minimumConfidence
      ) ||
      minimumConfidence < 0 ||
      minimumConfidence > 100
    ) {
      return {
        success: false,
        message:
          "AI minimum confidence setting is invalid.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | MAXIMUM ALLOCATION
    |--------------------------------------------------------------------------
    |
    | L'allocation est vérifiée ici.
    |
    | Le calcul du montant est effectué
    | séparément par le runner/exécution
    | du paper trading.
    |
    |--------------------------------------------------------------------------
    */

    const maximumAllocation =
      Number(
        settings.maximumTradeAllocation
      );

    if (
      !Number.isFinite(
        maximumAllocation
      ) ||
      maximumAllocation < 0 ||
      maximumAllocation > 100
    ) {
      return {
        success: false,
        message:
          "AI maximum trade allocation setting is invalid.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | CALCULATE SIGNAL
    |--------------------------------------------------------------------------
    */

    const signal =
      calculateSignal(
        market.change24h
      );

    /*
    |--------------------------------------------------------------------------
    | CALCULATE CONFIDENCE
    |--------------------------------------------------------------------------
    */

    const confidence =
      calculateConfidence(
        market.change24h,
        settings.strategy
      );

    /*
    |--------------------------------------------------------------------------
    | WAIT
    |--------------------------------------------------------------------------
    */

    if (
      signal === "WAIT"
    ) {
      const reason =
        `Market movement is ${market.change24h.toFixed(
          2
        )}% over 24h. Conditions are not strong enough for a paper trade. AI is waiting.`;

      await saveDecision(
        userId,
        settings.id,
        market,
        "WAIT",
        confidence,
        reason
      );

      return {
        success: true,

        decision:
          buildDecision(
            market,
            "WAIT",
            confidence,
            reason,
            false
          ),
      };
    }

    /*
    |--------------------------------------------------------------------------
    | RISK CHECK
    |--------------------------------------------------------------------------
    */

    const riskAllowed =
      isRiskAllowed(
        settings.riskLevel,
        confidence,
        minimumConfidence
      );

    if (!riskAllowed) {
      const reason =
        `Signal ${signal} detected with ${confidence.toFixed(
          2
        )}% confidence, but the configured risk requirements were not satisfied.`;

      await saveDecision(
        userId,
        settings.id,
        market,
        signal,
        confidence,
        reason
      );

      return {
        success: true,

        decision:
          buildDecision(
            market,
            signal,
            confidence,
            reason,
            false
          ),
      };
    }

    /*
    |--------------------------------------------------------------------------
    | BUILD ALLOWED DECISION
    |--------------------------------------------------------------------------
    */

    let reason =
      `AI detected a ${signal} signal for ${market.coin}/USDT with ${confidence.toFixed(
        2
      )}% confidence based on the current market snapshot.`;

    /*
    |--------------------------------------------------------------------------
    | STOP LOSS INFORMATION
    |--------------------------------------------------------------------------
    */

    if (
      settings.stopLossProtection
    ) {
      reason +=
        " Stop-loss protection is enabled.";
    }

    /*
    |--------------------------------------------------------------------------
    | DAILY LOSS INFORMATION
    |--------------------------------------------------------------------------
    */

    if (
      settings.dailyLossProtection
    ) {
      reason +=
        " Daily-loss protection is enabled.";
    }

    /*
    |--------------------------------------------------------------------------
    | PAPER TRADING INFORMATION
    |--------------------------------------------------------------------------
    */

    reason +=
      " The resulting trade, if executed, is a paper trade only.";

    /*
    |--------------------------------------------------------------------------
    | SAVE ALLOWED DECISION
    |--------------------------------------------------------------------------
    */

    await saveDecision(
      userId,
      settings.id,
      market,
      signal,
      confidence,
      reason
    );

    /*
    |--------------------------------------------------------------------------
    | RETURN DECISION
    |--------------------------------------------------------------------------
    */

    return {
      success: true,

      decision:
        buildDecision(
          market,
          signal,
          confidence,
          reason,
          true
        ),
    };
  } catch (error) {
    /*
    |--------------------------------------------------------------------------
    | ERROR
    |--------------------------------------------------------------------------
    */

    console.error(
      "AI TRADING ENGINE ERROR:",
      error
    );

    return {
      success: false,

      message:
        error instanceof Error
          ? error.message
          : "AI Trading engine error.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| MAXIMUM PAPER TRADE AMOUNT
|--------------------------------------------------------------------------
|
| Exemple:
|
| balance = 1,000
| allocation = 10%
|
| résultat = 100
|
| Cette fonction sert uniquement au calcul
| du montant du paper trade.
|
|--------------------------------------------------------------------------
*/

export function calculateMaximumTradeAmount(
  availableBalance: number,
  maximumTradeAllocation: number
): number {
  if (
    !Number.isFinite(
      availableBalance
    ) ||
    availableBalance <= 0
  ) {
    return 0;
  }

  if (
    !Number.isFinite(
      maximumTradeAllocation
    ) ||
    maximumTradeAllocation <= 0
  ) {
    return 0;
  }

  const allocation =
    clamp(
      maximumTradeAllocation,
      0,
      100
    );

  const amount =
    availableBalance *
    (allocation / 100);

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return 0;
  }

  return amount;
}