import { prisma } from "@/lib/prisma";
import type { Coin } from "@prisma/client";

import {
  runAITradingEngine,
  type MarketSnapshot,
} from "./engine";

import { executeAITrade } from "./executor";

/*
|--------------------------------------------------------------------------
| AI TONKEEPER — AI TRADING RUNNER
|--------------------------------------------------------------------------
|
| AI Trading réel :
|
| BTC/USDT
| ETH/USDT
| BNB/USDT
|
| TON :
| - supporté par AI TONKEEPER
| - peut exister dans les balances
| - n'est PAS exécuté par le moteur Bybit AI Trading
|
| USDT :
| - monnaie de cotation
| - utilisée pour les BUY
| - n'est pas un actif AI tradé seul
|
|--------------------------------------------------------------------------
*/

const SUPPORTED_COINS: Coin[] = [
  "BTC",
  "ETH",
  "BNB",
];

type BybitTicker = {
  symbol: string;
  lastPrice: string;
  price24hPcnt?: string;
};

type BybitTickerResponse = {
  retCode: number;
  retMsg: string;
  result?: {
    category?: string;
    list?: BybitTicker[];
  };
};

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
| BYBIT BASE URL
|--------------------------------------------------------------------------
*/

function getBybitBaseUrl(): string {
  return (
    process.env.BYBIT_BASE_URL ||
    "https://api.bybit.com"
  );
}

/*
|--------------------------------------------------------------------------
| BYBIT SYMBOL
|--------------------------------------------------------------------------
*/

function getBybitSymbol(
  coin: Coin
): string | null {
  switch (coin) {
    case "BTC":
      return "BTCUSDT";

    case "ETH":
      return "ETHUSDT";

    case "BNB":
      return "BNBUSDT";

    default:
      return null;
  }
}

/*
|--------------------------------------------------------------------------
| GET BYBIT MARKET SNAPSHOT
|--------------------------------------------------------------------------
|
| Une seule requête Bybit pour récupérer les trois actifs.
|
*/

async function getMarketSnapshots(): Promise<
  Partial<Record<Coin, MarketSnapshot>>
> {
  try {
    const baseUrl =
      getBybitBaseUrl();

    const response =
      await fetch(
        `${baseUrl}/v5/market/tickers?category=spot`,
        {
          method: "GET",

          cache: "no-store",

          headers: {
            Accept:
              "application/json",
          },
        }
      );

    if (!response.ok) {
      console.error(
        `AI RUNNER: Bybit returned HTTP ${response.status}.`
      );

      return {};
    }

    const data =
      (await response.json()) as BybitTickerResponse;

    if (
      data.retCode !== 0
    ) {
      console.error(
        "AI RUNNER: Bybit market error:",
        data.retCode,
        data.retMsg
      );

      return {};
    }

    const list =
      data.result?.list ?? [];

    const snapshots: Partial<
      Record<Coin, MarketSnapshot>
    > = {};

    for (const coin of SUPPORTED_COINS) {
      const symbol =
        getBybitSymbol(coin);

      if (!symbol) {
        continue;
      }

      const ticker =
        list.find(
          (item) =>
            item.symbol ===
            symbol
        );

      if (!ticker) {
        continue;
      }

      const price =
        Number(
          ticker.lastPrice
        );

      /*
      |--------------------------------------------------------------------------
      | Bybit price24hPcnt
      |--------------------------------------------------------------------------
      |
      | Exemple :
      | "0.0125" = +1.25%
      |
      */

      const change24h =
        Number(
          ticker.price24hPcnt ??
            0
        ) * 100;

      if (
        !Number.isFinite(price) ||
        price <= 0
      ) {
        continue;
      }

      snapshots[coin] = {
        coin,

        price,

        change24h:
          Number.isFinite(
            change24h
          )
            ? change24h
            : 0,
      };
    }

    return snapshots;
  } catch (error) {
    console.error(
      "AI RUNNER MARKET ERROR:",
      error
    );

    return {};
  }
}

/*
|--------------------------------------------------------------------------
| CHECK OPEN TRADE
|--------------------------------------------------------------------------
|
| Empêche plusieurs positions ouvertes
| sur le même utilisateur / même coin.
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

  return Boolean(
    existingTrade
  );
}

/*
|--------------------------------------------------------------------------
| DAILY LOSS PROTECTION
|--------------------------------------------------------------------------
*/

async function isDailyLossProtectionTriggered(
  userId: string,
  enabled: boolean
): Promise<boolean> {
  if (!enabled) {
    return false;
  }

  const startOfDay =
    new Date();

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
    const profit =
      Number(
        trade.profit ?? 0
      );

    if (
      Number.isFinite(
        profit
      )
    ) {
      totalProfit +=
        profit;
    }
  }

  return (
    totalProfit < 0
  );
}

