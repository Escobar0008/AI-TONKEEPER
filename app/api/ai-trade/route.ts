import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Coin } from "@prisma/client";

/*
|--------------------------------------------------------------------------
| AI TONKEEPER — AI TRADING API
|--------------------------------------------------------------------------
|
| IMPORTANT
|
| Cette version est 100% SIMULATION.
|
| Aucun ordre réel n'est envoyé à un exchange.
|
| Les prix affichés sont des prix de marché réels récupérés
| depuis CoinGecko.
|
| AI Trade fonctionne donc indépendamment de Bybit.
|
| REAL MARKET DATA
|        ↓
| CoinGecko
|        ↓
| AI TONKEEPER
|        ↓
| AI analysis
|        ↓
| SIMULATED TRADING
|
|--------------------------------------------------------------------------
*/

const AI_SUPPORTED_COINS: Coin[] = [
  Coin.TON,
  Coin.BTC,
  Coin.ETH,
  Coin.BNB,
  Coin.USDT,
];

type TradeSignal = "BUY" | "SELL" | "WAIT";

type CoinGeckoCoin = {
  usd?: number;
  usd_24h_change?: number;
};

type CoinGeckoResponse = Record<string, CoinGeckoCoin>;

/*
|--------------------------------------------------------------------------
| COINGECKO IDS
|--------------------------------------------------------------------------
*/

const COINGECKO_IDS: Record<string, string> = {
  TON: "the-open-network",
  BTC: "bitcoin",
  ETH: "ethereum",
  BNB: "binancecoin",
  USDT: "tether",
};

/*
|--------------------------------------------------------------------------
| ERROR RESPONSE
|--------------------------------------------------------------------------
*/

function jsonError(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    {
      status,
    },
  );
}

/*
|--------------------------------------------------------------------------
| AUTHENTICATED USER
|--------------------------------------------------------------------------
*/

async function getAuthenticatedUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return prisma.user.findUnique({
    where: {
      id: String(session.user.id),
    },
  });
}

/*
|--------------------------------------------------------------------------
| CREATE SETTINGS IF NEEDED
|--------------------------------------------------------------------------
*/

async function getOrCreateSettings(userId: string) {
  let settings = await prisma.aITradeSettings.findUnique({
    where: {
      userId,
    },
  });

  if (!settings) {
    settings = await prisma.aITradeSettings.create({
      data: {
        userId,

        strategy: "BALANCED",

        riskLevel: "MEDIUM",

        minimumConfidence: 70,

        maximumTradeAllocation: 10,

        stopLossProtection: true,

        dailyLossProtection: true,

        emergencyStop: true,

        enabled: false,
      },
    });
  }

  return settings;
}

/*
|--------------------------------------------------------------------------
| REAL MARKET PRICES
|--------------------------------------------------------------------------
|
| Aucun appel Bybit.
|
| CoinGecko fournit les prix publics en temps réel.
|
| Aucun API KEY nécessaire.
|
|--------------------------------------------------------------------------
*/

async function getRealMarketPrices(): Promise<Partial<Record<Coin, number>>> {
  try {
    const ids = Object.values(COINGECKO_IDS).join(",");

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
        ids,
      )}&vs_currencies=usd&include_24hr_change=true`,
      {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      console.error("COINGECKO PRICE HTTP ERROR:", response.status);

      return {};
    }

    const data = (await response.json()) as CoinGeckoResponse;

    const prices: Partial<Record<Coin, number>> = {};

    for (const coin of AI_SUPPORTED_COINS) {
      const id = COINGECKO_IDS[coin];

      if (!id) {
        continue;
      }

      const price = Number(data[id]?.usd ?? 0);

      if (Number.isFinite(price) && price > 0) {
        prices[coin] = price;
      }
    }

    return prices;
  } catch (error) {
    console.error("REAL MARKET PRICE ERROR:", error);

    return {};
  }
}

/*
|--------------------------------------------------------------------------
| GET ONE REAL MARKET PRICE
|--------------------------------------------------------------------------
*/

async function getRealMarketPrice(coin: Coin): Promise<number> {
  const id = COINGECKO_IDS[coin];

  if (!id) {
    return 0;
  }

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
        id,
      )}&vs_currencies=usd`,
      {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      return 0;
    }

    const data = (await response.json()) as CoinGeckoResponse;

    const price = Number(data[id]?.usd ?? 0);

    if (!Number.isFinite(price) || price <= 0) {
      return 0;
    }

    return price;
  } catch (error) {
    console.error(`REAL PRICE ERROR (${coin}):`, error);

    return 0;
  }
}

/*
|--------------------------------------------------------------------------
| LOAD AI TRADES
|--------------------------------------------------------------------------
*/

