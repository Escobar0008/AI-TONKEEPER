import { prisma } from "@/lib/prisma";
import type {
  AITradeSide,
  Coin,
} from "@prisma/client";

/*
|--------------------------------------------------------------------------
| AI TRADE EXECUTOR — SIMULATION ONLY
|--------------------------------------------------------------------------
|
| IMPORTANT
|
| AI TONKEEPER ne passe AUCUN ordre externe.
|
| Il n'y a :
| - aucune API Bybit
| - aucune clé API
| - aucun ordre réel
| - aucun orderId externe
| - aucun orderLinkId externe
|
| Les trades AI sont uniquement enregistrés dans Prisma
| afin de permettre à l'interface de simuler le fonctionnement
| du système de trading.
|
| Les prix utilisés viennent du système de marché CoinGecko.
|
|--------------------------------------------------------------------------
*/

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
  orderId?: null;
  orderLinkId?: null;
};

/*
|--------------------------------------------------------------------------
| SUPPORTED AI COINS
|--------------------------------------------------------------------------
*/

const SUPPORTED_COINS: Coin[] = [
  "BTC",
  "ETH",
  "BNB",
];

/*
|--------------------------------------------------------------------------
| FAILED RESULT
|--------------------------------------------------------------------------
*/

function failed(
  message: string
): ExecuteTradeResult {
  return {
    success: false,
    simulated: true,
    message,
  };
}

/*
|--------------------------------------------------------------------------
| EXECUTE AI TRADE
|--------------------------------------------------------------------------
|
| Cette fonction ne contacte aucun exchange.
|
| Elle :
|
| 1. vérifie l'utilisateur
| 2. vérifie les paramètres AI
| 3. vérifie le solde interne
| 4. vérifie l'allocation maximale
| 5. empêche les trades doublons
| 6. crée un trade SIMULÉ dans Prisma
| 7. marque la décision AI comme exécutée
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
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return failed(
        "Invalid trade amount."
      );
    }

    if (
      !Number.isFinite(price) ||
      price <= 0
    ) {
      return failed(
        "Invalid market price."
      );
    }

    if (
      !Number.isFinite(confidence) ||
      confidence < 0 ||
      confidence > 100
    ) {
      return failed(
        "Invalid confidence."
      );
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
    | LOAD AI SETTINGS
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

    /*
    |--------------------------------------------------------------------------
    | AI MUST BE ENABLED
    |--------------------------------------------------------------------------
    */

    if (!settings.enabled) {
      return failed(
        "AI Trading is not enabled."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | EMERGENCY STOP
    |--------------------------------------------------------------------------
    */

    if (settings.emergencyStop) {
      return failed(
        "AI Trading emergency stop is active."
      );
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
    | MAXIMUM ALLOCATION
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
    | INTERNAL BALANCE
    |--------------------------------------------------------------------------
    |
    | BUY:
    |   allocation basée sur le solde USDT
    |
    | SELL:
    |   allocation basée sur le solde crypto
    |
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

    /*
    |--------------------------------------------------------------------------
    | AMOUNT PROTECTION
    |--------------------------------------------------------------------------
    */

    if (
      amount >
      maximumTradeAmount
    ) {
      return failed(
        "Trade amount exceeds the configured maximum allocation."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | BALANCE PROTECTION
    |--------------------------------------------------------------------------
    */

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
    | PREVENT DUPLICATE OPEN TRADE
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
    | CREATE SIMULATED TRADE
    |--------------------------------------------------------------------------
    |
    | IMPORTANT :
    |
    | Cette création Prisma est la SEULE "exécution".
    |
    | Aucun ordre financier réel n'est envoyé.
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
    | MARK AI DECISION AS EXECUTED
    |--------------------------------------------------------------------------
    */

    const latestDecision =
      await prisma.aITradeDecision.findFirst({
        where: {
          userId,
          settingsId: settings.id,
          coin,
          signal: side,
          executed: false,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
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
    | SUCCESS
    |--------------------------------------------------------------------------
    */

    return {
      success: true,

      /*
       * Toujours true :
       * ce trade est une simulation.
       */
      simulated: true,

      message:
        `AI ${side} simulation opened for ${pair}. No external order was submitted.`,

      tradeId:
        trade.id,

      orderId: null,

      orderLinkId: null,
    };
  } catch (error) {
    console.error(
      "AI TRADE SIMULATOR ERROR:",
      error
    );

    return {
      success: false,
      simulated: true,

      message:
        error instanceof Error
          ? error.message
          : "Unable to process AI trade simulation.",
    };
  }
}