/*
|--------------------------------------------------------------------------
| CALCULATE TRADE AMOUNT
|--------------------------------------------------------------------------
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
    (safeAllocation /
      100);

  if (
    !Number.isFinite(
      amount
    ) ||
    amount <= 0
  ) {
    return 0;
  }

  return amount;
}

/*
|--------------------------------------------------------------------------
| RUN AI TRADING CYCLE
|--------------------------------------------------------------------------
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
    | LOAD ACTIVE USERS
    |--------------------------------------------------------------------------
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
    | NO ACTIVE USERS
    |--------------------------------------------------------------------------
    */

    if (
      users.length === 0
    ) {
      return result;
    }

    /*
    |--------------------------------------------------------------------------
    | GET MARKET DATA ONCE
    |--------------------------------------------------------------------------
    |
    | IMPORTANT :
    |
    | On ne fait PAS une requête /api/crypto par coin
    | et par utilisateur.
    |
    | Une seule requête Bybit alimente tout le cycle.
    |
    */

    const marketSnapshots =
      await getMarketSnapshots();

    /*
    |--------------------------------------------------------------------------
    | PROCESS USERS
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
      | EMERGENCY STOP
      |--------------------------------------------------------------------------
      */

      if (
        settings.emergencyStop
      ) {
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

      if (
        dailyLossTriggered
      ) {
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
      | PROCESS BTC / ETH / BNB
      |--------------------------------------------------------------------------
      */

      for (const coin of SUPPORTED_COINS) {
        result.processed++;

        /*
        |--------------------------------------------------------------------------
        | MARKET SNAPSHOT
        |--------------------------------------------------------------------------
        */

        const market =
          marketSnapshots[
            coin
          ];

        if (!market) {
          result.errors++;

          result.results.push({
            userId: user.id,

            coin,

            executed: false,

            message:
              `Market data unavailable for ${coin}.`,
          });

          continue;
        }

        /*
        |--------------------------------------------------------------------------
        | OPEN POSITION CHECK
        |--------------------------------------------------------------------------
        */

        let openTrade =
          false;

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
        | AI ENGINE
        |--------------------------------------------------------------------------
        */

        let engineResult;

        try {
          engineResult =
            await runAITradingEngine(
              user.id,

              market
            );
        } catch (error) {
          console.error(
            `AI RUNNER ENGINE ERROR (${user.id}/${coin}):`,
            error
          );

          result.errors++;

          result.results.push({
            userId: user.id,

            coin,

            executed: false,

            message:
              "AI engine failed.",
          });

          continue;
        }

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
          decision.signal ===
            "WAIT"
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
        | VALIDATE SIGNAL
        |--------------------------------------------------------------------------
        */

        if (
          decision.signal !==
            "BUY" &&
          decision.signal !==
            "SELL"
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
              "Unsupported AI trading signal.",
          });

          continue;
        }

        /*
        |--------------------------------------------------------------------------
        | BALANCE COIN
        |--------------------------------------------------------------------------
        |
        | BUY  -> USDT
        | SELL -> BTC / ETH / BNB
        |
        */

        const balanceCoin: Coin =
          decision.signal ===
          "BUY"
            ? "USDT"
            : coin;

        /*
        |--------------------------------------------------------------------------
        | CLIENT INTERNAL BALANCE
        |--------------------------------------------------------------------------
        */

        const balance =
          await prisma.balance.findUnique({
            where: {
              userId_coin: {
                userId:
                  user.id,

                coin:
                  balanceCoin,
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
        | ALLOCATION
        |--------------------------------------------------------------------------
        */

        const allocation =
          Number(
            settings.maximumTradeAllocation
          );

        if (
          !Number.isFinite(
            allocation
          ) ||
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
          !Number.isFinite(
            amount
          ) ||
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
        | FINAL EXECUTION
        |--------------------------------------------------------------------------
        |
        | executor.ts est responsable de :
        |
        | - Bybit
        | - API keys
        | - signature
        | - vérifications finales
        | - création de la position
        |
        */

        let execution;

        try {
          execution =
            await executeAITrade({
              userId:
                user.id,

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
        } catch (error) {
          console.error(
            `AI RUNNER EXECUTION ERROR (${user.id}/${coin}):`,
            error
          );

          result.errors++;

          result.results.push({
            userId:
              user.id,

            coin,

            signal:
              decision.signal,

            confidence:
              decision.confidence,

            executed: false,

            message:
              "AI trade execution failed.",
          });

          continue;
        }

        /*
        |--------------------------------------------------------------------------
        | SUCCESS
        |--------------------------------------------------------------------------
        */

        if (
          execution.success
        ) {
          result.executed++;

          result.results.push({
            userId:
              user.id,

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
        | FAILURE
        |--------------------------------------------------------------------------
        */

        result.errors++;

        result.results.push({
          userId:
            user.id,

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
    | RETURN
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