import { prisma } from "@/lib/prisma";
import type { Coin } from "@prisma/client";

import {
  runAITradingEngine,
  type MarketSnapshot,
} from "./engine";

import { executeAITrade } from "./executor";

/*
|--------------------------------------------------------------------------
| SUPPORTED COINS
|--------------------------------------------------------------------------
|
| Les trades AI réels utilisent actuellement :
|
| BTC/USDT
| ETH/USDT
| BNB/USDT
|
| TON et USDT ne sont pas exécutés par ce runner.
|
*/

const SUPPORTED_COINS: Coin[] = [
  "BTC",
  "ETH",
  "BNB",
];

type RunnerResult = {
  success: boolean;
  processed: number;
  executed: number;
  skipped: number;
  errors: number;

  results: Array<{
    userId: string;
    coin: Coin;
    signal?: string;
    confidence?: number;
    executed: boolean;
    simulated?: boolean;
    tradeId?: string;
    message?: string;
  }>;
};

/*
|--------------------------------------------------------------------------
| MARKET SNAPSHOT
|--------------------------------------------------------------------------
|
| Récupère les données de marché depuis l'API interne.
|
*/

async function getMarketSnapshot(
  coin: Coin
): Promise<MarketSnapshot | null> {
  try {
    if (!SUPPORTED_COINS.includes(coin)) {
      return null;
    }

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      process.env.APP_URL ||
      "http://localhost:3000";

    const response = await fetch(
      `${baseUrl}/api/crypto?coin=${encodeURIComponent(
        coin
      )}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(
        `AI RUNNER: market API returned HTTP ${response.status} for ${coin}.`
      );

      return null;
    }

    let data: {
      success?: boolean;
      price?: number | string;
      change24h?: number | string;
      change24hPercent?: number | string;
      message?: string;
    };

    try {
      data =
        (await response.json()) as typeof data;
    } catch {
      console.error(
        `AI RUNNER: invalid market API response for ${coin}.`
      );

      return null;
    }

    const price = Number(
      data.price ?? 0
    );

    const change24h = Number(
      data.change24h ??
        data.change24hPercent ??
        0
    );

    if (
      !Number.isFinite(price) ||
      price <= 0
    ) {
      console.error(
        `AI RUNNER: invalid market price for ${coin}.`
      );

      return null;
    }

    return {
      coin,
      price,
      change24h:
        Number.isFinite(change24h)
          ? change24h
          : 0,
    };
  } catch (error) {
    console.error(
      `AI RUNNER MARKET ERROR (${coin}):`,
      error
    );

    return null;
  }
}

/*
|--------------------------------------------------------------------------
| CHECK OPEN TRADE
|--------------------------------------------------------------------------
|
| Empêche plusieurs BUY/SELL simultanés sur le même
| utilisateur et le même coin.
|
*/

async function hasOpenTrade(
  userId: string,
  coin: Coin
): Promise<boolean> {
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

  return Boolean(existingTrade);
}

/*
|--------------------------------------------------------------------------
| DAILY LOSS PROTECTION
|--------------------------------------------------------------------------
|
| IMPORTANT :
|
| Le schema Prisma actuel ne contient PAS :
|
| dailyLossLimit
|
| Donc on ne l'utilise pas ici.
|
| La protection disponible dans ton schema est :
|
| dailyLossProtection
|
| Si elle est activée, on bloque les nouveaux trades lorsqu'une
| perte nette est constatée aujourd'hui.
|
*/

async function isDailyLossProtectionTriggered(
  userId: string,
  enabled: boolean
): Promise<boolean> {
  if (!enabled) {
    return false;
  }

  const startOfDay = new Date();

  startOfDay.setHours(
    0,
    0,
    0,
    0
  );

  const trades =
    await prisma.aITrade.findMany({
      where: {
        userId,
        status: "CLOSED",
        closedAt: {
          gte: startOfDay,
        },
      },
      select: {
        profit: true,
      },
    });

  let totalProfit = 0;

  for (const trade of trades) {
    const profit = Number(
      trade.profit ?? 0
    );

    if (Number.isFinite(profit)) {
      totalProfit += profit;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Protection
  |--------------------------------------------------------------------------
  |
  | Une perte nette aujourd'hui bloque le cycle.
  |
  | Aucun champ supplémentaire n'est nécessaire dans Prisma.
  |
  */

  return totalProfit < 0;
}

/*
|--------------------------------------------------------------------------
| CALCUL TRADE AMOUNT
|--------------------------------------------------------------------------
|
| BUY:
|   availableBalance = solde USDT interne du client.
|
| SELL:
|   availableBalance = solde crypto interne du client.
|
*/

function calculateTradeAmount(
  availableBalance: number,
  allocationPercent: number
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
      allocationPercent
    ) ||
    allocationPercent <= 0
  ) {
    return 0;
  }

  const safeAllocation =
    Math.min(
      Math.max(
        allocationPercent,
        0
      ),
      100
    );

  const amount =
    availableBalance *
    (safeAllocation / 100);

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return 0;
  }

  return amount;
}

/*
|--------------------------------------------------------------------------
| AI TRADING CYCLE
|--------------------------------------------------------------------------
|
| Cette fonction est appelée par ton système AI.
|
| Elle :
|
| 1. récupère les utilisateurs ayant activé AI Trading
| 2. vérifie les protections
| 3. récupère le marché
| 4. demande une décision à l'AI engine
| 5. vérifie le solde interne du client
| 6. calcule l'allocation
| 7. envoie l'ordre réel à executor.ts
|
*/

export async function runAITradingCycle(): Promise<RunnerResult> {
  const result: RunnerResult = {
    success: true,
    processed: 0,
    executed: 0,
    skipped: 0,
    errors: 0,
    results: [],
  };

  try {
    /*
    |--------------------------------------------------------------------------
    | LOAD USERS
    |--------------------------------------------------------------------------
    |
    | Seuls les clients ayant activé AI Trading sont récupérés.
    |
    */

    const users =
      await prisma.user.findMany({
        where: {
          accountLocked: false,

          aiTradeSettings: {
            is: {
              enabled: true,
            },
          },
        },

        select: {
          id: true,

          aiTradeSettings: true,
        },
      });

    /*
    |--------------------------------------------------------------------------
    | PROCESS EACH USER
    |--------------------------------------------------------------------------
    */

    for (const user of users) {
      const settings =
        user.aiTradeSettings;

      if (!settings) {
        continue;
      }

      /*
      |--------------------------------------------------------------------------
      | SAFETY CHECK
      |--------------------------------------------------------------------------
      */

      if (!settings.enabled) {
        continue;
      }

      /*
      |--------------------------------------------------------------------------
      | EMERGENCY STOP
      |--------------------------------------------------------------------------
      */

      if (settings.emergencyStop) {
        for (const coin of SUPPORTED_COINS) {
          result.processed++;
          result.skipped++;

          result.results.push({
            userId: user.id,
            coin,
            executed: false,
            message:
              "AI Trading emergency stop is enabled.",
          });
        }

        continue;
      }

      /*
      |--------------------------------------------------------------------------
      | DAILY LOSS PROTECTION
      |--------------------------------------------------------------------------
      */

      let dailyLossTriggered =
        false;

      try {
        dailyLossTriggered =
          await isDailyLossProtectionTriggered(
            user.id,
            settings.dailyLossProtection
          );
      } catch (error) {
        console.error(
          `AI RUNNER DAILY LOSS ERROR (${user.id}):`,
          error
        );

        result.errors++;

        continue;
      }

      if (dailyLossTriggered) {
        for (const coin of SUPPORTED_COINS) {
          result.processed++;
          result.skipped++;

          result.results.push({
            userId: user.id,
            coin,
            executed: false,
            message:
              "Daily loss protection blocked AI trading for today.",
          });
        }

        continue;
      }

      /*
      |--------------------------------------------------------------------------
      | PROCESS COINS
      |--------------------------------------------------------------------------
      */

      for (const coin of SUPPORTED_COINS) {
        result.processed++;

        /*
        |--------------------------------------------------------------------------
        | OPEN TRADE PROTECTION
        |--------------------------------------------------------------------------
        */

        let openTrade = false;

        try {
          openTrade =
            await hasOpenTrade(
              user.id,
              coin
            );
        } catch (error) {
          console.error(
            `AI RUNNER OPEN TRADE ERROR (${user.id}/${coin}):`,
            error
          );

          result.errors++;

          result.results.push({
            userId: user.id,
            coin,
            executed: false,
            message:
              "Unable to verify existing AI trade.",
          });

          continue;
        }

        if (openTrade) {
          result.skipped++;

          result.results.push({
            userId: user.id,
            coin,
            executed: false,
            message:
              "An AI trade is already open for this asset.",
          });

          continue;
        }

        /*
        |--------------------------------------------------------------------------
        | MARKET
        |--------------------------------------------------------------------------
        */

        const market =
          await getMarketSnapshot(
            coin
          );

        if (!market) {
          result.errors++;

          result.results.push({
            userId: user.id,
            coin,
            executed: false,
            message:
              "Market data unavailable.",
          });

          continue;
        }

        /*
        |--------------------------------------------------------------------------
        | AI ENGINE
        |--------------------------------------------------------------------------
        */

        const engineResult =
          await runAITradingEngine(
            user.id,
            market
          );

        if (
          !engineResult.success ||
          !engineResult.decision
        ) {
          result.skipped++;

          result.results.push({
            userId: user.id,
            coin,
            executed: false,
            message:
              engineResult.message ??
              "AI decision unavailable.",
          });

          continue;
        }

        const decision =
          engineResult.decision;

        /*
        |--------------------------------------------------------------------------
        | WAIT / BLOCKED
        |--------------------------------------------------------------------------
        */

        if (
          !decision.allowed ||
          decision.signal === "WAIT"
        ) {
          result.skipped++;

          result.results.push({
            userId: user.id,
            coin,
            signal:
              decision.signal,
            confidence:
              decision.confidence,
            executed: false,
            message:
              decision.reason,
          });

          continue;
        }

        /*
        |--------------------------------------------------------------------------
        | BALANCE USED BY THE TRADE
        |--------------------------------------------------------------------------
        |
        | BUY:
        |   USDT
        |
        | SELL:
        |   BTC / ETH / BNB
        |
        */

        const balanceCoin: Coin =
          decision.signal === "BUY"
            ? "USDT"
            : coin;

        /*
        |--------------------------------------------------------------------------
        | INTERNAL CLIENT BALANCE
        |--------------------------------------------------------------------------
        |
        | Le solde interne représente la part appartenant
        | au client dans AI TONKEEPER.
        |
        */

        const balance =
          await prisma.balance.findUnique({
            where: {
              userId_coin: {
                userId: user.id,
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
          result.skipped++;

          result.results.push({
            userId: user.id,
            coin,
            signal:
              decision.signal,
            confidence:
              decision.confidence,
            executed: false,
            message:
              `No available ${balanceCoin} balance for this client.`,
          });

          continue;
        }

        /*
        |--------------------------------------------------------------------------
        | MAXIMUM ALLOCATION
        |--------------------------------------------------------------------------
        */

        const allocation =
          Number(
            settings.maximumTradeAllocation
          );

        if (
          !Number.isFinite(allocation) ||
          allocation <= 0
        ) {
          result.skipped++;

          result.results.push({
            userId: user.id,
            coin,
            signal:
              decision.signal,
            confidence:
              decision.confidence,
            executed: false,
            message:
              "AI trade allocation is set to 0%.",
          });

          continue;
        }

        /*
        |--------------------------------------------------------------------------
        | TRADE AMOUNT
        |--------------------------------------------------------------------------
        */

        const amount =
          calculateTradeAmount(
            availableBalance,
            allocation
          );

        if (
          !Number.isFinite(amount) ||
          amount <= 0
        ) {
          result.skipped++;

          result.results.push({
            userId: user.id,
            coin,
            signal:
              decision.signal,
            confidence:
              decision.confidence,
            executed: false,
            message:
              "Calculated AI trade amount is invalid.",
          });

          continue;
        }

        /*
        |--------------------------------------------------------------------------
        | REAL EXECUTION
        |--------------------------------------------------------------------------
        |
        | executor.ts effectue ensuite les protections finales
        | et envoie l'ordre réel au compte Bybit.
        |
        */

        const execution =
          await executeAITrade({
            userId: user.id,

            coin,

            side:
              decision.signal ===
              "SELL"
                ? "SELL"
                : "BUY",

            amount,

            price:
              decision.price,

            confidence:
              decision.confidence,
          });

        /*
        |--------------------------------------------------------------------------
        | EXECUTION SUCCESS
        |--------------------------------------------------------------------------
        */

        if (execution.success) {
          result.executed++;

          result.results.push({
            userId: user.id,

            coin,

            signal:
              decision.signal,

            confidence:
              decision.confidence,

            executed: true,

            simulated:
              execution.simulated,

            tradeId:
              execution.tradeId,

            message:
              execution.message,
          });

          continue;
        }

        /*
        |--------------------------------------------------------------------------
        | EXECUTION FAILED
        |--------------------------------------------------------------------------
        */

        result.errors++;

        result.results.push({
          userId: user.id,

          coin,

          signal:
            decision.signal,

          confidence:
            decision.confidence,

          executed: false,

          simulated:
            execution.simulated,

          message:
            execution.message,
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | FINAL RESULT
    |--------------------------------------------------------------------------
    */

    return result;
  } catch (error) {
    console.error(
      "AI TRADING RUNNER ERROR:",
      error
    );

    return {
      ...result,

      success: false,

      errors:
        result.errors + 1,
    };
  }
}