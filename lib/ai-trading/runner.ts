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
| MODE ACTUEL :
|
| - Prix réels : CoinGecko via /api/crypto
| - Analyse : engine.ts
| - Trading : simulation interne uniquement
| - Base de données : Prisma
| - Aucun exchange externe
| - Aucun ordre réel
|
| Actifs AI :
|
| BTC/USDT
| ETH/USDT
| BNB/USDT
|
|--------------------------------------------------------------------------
*/

const SUPPORTED_COINS: Coin[] = [
  "BTC",
  "ETH",
  "BNB",
];

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

type CryptoApiResponse = {
  success?: boolean;
  coin?: string;
  price?: number | string;
  change24h?: number | string;
  message?: string;
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
| API BASE URL
|--------------------------------------------------------------------------
|
| Le runner s'exécute côté serveur.
|
| On utilise :
|
| NEXTAUTH_URL
| puis APP_URL
| puis localhost en développement.
|
|--------------------------------------------------------------------------
*/

function getAppBaseUrl(): string {
  const configuredUrl =
    process.env.NEXTAUTH_URL ||
    process.env.APP_URL;

  if (configuredUrl) {
    return configuredUrl.replace(
      /\/$/,
      ""
    );
  }

  return "http://localhost:3000";
}

/*
|--------------------------------------------------------------------------
| GET MARKET SNAPSHOTS
|--------------------------------------------------------------------------
|
| Source des prix :
|
| /api/crypto
|
| Cette API utilise CoinGecko.
|
| Le runner ne contacte donc aucun exchange.
|
|--------------------------------------------------------------------------
*/

async function getMarketSnapshots(): Promise<
  Partial<Record<Coin, MarketSnapshot>>
> {
  const snapshots: Partial<
    Record<Coin, MarketSnapshot>
  > = {};

  try {
    const baseUrl =
      getAppBaseUrl();

    /*
    |--------------------------------------------------------------------------
    | RÉCUPÉRATION DES PRIX
    |--------------------------------------------------------------------------
    |
    | Chaque coin est récupéré depuis notre API interne.
    |
    | L'API /api/crypto est elle-même connectée à CoinGecko.
    |
    |--------------------------------------------------------------------------
    */

    await Promise.all(
      SUPPORTED_COINS.map(
        async (coin) => {
          try {
            const response =
              await fetch(
                `${baseUrl}/api/crypto?coin=${encodeURIComponent(
                  coin
                )}`,
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
                `AI RUNNER: market API returned HTTP ${response.status} for ${coin}.`
              );

              return;
            }

            const data =
              (await response.json()) as CryptoApiResponse;

            if (!data.success) {
              console.error(
                `AI RUNNER: market API failed for ${coin}:`,
                data.message
              );

              return;
            }

            const price =
              Number(
                data.price ?? 0
              );

            const change24h =
              Number(
                data.change24h ?? 0
              );

            if (
              !Number.isFinite(
                price
              ) ||
              price <= 0
            ) {
              console.error(
                `AI RUNNER: invalid market price for ${coin}.`
              );

              return;
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
          } catch (error) {
            console.error(
              `AI RUNNER MARKET ERROR (${coin}):`,
              error
            );
          }
        }
      )
    );

    return snapshots;
  } catch (error) {
    console.error(
      "AI RUNNER MARKET SNAPSHOT ERROR:",
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
| Empêche plusieurs positions simulées ouvertes
| pour le même utilisateur et le même coin.
|
|--------------------------------------------------------------------------
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
|
| L'allocation est calculée à partir du solde
| interne du client.
|
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
    (safeAllocation / 100);

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
|
| Cycle complet :
|
| 1. utilisateurs AI actifs
| 2. prix CoinGecko
| 3. protections
| 4. moteur AI
| 5. solde interne
| 6. allocation
| 7. simulation du trade
|
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
    | GET REAL MARKET DATA
    |--------------------------------------------------------------------------
    |
    | Une seule phase de récupération pour le cycle.
    |
    | Source : CoinGecko via /api/crypto.
    |
    |--------------------------------------------------------------------------
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
            userId:
              user.id,

            coin,

            executed: false,

            simulated: true,

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
            userId:
              user.id,

            coin,

            executed: false,

            simulated: true,

            message:
              "Daily loss protection blocked AI trading for today.",
          });
        }

        continue;
      }

      /*
      |--------------------------------------------------------------------------
      | PROCESS EACH COIN
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
            userId:
              user.id,

            coin,

            executed: false,

            simulated: true,

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
            userId:
              user.id,

            coin,

            executed: false,

            simulated: true,

            message:
              "Unable to verify existing AI trade.",
          });

          continue;
        }

        if (openTrade) {
          result.skipped++;

          result.results.push({
            userId:
              user.id,

            coin,

            executed: false,

            simulated: true,

            message:
              "An AI simulation is already open for this asset.",
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
            userId:
              user.id,

            coin,

            executed: false,

            simulated: true,

            message:
              "AI engine failed.",
          });

          continue;
        }

        /*
        |--------------------------------------------------------------------------
        | ENGINE FAILURE
        |--------------------------------------------------------------------------
        */

        if (
          !engineResult.success ||
          !engineResult.decision
        ) {
          result.skipped++;

          result.results.push({
            userId:
              user.id,

            coin,

            executed: false,

            simulated: true,

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
            userId:
              user.id,

            coin,

            signal:
              decision.signal,

            confidence:
              decision.confidence,

            executed: false,

            simulated: true,

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
            userId:
              user.id,

            coin,

            signal:
              decision.signal,

            confidence:
              decision.confidence,

            executed: false,

            simulated: true,

            message:
              "Unsupported AI trading signal.",
          });

          continue;
        }

        /*
        |--------------------------------------------------------------------------
        | BALANCE
        |--------------------------------------------------------------------------
        |
        | BUY  -> USDT
        | SELL -> crypto correspondante
        |
        |--------------------------------------------------------------------------
        */

        const balanceCoin: Coin =
          decision.signal ===
          "BUY"
            ? "USDT"
            : coin;

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
            userId:
              user.id,

            coin,

            signal:
              decision.signal,

            confidence:
              decision.confidence,

            executed: false,

            simulated: true,

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
          !Number.isFinite(
            allocation
          ) ||
          allocation <= 0
        ) {
          result.skipped++;

          result.results.push({
            userId:
              user.id,

            coin,

            signal:
              decision.signal,

            confidence:
              decision.confidence,

            executed: false,

            simulated: true,

            message:
              "AI trade allocation is set to 0%.",
          });

          continue;
        }

        /*
        |--------------------------------------------------------------------------
        | CALCULATE AMOUNT
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
            userId:
              user.id,

            coin,

            signal:
              decision.signal,

            confidence:
              decision.confidence,

            executed: false,

            simulated: true,

            message:
              "Calculated AI trade amount is invalid.",
          });

          continue;
        }

        /*
        |--------------------------------------------------------------------------
        | SIMULATED EXECUTION
        |--------------------------------------------------------------------------
        |
        | executor.ts ne contacte aucun service externe.
        |
        | Il crée uniquement une position simulée
        | dans Prisma.
        |
        |--------------------------------------------------------------------------
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
            `AI RUNNER SIMULATION ERROR (${user.id}/${coin}):`,
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

            simulated: true,

            message:
              "AI trade simulation failed.",
          });

          continue;
        }

        /*
        |--------------------------------------------------------------------------
        | SIMULATION SUCCESS
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

            simulated: true,

            tradeId:
              execution.tradeId,

            message:
              execution.message,
          });

          continue;
        }

        /*
        |--------------------------------------------------------------------------
        | SIMULATION FAILURE
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

          simulated: true,

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