async function getUserTrades(userId: string) {
  return prisma.aITrade.findMany({
    where: {
      userId,
    },

    orderBy: {
      createdAt: "desc",
    },

    take: 100,
  });
}

/*
|--------------------------------------------------------------------------
| BUILD AI TRADING DATA
|--------------------------------------------------------------------------
*/

async function buildAiTradingData(userId: string) {
  const settings = await prisma.aITradeSettings.findUnique({
    where: {
      userId,
    },
  });

  const trades = await getUserTrades(userId);

  const closedTrades = trades.filter((trade) => trade.status === "CLOSED");

  const openTrades = trades.filter((trade) => trade.status === "OPEN");

  /*
  |--------------------------------------------------------------------------
  | TOTAL PROFIT
  |--------------------------------------------------------------------------
  */

  const totalProfit = closedTrades.reduce(
    (total, trade) => total + Number(trade.profit ?? 0),
    0,
  );

  /*
  |--------------------------------------------------------------------------
  | WIN RATE
  |--------------------------------------------------------------------------
  */

  const winningTrades = closedTrades.filter(
    (trade) => Number(trade.profit ?? 0) > 0,
  );

  const winRate =
    closedTrades.length > 0
      ? (winningTrades.length / closedTrades.length) * 100
      : 0;

  /*
  |--------------------------------------------------------------------------
  | TODAY PROFIT
  |--------------------------------------------------------------------------
  */

  const todayStart = new Date();

  todayStart.setHours(0, 0, 0, 0);

  const todayProfit = closedTrades
    .filter((trade) => {
      if (!trade.closedAt) {
        return false;
      }

      return trade.closedAt >= todayStart;
    })
    .reduce((total, trade) => total + Number(trade.profit ?? 0), 0);

  /*
  |--------------------------------------------------------------------------
  | LATEST AI DECISION
  |--------------------------------------------------------------------------
  */

  const latestDecision = await prisma.aITradeDecision.findFirst({
    where: {
      userId,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  /*
  |--------------------------------------------------------------------------
  | STATUS
  |--------------------------------------------------------------------------
  */

  let status: "ACTIVE" | "PAUSED" | "STOPPED";

  if (settings?.enabled) {
    status = "ACTIVE";
  } else if (openTrades.length > 0) {
    status = "PAUSED";
  } else {
    status = "STOPPED";
  }

  /*
  |--------------------------------------------------------------------------
  | MAP TRADES
  |--------------------------------------------------------------------------
  */

  const mappedTrades = trades.map((trade) => ({
    id: trade.id,

    coin: trade.coin,

    pair: trade.pair,

    side: trade.side,

    amount: Number(trade.amount ?? 0),

    entryPrice: Number(trade.entryPrice ?? 0),

    currentPrice: Number(trade.currentPrice ?? 0),

    exitPrice: trade.exitPrice === null ? null : Number(trade.exitPrice),

    profit: Number(trade.profit ?? 0),

    fee: Number(trade.fee ?? 0),

    confidence: Number(trade.confidence ?? 0),

    status: trade.status,

    openedAt: trade.openedAt?.toISOString() ?? null,

    closedAt: trade.closedAt?.toISOString() ?? null,

    createdAt: trade.createdAt.toISOString(),
  }));

  return {
    status,

    confidence: Number(latestDecision?.confidence ?? 0),

    totalProfit,

    todayProfit,

    winRate,

    openTrades: openTrades.length,

    trades: mappedTrades ?? [],

    lastAnalysis: latestDecision?.reason ?? null,

    updatedAt: new Date().toISOString(),
  };
}

/*
|--------------------------------------------------------------------------
| GET /api/ai-trade
|--------------------------------------------------------------------------
*/

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return jsonError("Authentication required.", 401);
    }

    const settings = await getOrCreateSettings(user.id);

    const aiTrading = await buildAiTradingData(user.id);

    return NextResponse.json({
      success: true,

      user: {
        id: user.id,

        email: user.email,

        name: user.name,
      },

      aiTrading,

      settings,

      tradingMode: "SIMULATION",

      exchange: "NONE",

      marketData: "REAL",
    });
  } catch (error) {
    console.error("AI TRADE GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Unable to load AI Trading data.",

        aiTrading: {
          status: "STOPPED",

          confidence: 0,

          totalProfit: 0,

          todayProfit: 0,

          winRate: 0,

          openTrades: 0,

          trades: [],

          lastAnalysis: null,

          updatedAt: new Date().toISOString(),
        },
      },
      {
        status: 500,
      },
    );
  }
}

/*
|--------------------------------------------------------------------------
| POST /api/ai-trade
|--------------------------------------------------------------------------
|
| START
| PAUSE
| STOP
| ANALYZE
| OPEN_TRADE
| CLOSE_TRADE
|
| IMPORTANT:
|
| OPEN_TRADE / CLOSE_TRADE sont SIMULES.
|
| Aucun exchange n'est appelé.
| Aucun ordre réel n'est envoyé.
|
|--------------------------------------------------------------------------
*/

