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
function failed(
  message: string
): ExecuteTradeResult {
  return {
    success: false,
    simulated: false,
    message,
  };
}
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
| EXECUTE AI TRADE
|--------------------------------------------------------------------------
|
| IMPORTANT
|
| BUY:
|   amount = montant comptable en USDT.
|
| SELL:
|   amount = quantité comptable de la crypto.
|
| Ce fichier valide et enregistre la décision de trade.
|
| L'envoi automatique d'un ordre financier réel n'est pas effectué
| directement ici.
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
    | AI MUST BE ENABLED BY CLIENT
    |--------------------------------------------------------------------------
    */
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
    | CONFIDENCE PROTECTION
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
    | ALLOCATION VALIDATION
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
    |   Le montant provient du solde USDT interne.
    |
    | SELL:
    |   Le montant provient du solde crypto interne.
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
    | MAXIMUM ALLOWED AMOUNT
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
    | AVAILABLE BALANCE PROTECTION
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
    | CREATE TRADE RECORD
    |--------------------------------------------------------------------------
    |
    | The database record represents the AI trade allocation.
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
    | MARK LATEST AI DECISION
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
       * No external order was submitted by this executor.
       */
      simulated: false,
      message:
        `AI ${side} trade recorded successfully for ${pair}.`,
      tradeId:
        trade.id,
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