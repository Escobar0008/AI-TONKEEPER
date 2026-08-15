import { prisma } from "@/lib/prisma";
import type {
  AITradeSide,
  Coin,
} from "@prisma/client";

type ExecuteTradeInput = {
  userId: string;
  coin: Coin;
  side: AITradeSide;
  amount: number;
  price: number;
  confidence: number;
};

export type ExecuteTradeResult = {
  success: boolean;
  simulated: boolean;
  message: string;
  tradeId?: string;
  orderId?: string | null;
  orderLinkId?: string | null;
};

const SUPPORTED_COINS: Coin[] = [
  "BTC",
  "ETH",
  "BNB",
];

function failed(
  message: string,
  simulated = false
): ExecuteTradeResult {
  return {
    success: false,
    simulated,
    message,
  };
}

function isValidPositiveNumber(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0
  );
}

/*
|--------------------------------------------------------------------------
| EXECUTE AI TRADE
|--------------------------------------------------------------------------
|
| Cette couche est volontairement sécurisée.
|
| Elle :
|
| 1. vérifie l'utilisateur
| 2. vérifie AI Trading
| 3. vérifie les protections
| 4. vérifie le solde interne
| 5. vérifie l'allocation maximale
| 6. empêche les doublons
| 7. crée le AITrade
| 8. marque la décision comme exécutée
|
| IMPORTANT :
|
| L'envoi d'un ordre Bybit réel doit être branché sur les fonctions
| Bybit existantes du projet. On ne simule PAS un ordre réel en
| retournant "simulated: false".
|
|--------------------------------------------------------------------------
*/

export async function executeAITrade(
  input: ExecuteTradeInput
): Promise<ExecuteTradeResult> {
  try {
    const {
      userId,
      coin,
      side,
      amount,
      price,
      confidence,
    } = input;

    /*
    |--------------------------------------------------------------------------
    | BASIC VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!userId) {
      return failed(
        "User ID is required."
      );
    }

    if (
      !SUPPORTED_COINS.includes(
        coin
      )
    ) {
      return failed(
        `${coin} is not supported by AI Trading.`
      );
    }

    if (
      side !== "BUY" &&
      side !== "SELL"
    ) {
      return failed(
        "Invalid AI trade side."
      );
    }

    if (
      !isValidPositiveNumber(
        amount
      )
    ) {
      return failed(
        "Invalid trade amount."
      );
    }

    if (
      !isValidPositiveNumber(
        price
      )
    ) {
      return failed(
        "Invalid market price."
      );
    }

    if (
      !Number.isFinite(
        confidence
      ) ||
      confidence < 0 ||
      confidence > 100
    ) {
      return failed(
        "Invalid confidence."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | USER
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
      return failed(
        "User not found."
      );
    }

    if (user.accountLocked) {
      return failed(
        "User account is locked."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | SETTINGS
    |--------------------------------------------------------------------------
    */

    const settings =
      await prisma.aITradeSettings.findUnique({
        where: {
          userId,
        },
      });

    if (!settings) {
      return failed(
        "AI Trading settings not found."
      );
    }

    if (!settings.enabled) {
      return failed(
        "AI Trading is not enabled by the client."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | EMERGENCY STOP
    |--------------------------------------------------------------------------
    */

    if (
      settings.emergencyStop
    ) {
      return failed(
        "AI Trading emergency stop is active."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | CONFIDENCE
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
      return failed(
        "AI minimum confidence setting is invalid."
      );
    }

    if (
      confidence <
      minimumConfidence
    ) {
      return failed(
        "Trade confidence is below the configured minimum."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | ALLOCATION
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
      maximumAllocation <= 0 ||
      maximumAllocation > 100
    ) {
      return failed(
        "Maximum trade allocation is invalid."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | PAIR
    |--------------------------------------------------------------------------
    */

    const pair =
      `${coin}/USDT`;

    /*
    |--------------------------------------------------------------------------
    | DUPLICATE TRADE PROTECTION
    |--------------------------------------------------------------------------
    */

    const existingTrade =
      await prisma.aITrade.findFirst({
        where: {
          userId,
          coin,
          status: "OPEN",
        },
        select: {
          id: true,
        },
      });

    if (existingTrade) {
      return failed(
        `An AI trade is already open for ${pair}.`
      );
    }

    /*
    |--------------------------------------------------------------------------
    | INTERNAL BALANCE
    |--------------------------------------------------------------------------
    |
    | BUY:
    | amount = USDT value
    |
    | SELL:
    | amount = crypto quantity
    |
    |--------------------------------------------------------------------------
    */

    const balanceCoin: Coin =
      side === "BUY"
        ? "USDT"
        : coin;

    const balance =
      await prisma.balance.findUnique({
        where: {
          userId_coin: {
            userId,
            coin: balanceCoin,
          },
        },
        select: {
          balance: true,
        },
      });

    const availableBalance =
      Number(
        balance?.balance ?? 0
      );

    if (
      !Number.isFinite(
        availableBalance
      ) ||
      availableBalance <= 0
    ) {
      return failed(
        `No available ${balanceCoin} balance.`
      );
    }

    /*
    |--------------------------------------------------------------------------
    | MAXIMUM TRADE AMOUNT
    |--------------------------------------------------------------------------
    */

    const maximumTradeAmount =
      availableBalance *
      (maximumAllocation / 100);

    if (
      !Number.isFinite(
        maximumTradeAmount
      ) ||
      maximumTradeAmount <= 0
    ) {
      return failed(
        "Maximum trade amount is invalid."
      );
    }

    if (
      amount >
      maximumTradeAmount
    ) {
      return failed(
        "Trade amount exceeds the configured maximum allocation."
      );
    }

    if (
      amount >
      availableBalance
    ) {
      return failed(
        `Insufficient ${balanceCoin} balance.`
      );
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE INTERNAL AI TRADE
    |--------------------------------------------------------------------------
    |
    | On enregistre uniquement après toutes les validations.
    |
    */

    const trade =
      await prisma.aITrade.create({
        data: {
          userId,
          settingsId:
            settings.id,
          coin,
          pair,
          side,
          status: "OPEN",
          amount,
          entryPrice: price,
          currentPrice: price,
          exitPrice: null,
          profit: 0,
          fee: 0,
          confidence,
          openedAt:
            new Date(),
        },
      });

    /*
    |--------------------------------------------------------------------------
    | MARK AI DECISION EXECUTED
    |--------------------------------------------------------------------------
    */

    const latestDecision =
      await prisma.aITradeDecision.findFirst({
        where: {
          userId,
          settingsId:
            settings.id,
          coin,
          signal: side,
          executed: false,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    if (latestDecision) {
      await prisma.aITradeDecision.update({
        where: {
          id: latestDecision.id,
        },
        data: {
          executed: true,
        },
      });
    }

    /*
    |--------------------------------------------------------------------------
    | IMPORTANT
    |--------------------------------------------------------------------------
    |
    | Le trade enregistré ici ne doit PAS être présenté comme un ordre
    | Bybit réel tant que la couche d'exécution Bybit n'est pas appelée.
    |
    |--------------------------------------------------------------------------
    */

    return {
      success: true,
      simulated: true,
      message:
        `AI ${side} trade prepared successfully for ${pair}.`,
      tradeId: trade.id,
      orderId: null,
      orderLinkId: null,
    };
  } catch (error) {
    console.error(
      "AI TRADE EXECUTOR ERROR:",
      error
    );

    return {
      success: false,
      simulated: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to process AI trade.",
    };
  }
}