export async function POST(request: NextRequest) {
  try {
    /*
    |--------------------------------------------------------------------------
    | AUTH
    |--------------------------------------------------------------------------
    */

    const user = await getAuthenticatedUser();

    if (!user) {
      return jsonError("Authentication required.", 401);
    }

    /*
    |--------------------------------------------------------------------------
    | BODY
    |--------------------------------------------------------------------------
    */

    let body: Record<string, unknown>;

    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return jsonError("Invalid request body.", 400);
    }

    const action = String(body.action ?? "")
      .trim()
      .toUpperCase();

    /*
    |--------------------------------------------------------------------------
    | SETTINGS
    |--------------------------------------------------------------------------
    */

    const settings = await getOrCreateSettings(user.id);

    /*
    |--------------------------------------------------------------------------
    | START
    |--------------------------------------------------------------------------
    */

    if (action === "START") {
      await prisma.aITradeSettings.update({
        where: {
          userId: user.id,
        },

        data: {
          enabled: true,
        },
      });

      const aiTrading = await buildAiTradingData(user.id);

      return NextResponse.json({
        success: true,

        message: "AI Trading simulation started.",

        aiTrading,

        tradingMode: "SIMULATION",

        realOrders: false,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | PAUSE
    |--------------------------------------------------------------------------
    */

    if (action === "PAUSE") {
      await prisma.aITradeSettings.update({
        where: {
          userId: user.id,
        },

        data: {
          enabled: false,
        },
      });

      const aiTrading = await buildAiTradingData(user.id);

      return NextResponse.json({
        success: true,

        message: "AI Trading simulation paused.",

        aiTrading,

        tradingMode: "SIMULATION",

        realOrders: false,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | STOP
    |--------------------------------------------------------------------------
    */

    if (action === "STOP") {
      await prisma.aITradeSettings.update({
        where: {
          userId: user.id,
        },

        data: {
          enabled: false,
        },
      });

      const aiTrading = await buildAiTradingData(user.id);

      return NextResponse.json({
        success: true,

        message: "AI Trading simulation stopped.",

        aiTrading,

        tradingMode: "SIMULATION",

        realOrders: false,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | ANALYZE
    |--------------------------------------------------------------------------
    |
    | PRIX RÉELS
    |
    | Aucun Bybit.
    | Aucun ordre.
    |
    |--------------------------------------------------------------------------
    */

    if (action === "ANALYZE") {
      const prices = await getRealMarketPrices();

      const validPrices = Object.values(prices).filter(
        (price) =>
          typeof price === "number" && Number.isFinite(price) && price > 0,
      );

      if (validPrices.length === 0) {
        return NextResponse.json(
          {
            success: false,

            message: "Unable to retrieve real cryptocurrency market prices.",

            aiTrading: await buildAiTradingData(user.id),
          },
          {
            status: 503,
          },
        );
      }

      /*
      |--------------------------------------------------------------------------
      | SAFE SIGNAL
      |--------------------------------------------------------------------------
      |
      | Aucun BUY / SELL réel.
      |
      | L'interface peut afficher WAIT et analyser
      | le marché réel.
      |
      |--------------------------------------------------------------------------
      */

      const signal: TradeSignal = "WAIT";

      const confidence = 50;

      const analysis =
        "AI is monitoring the real cryptocurrency market using live market prices. Trading is currently running in simulation mode. No real orders are sent to any exchange.";

      /*
      |--------------------------------------------------------------------------
      | DECISION
      |--------------------------------------------------------------------------
      */

      const decision = await prisma.aITradeDecision.create({
        data: {
          userId: user.id,

          settingsId: settings.id,

          coin: Coin.BTC,

          pair: "BTC/USDT",

          signal,

          confidence,

          price: prices[Coin.BTC] ?? 0,

          reason: analysis,

          executed: false,
        },
      });

      /*
      |--------------------------------------------------------------------------
      | RETURN
      |--------------------------------------------------------------------------
      */

      const aiTrading = await buildAiTradingData(user.id);

      return NextResponse.json({
        success: true,

        message: "Real market analysis completed.",

        analysis: {
          success: true,

          prices,

          signal,

          confidence,

          analysis,

          timestamp: decision.createdAt.toISOString(),
        },

        aiTrading,

        tradingMode: "SIMULATION",

        realOrders: false,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | OPEN TRADE — SIMULATION ONLY
    |--------------------------------------------------------------------------
    */

    if (action === "OPEN_TRADE") {
      if (!settings.enabled) {
        return jsonError("AI Trading is not active.", 400);
      }

      const coinValue = String(body.coin ?? "")
        .trim()
        .toUpperCase();

      if (!AI_SUPPORTED_COINS.includes(coinValue as Coin)) {
        return jsonError("Unsupported AI Trading asset.", 400);
      }

      const coin = coinValue as Coin;

      const amount = Number(body.amount ?? 0);

      if (!Number.isFinite(amount) || amount <= 0) {
        return jsonError("Invalid trade amount.", 400);
      }

      /*
      |--------------------------------------------------------------------------
      | REAL CURRENT MARKET PRICE
      |--------------------------------------------------------------------------
      */

      const price = await getRealMarketPrice(coin);

      if (price <= 0) {
        return jsonError(
          `Unable to retrieve current ${coin} market price.`,
          503,
        );
      }

      /*
      |--------------------------------------------------------------------------
      | PREVENT DUPLICATE SIMULATED POSITION
      |--------------------------------------------------------------------------
      */

      const existingTrade = await prisma.aITrade.findFirst({
        where: {
          userId: user.id,

          coin,

          status: "OPEN",
        },
      });

      if (existingTrade) {
        return jsonError(
          `There is already an open simulated ${coin} AI trade.`,
          400,
        );
      }

      /*
      |--------------------------------------------------------------------------
      | CREATE SIMULATED TRADE
      |--------------------------------------------------------------------------
      |
      | IMPORTANT:
      |
      | This DOES NOT send an order anywhere.
      |
      |--------------------------------------------------------------------------
      */

      const trade = await prisma.aITrade.create({
        data: {
          userId: user.id,

          settingsId: settings.id,

          coin,

          pair: `${coin}/USDT`,

          side: "BUY",

          status: "OPEN",

          amount,

          entryPrice: price,

          currentPrice: price,

          profit: 0,

          fee: 0,

          confidence: settings.minimumConfidence,

          openedAt: new Date(),
        },
      });

      const aiTrading = await buildAiTradingData(user.id);

      return NextResponse.json({
        success: true,

        message: `${coin} simulated trade opened.`,

        trade,

        aiTrading,

        tradingMode: "SIMULATION",

        realOrders: false,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CLOSE TRADE — SIMULATION ONLY
    |--------------------------------------------------------------------------
    */

    if (action === "CLOSE_TRADE") {
      const tradeId = String(body.tradeId ?? "").trim();

      if (!tradeId) {
        return jsonError("Trade ID is required.", 400);
      }

      const trade = await prisma.aITrade.findFirst({
        where: {
          id: tradeId,

          userId: user.id,
        },
      });

      if (!trade) {
        return jsonError("Trade not found.", 404);
      }

      if (trade.status !== "OPEN") {
        return jsonError("Trade is already closed.", 400);
      }

      /*
      |--------------------------------------------------------------------------
      | REAL MARKET PRICE
      |--------------------------------------------------------------------------
      */

      const currentPrice = await getRealMarketPrice(trade.coin);

      if (currentPrice <= 0) {
        return jsonError(
          `Unable to retrieve current ${trade.coin} market price.`,
          503,
        );
      }

      /*
      |--------------------------------------------------------------------------
      | SIMULATED PROFIT
      |--------------------------------------------------------------------------
      */

      const profit =
        (currentPrice - Number(trade.entryPrice)) * Number(trade.amount);

      /*
      |--------------------------------------------------------------------------
      | UPDATE SIMULATED TRADE
      |--------------------------------------------------------------------------
      */

      const updatedTrade = await prisma.aITrade.update({
        where: {
          id: trade.id,
        },

        data: {
          currentPrice,

          exitPrice: currentPrice,

          profit,

          status: "CLOSED",

          closedAt: new Date(),
        },
      });

      const aiTrading = await buildAiTradingData(user.id);

      return NextResponse.json({
        success: true,

        message: `${trade.coin} simulated trade closed.`,

        trade: updatedTrade,

        aiTrading,

        tradingMode: "SIMULATION",

        realOrders: false,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | INVALID ACTION
    |--------------------------------------------------------------------------
    */

    return jsonError(
      "Invalid action. Supported actions: START, PAUSE, STOP, ANALYZE, OPEN_TRADE, CLOSE_TRADE.",
      400,
    );
  } catch (error) {
    console.error("AI TRADE POST ERROR:", error);

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error ? error.message : "AI Trading API error.",

        aiTrading: {
          status: "STOPPED",

          confidence: 0,

          totalProfit: 0,

          todayProfit: 0,

          winRate: 0,

          openTrades: 0,

          trades: [],

          lastAnalysis: null,

          updatedAt: new Date().toISOString(),
        },

        tradingMode: "SIMULATION",

        realOrders: false,
      },
      {
        status: 500,
      },
    );
  }
}
