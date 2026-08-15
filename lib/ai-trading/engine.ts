import { prisma } from "@/lib/prisma";
import type {
  AITradeSignal,
  AITradeStrategy,
  AIRiskLevel,
  Coin,
} from "@prisma/client";
export type MarketSnapshot = {
  coin: Coin;
  price: number;
  change24h: number;
};
export type AIEngineDecision = {
  signal: AITradeSignal;
  confidence: number;
  reason: string;
  price: number;
  coin: Coin;
  pair: string;
  allowed: boolean;
};
type EngineResult = {
  success: boolean;
  decision?: AIEngineDecision;
  message?: string;
};
/*
|--------------------------------------------------------------------------
| CONSTANTS
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
| Confidence is based on:
|
| - 24h market movement
| - selected AI strategy
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
  } else if (absoluteChange >= 5) {
    confidence += 18;
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
| Positive movement >= 5%:
| BUY candidate
|
| Negative movement <= -5%:
| SELL candidate
|
| Otherwise:
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
| MAIN AI ENGINE
|--------------------------------------------------------------------------
|
| IMPORTANT
|
| engine.ts DOES NOT send orders to Bybit.
|
| Its job is only:
|
| 1. Verify the user
| 2. Verify AI Trading settings
| 3. Verify protections
| 4. Analyse market data
| 5. Generate BUY / SELL / WAIT
| 6. Calculate confidence
| 7. Save AI decision
|
| The execution layer is handled separately.
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
    | LOAD SETTINGS
    |--------------------------------------------------------------------------
    */
    const settings =
      await prisma.aITradeSettings.findUnique({
        where: {
          userId,
        },
      });
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
    | SETTINGS VALIDATION
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
        "Market conditions are not strong enough. AI is waiting.";
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
        decision: {
          signal: "WAIT",
          confidence,
          reason,
          price: market.price,
          coin: market.coin,
          pair: `${market.coin}/USDT`,
          allowed: false,
        },
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
        `Signal ${signal} detected, but confidence ${confidence.toFixed(
          2
        )}% does not satisfy the configured risk requirements.`;
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
        decision: {
          signal,
          confidence,
          reason,
          price: market.price,
          coin: market.coin,
          pair: `${market.coin}/USDT`,
          allowed: false,
        },
      };
    }
    /*
    |--------------------------------------------------------------------------
    | PROTECTION INFORMATION
    |--------------------------------------------------------------------------
    */
    let reason =
      `AI detected a ${signal} signal with ${confidence.toFixed(
        2
      )}% confidence.`;
    if (
      settings.stopLossProtection
    ) {
      reason +=
        " Stop-loss protection is enabled.";
    }
    if (
      settings.dailyLossProtection
    ) {
      reason +=
        " Daily-loss protection is enabled.";
    }
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
      decision: {
        signal,
        confidence,
        reason,
        price: market.price,
        coin: market.coin,
        pair: `${market.coin}/USDT`,
        allowed: true,
      },
    };
  } catch (error) {
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
| MAXIMUM TRADE ALLOCATION
|--------------------------------------------------------------------------
|
| This function uses the client's internal available balance.
|
| Example:
|
| balance = 1,000
| allocation = 10%
|
| result = 100
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
  return (
    availableBalance *
    (allocation / 100)
  );
}