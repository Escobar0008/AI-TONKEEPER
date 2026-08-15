import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Coin } from "@prisma/client";
import { auth } from "@/auth";

/*
|--------------------------------------------------------------------------
| AI TONKEEPER — AI TRADING ENGINE
|--------------------------------------------------------------------------
|
| Market data:
| CoinGecko
|
| Trading engine:
| AI TONKEEPER
|
| Orders:
| Stored in AITrade
|
| The AI analyzes real market data and creates/updates trading
| positions inside AI TONKEEPER.
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
  usd_24h_vol?: number;
  usd_market_cap?: number;
  usd_24h_high?: number;
  usd_24h_low?: number;
};

type CoinGeckoResponse = Record<
  string,
  CoinGeckoCoin
>;

type MarketPrice = {
  symbol: string;
  success: boolean;
  message?: string;
  price: number;
  change24h?: number;
  high24h?: number;
  low24h?: number;
  volume24h?: number;
  marketCap?: number;
};

type TradingStatus =
  | "ACTIVE"
  | "PAUSED"
  | "STOPPED";

/*
|--------------------------------------------------------------------------
| COINGECKO IDS
|--------------------------------------------------------------------------
*/

const COINGECKO_IDS: Record<
  string,
  string
> = {
  TON: "the-open-network",
  BTC: "bitcoin",
  ETH: "ethereum",
  BNB: "binancecoin",
  USDT: "tether",
};

/*
|--------------------------------------------------------------------------
| ERROR
|--------------------------------------------------------------------------
*/

function jsonError(
  message: string,
  status = 400,
) {
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
| SETTINGS
|--------------------------------------------------------------------------
*/

async function getOrCreateSettings(
  userId: string,
) {
  const existing =
    await prisma.aITradeSettings.findUnique({
      where: {
        userId,
      },
    });

  if (existing) {
    return existing;
  }

  return prisma.aITradeSettings.create({
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

      orderCount: 0,
    },
  });
}

/*
|--------------------------------------------------------------------------
| REAL MARKET DATA
|--------------------------------------------------------------------------
*/

async function getRealMarketData(): Promise<
  Partial<Record<Coin, CoinGeckoCoin>>
> {
  try {
    const ids = Object.values(
      COINGECKO_IDS,
    ).join(",");

    const url =
      "https://api.coingecko.com/api/v3/simple/price" +
      `?ids=${encodeURIComponent(ids)}` +
      "&vs_currencies=usd" +
      "&include_24hr_change=true" +
      "&include_24hr_vol=true" +
      "&include_market_cap=true" +
      "&include_24hr_high=true" +
      "&include_24hr_low=true";

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        "COINGECKO HTTP ERROR:",
        response.status,
      );

      return {};
    }

    const data =
      (await response.json()) as CoinGeckoResponse;

    const marketData: Partial<
      Record<Coin, CoinGeckoCoin>
    > = {};

    for (const coin of AI_SUPPORTED_COINS) {
      const id = COINGECKO_IDS[coin];

      if (!id) {
        continue;
      }

      if (!data[id]) {
        continue;
      }

      marketData[coin] = data[id];
    }

    return marketData;
  } catch (error) {
    console.error(
      "REAL MARKET DATA ERROR:",
      error,
    );

    return {};
  }
}

/*
|--------------------------------------------------------------------------
| FORMAT MARKET PRICES
|--------------------------------------------------------------------------
*/

function formatMarketPrices(
  marketData: Partial<
    Record<Coin, CoinGeckoCoin>
  >,
): MarketPrice[] {
  return AI_SUPPORTED_COINS.map(
    (coin) => {
      const data = marketData[coin];

      const price = Number(
        data?.usd ?? 0,
      );

      if (
        !Number.isFinite(price) ||
        price <= 0
      ) {
        return {
          symbol: `${coin}USDT`,
          success: false,
          message:
            "Market price unavailable.",
          price: 0,
        };
      }

      return {
        symbol: `${coin}USDT`,

        success: true,

        price,

        change24h: Number(
          data?.usd_24h_change ?? 0,
        ),

        high24h: Number(
          data?.usd_24h_high ?? 0,
        ),

        low24h: Number(
          data?.usd_24h_low ?? 0,
        ),

        volume24h: Number(
          data?.usd_24h_vol ?? 0,
        ),

        marketCap: Number(
          data?.usd_market_cap ?? 0,
        ),
      };
    },
  );
}

/*
|--------------------------------------------------------------------------
| ONE REAL MARKET PRICE
|--------------------------------------------------------------------------
*/

async function getRealMarketPrice(
  coin: Coin,
): Promise<number> {
  const id = COINGECKO_IDS[coin];

  if (!id) {
    return 0;
  }

  try {
    const url =
      "https://api.coingecko.com/api/v3/simple/price" +
      `?ids=${encodeURIComponent(id)}` +
      "&vs_currencies=usd";

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return 0;
    }

    const data =
      (await response.json()) as CoinGeckoResponse;

    const price = Number(
      data[id]?.usd ?? 0,
    );

    if (
      !Number.isFinite(price) ||
      price <= 0
    ) {
      return 0;
    }

    return price;
  } catch (error) {
    console.error(
      `REAL PRICE ERROR (${coin}):`,
      error,
    );

    return 0;
  }
}

/*
|--------------------------------------------------------------------------
| USER TRADES
|--------------------------------------------------------------------------
*/

async function getUserTrades(
  userId: string,
) {
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
| REFRESH OPEN TRADES
|--------------------------------------------------------------------------
*/

async function refreshOpenTrades(
  userId: string,
) {
  const openTrades =
    await prisma.aITrade.findMany({
      where: {
        userId,
        status: "OPEN",
      },
    });

  if (openTrades.length === 0) {
    return;
  }

  for (const trade of openTrades) {
    const currentPrice =
      await getRealMarketPrice(
        trade.coin,
      );

    if (
      !Number.isFinite(
        currentPrice,
      ) ||
      currentPrice <= 0
    ) {
      continue;
    }

    const entryPrice = Number(
      trade.entryPrice ?? 0,
    );

    const amount = Number(
      trade.amount ?? 0,
    );

    let profit = 0;

    if (
      trade.side === "BUY"
    ) {
      profit =
        (currentPrice -
          entryPrice) *
        amount;
    } else {
      profit =
        (entryPrice -
          currentPrice) *
        amount;
    }

    await prisma.aITrade.update({
      where: {
        id: trade.id,
      },

      data: {
        currentPrice,
        profit,
      },
    });
  }
}

/*
|--------------------------------------------------------------------------
| BUILD AI TRADING DATA
|--------------------------------------------------------------------------
*/

async function buildAiTradingData(
  userId: string,
) {
  const settings =
    await prisma.aITradeSettings.findUnique({
      where: {
        userId,
      },
    });

  await refreshOpenTrades(userId);

  const trades =
    await getUserTrades(userId);

  const closedTrades =
    trades.filter(
      (trade) =>
        trade.status === "CLOSED",
    );

  const openTrades =
    trades.filter(
      (trade) =>
        trade.status === "OPEN",
    );

  const totalProfit =
    closedTrades.reduce(
      (total, trade) =>
        total +
        Number(
          trade.profit ?? 0,
        ),
      0,
    );

  const winningTrades =
    closedTrades.filter(
      (trade) =>
        Number(
          trade.profit ?? 0,
        ) > 0,
    );

  const winRate =
    closedTrades.length > 0
      ? (winningTrades.length /
          closedTrades.length) *
        100
      : 0;

  const todayStart =
    new Date();

  todayStart.setHours(
    0,
    0,
    0,
    0,
  );

  const todayProfit =
    closedTrades
      .filter((trade) => {
        if (!trade.closedAt) {
          return false;
        }

        return (
          trade.closedAt >=
          todayStart
        );
      })
      .reduce(
        (total, trade) =>
          total +
          Number(
            trade.profit ?? 0,
          ),
        0,
      );

  const latestDecision =
    await prisma.aITradeDecision.findFirst(
      {
        where: {
          userId,
        },

        orderBy: {
          createdAt: "desc",
        },
      },
    );

  let status: TradingStatus;

  if (settings?.enabled) {
    status = "ACTIVE";
  } else if (
    openTrades.length > 0
  ) {
    status = "PAUSED";
  } else {
    status = "STOPPED";
  }

  const mappedTrades =
    trades.map((trade) => ({
      id: trade.id,

      coin: trade.coin,

      pair: trade.pair,

      side: trade.side,

      amount: Number(
        trade.amount ?? 0,
      ),

      entryPrice: Number(
        trade.entryPrice ?? 0,
      ),

      currentPrice: Number(
        trade.currentPrice ?? 0,
      ),

      exitPrice:
        trade.exitPrice === null
          ? null
          : Number(
              trade.exitPrice,
            ),

      profit: Number(
        trade.profit ?? 0,
      ),

      fee: Number(
        trade.fee ?? 0,
      ),

      confidence: Number(
        trade.confidence ?? 0,
      ),

      status: trade.status,

      openedAt:
        trade.openedAt
          ?.toISOString() ??
        null,

      closedAt:
        trade.closedAt
          ?.toISOString() ??
        null,

      createdAt:
        trade.createdAt.toISOString(),
    }));

  return {
    status,

    confidence: Number(
      latestDecision?.confidence ??
        0,
    ),

    totalProfit,

    todayProfit,

    winRate,

    openTrades:
      openTrades.length,

    orderCount: Number(
      settings?.orderCount ?? 0,
    ),

    trades: mappedTrades,

    lastAnalysis:
      latestDecision?.reason ??
      null,

    updatedAt:
      new Date().toISOString(),
  };
}

/*
|--------------------------------------------------------------------------
| MARKET ANALYSIS
|--------------------------------------------------------------------------
*/

function calculateMarketAnalysis(
  marketData: Partial<
    Record<Coin, CoinGeckoCoin>
  >,
) {
  const btcChange =
    Number(
      marketData[Coin.BTC]
        ?.usd_24h_change ?? 0,
    );

  const ethChange =
    Number(
      marketData[Coin.ETH]
        ?.usd_24h_change ?? 0,
    );

  const tonChange =
    Number(
      marketData[Coin.TON]
        ?.usd_24h_change ?? 0,
    );

  const bnbChange =
    Number(
      marketData[Coin.BNB]
        ?.usd_24h_change ?? 0,
    );

  const changes = [
    btcChange,
    ethChange,
    tonChange,
    bnbChange,
  ].filter((value) =>
    Number.isFinite(value),
  );

  const averageChange =
    changes.length > 0
      ? changes.reduce(
          (sum, value) =>
            sum + value,
          0,
        ) / changes.length
      : 0;

  let signal: TradeSignal;

  if (
    averageChange >= 1 &&
    btcChange > 0
  ) {
    signal = "BUY";
  } else if (
    averageChange <= -1 &&
    btcChange < 0
  ) {
    signal = "SELL";
  } else {
    signal = "WAIT";
  }

  let confidence =
    50 +
    Math.abs(
      averageChange,
    ) *
      8;

  if (
    btcChange > 0 &&
    ethChange > 0
  ) {
    confidence += 8;
  }

  if (
    btcChange < 0 &&
    ethChange < 0
  ) {
    confidence += 8;
  }

  confidence = Math.min(
    Math.max(
      Math.round(
        confidence,
      ),
      0,
    ),
    95,
  );

  let condition =
    "The cryptocurrency market is currently showing mixed movement.";

  if (
    averageChange >= 1
  ) {
    condition =
      "The cryptocurrency market is showing positive momentum.";
  } else if (
    averageChange <= -1
  ) {
    condition =
      "The cryptocurrency market is showing negative momentum.";
  }

  const analysis =
    `${condition} ` +
    `Bitcoin is ${
      btcChange >= 0
        ? "up"
        : "down"
    } ${Math.abs(
      btcChange,
    ).toFixed(2)}% over the last 24 hours, ` +
    `Ethereum is ${
      ethChange >= 0
        ? "up"
        : "down"
    } ${Math.abs(
      ethChange,
    ).toFixed(2)}%, ` +
    `TON is ${
      tonChange >= 0
        ? "up"
        : "down"
    } ${Math.abs(
      tonChange,
    ).toFixed(2)}%, ` +
    `and BNB is ${
      bnbChange >= 0
        ? "up"
        : "down"
    } ${Math.abs(
      bnbChange,
    ).toFixed(2)}%. ` +
    `The current market signal is ${signal} ` +
    `with an estimated confidence of ${confidence}%.`;

  return {
    signal,

    confidence,

    analysis,

    prices: {
      BTC: Number(
        marketData[Coin.BTC]
          ?.usd ?? 0,
      ),

      ETH: Number(
        marketData[Coin.ETH]
          ?.usd ?? 0,
      ),

      TON: Number(
        marketData[Coin.TON]
          ?.usd ?? 0,
      ),

      BNB: Number(
        marketData[Coin.BNB]
          ?.usd ?? 0,
      ),

      USDT: Number(
        marketData[Coin.USDT]
          ?.usd ?? 0,
      ),
    },
  };
}

/*
|--------------------------------------------------------------------------
| CREATE AI ORDER
|--------------------------------------------------------------------------
|
| Creates a real AITrade record in the platform database.
|
|--------------------------------------------------------------------------
*/

async function createAIOrder({
  userId,
  settingsId,
  coin,
  price,
  confidence,
}: {
  userId: string;
  settingsId: string;
  coin: Coin;
  price: number;
  confidence: number;
}) {
  if (
    !Number.isFinite(price) ||
    price <= 0
  ) {
    return null;
  }

  const existing =
    await prisma.aITrade.findFirst({
      where: {
        userId,
        coin,
        status: "OPEN",
      },
    });

  if (existing) {
    return existing;
  }

  /*
  |--------------------------------------------------------------------------
  | Order amount
  |--------------------------------------------------------------------------
  |
  | maximumTradeAllocation is treated as the amount allocated
  | to the AI order in the platform's trading accounting.
  |
  |--------------------------------------------------------------------------
  */

  const configuredAmount =
    Number(
      settingsId
        ? 0
        : 0,
    );

  void configuredAmount;

  const settings =
    await prisma.aITradeSettings.findUnique({
      where: {
        id: settingsId,
      },
    });

  const allocation =
    Number(
      settings
        ?.maximumTradeAllocation ??
        10,
    );

  const amount =
    Number.isFinite(
      allocation,
    ) &&
    allocation > 0
      ? allocation
      : 10;

  const trade =
    await prisma.aITrade.create({
      data: {
        userId,

        settingsId,

        coin,

        pair: `${coin}/USDT`,

        side: "BUY",

        status: "OPEN",

        amount,

        entryPrice: price,

        currentPrice: price,

        profit: 0,

        fee: 0,

        confidence,

        openedAt:
          new Date(),
      },
    });

  await prisma.aITradeSettings.update(
    {
      where: {
        id: settingsId,
      },

      data: {
        orderCount: {
          increment: 1,
        },
      },
    },
  );

  return trade;
}

/*
|--------------------------------------------------------------------------
| CLOSE AI ORDER
|--------------------------------------------------------------------------
*/

async function closeAIOrder(
  trade: {
    id: string;
    coin: Coin;
    side: string;
    amount: unknown;
    entryPrice: unknown;
  },
  currentPrice: number,
) {
  const entryPrice =
    Number(
      trade.entryPrice ?? 0,
    );

  const amount =
    Number(
      trade.amount ?? 0,
    );

  let profit = 0;

  if (
    trade.side === "BUY"
  ) {
    profit =
      (currentPrice -
        entryPrice) *
      amount;
  } else {
    profit =
      (entryPrice -
        currentPrice) *
      amount;
  }

  return prisma.aITrade.update({
    where: {
      id: trade.id,
    },

    data: {
      currentPrice,

      exitPrice:
        currentPrice,

      profit,

      status: "CLOSED",

      closedAt:
        new Date(),
    },
  });
}

/*
|--------------------------------------------------------------------------
| EXECUTE AI DECISION
|--------------------------------------------------------------------------
*/

async function executeAIDecision({
  userId,
  settings,
  signal,
  confidence,
  prices,
}: {
  userId: string;
  settings: {
    id: string;
    enabled: boolean;
    minimumConfidence: unknown;
  };
  signal: TradeSignal;
  confidence: number;
  prices: Record<
    string,
    number
  >;
}) {
  if (!settings.enabled) {
    return {
      action: "NONE",
      trade: null,
    };
  }

  const minimumConfidence =
    Number(
      settings.minimumConfidence ??
        70,
    );

  if (
    confidence <
    minimumConfidence
  ) {
    return {
      action: "NONE",
      trade: null,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | BUY
  |--------------------------------------------------------------------------
  */

  if (
    signal === "BUY"
  ) {
    const coin =
      Coin.BTC;

    const price =
      Number(
        prices.BTC ?? 0,
      );

    if (price <= 0) {
      return {
        action: "NONE",
        trade: null,
      };
    }

    const trade =
      await createAIOrder({
        userId,

        settingsId:
          settings.id,

        coin,

        price,

        confidence,
      });

    return {
      action: trade
        ? "BUY"
        : "NONE",

      trade,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | SELL
  |--------------------------------------------------------------------------
  */

  if (
    signal === "SELL"
  ) {
    const openTrade =
      await prisma.aITrade.findFirst({
        where: {
          userId,

          status: "OPEN",
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    if (!openTrade) {
      return {
        action: "NONE",
        trade: null,
      };
    }

    const price =
      await getRealMarketPrice(
        openTrade.coin,
      );

    if (price <= 0) {
      return {
        action: "NONE",
        trade: null,
      };
    }

    const trade =
      await closeAIOrder(
        openTrade,
        price,
      );

    return {
      action: "SELL",

      trade,
    };
  }

  return {
    action: "NONE",
    trade: null,
  };
}

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
*/

export async function GET(
  request: NextRequest,
) {
  try {
    const user =
      await getAuthenticatedUser();

    if (!user) {
      return jsonError(
        "Authentication required.",
        401,
      );
    }

    const settings =
      await getOrCreateSettings(
        user.id,
      );

    const market =
      request.nextUrl.searchParams.get(
        "market",
      );

    const marketData =
      await getRealMarketData();

    const prices =
      formatMarketPrices(
        marketData,
      );

    const aiTrading =
      await buildAiTradingData(
        user.id,
      );

    return NextResponse.json({
      success: true,

      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },

      aiTrading,

      prices,

      settings,

      tradingMode:
        "AI_TRADING",

      marketData:
        "REAL",

      marketRequest:
        market === "true",

      ordersEnabled:
        settings.enabled,
    });
  } catch (error) {
    console.error(
      "AI TRADE GET ERROR:",
      error,
    );

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

          orderCount: 0,

          trades: [],

          lastAnalysis: null,

          updatedAt:
            new Date().toISOString(),
        },

        prices: [],

        tradingMode:
          "AI_TRADING",
      },
      {
        status: 500,
      },
    );
  }
}

/*
|--------------------------------------------------------------------------
| POST
|--------------------------------------------------------------------------
|
| START
| PAUSE
| STOP
| ANALYZE
| OPEN_TRADE
| CLOSE_TRADE
|
|--------------------------------------------------------------------------
*/

export async function POST(
  request: NextRequest,
) {
  try {
    const user =
      await getAuthenticatedUser();

    if (!user) {
      return jsonError(
        "Authentication required.",
        401,
      );
    }

    let body: Record<
      string,
      unknown
    >;

    try {
      body =
        (await request.json()) as Record<
          string,
          unknown
        >;
    } catch {
      return jsonError(
        "Invalid request body.",
        400,
      );
    }

    const action =
      String(
        body.action ?? "",
      )
        .trim()
        .toUpperCase();

    const settings =
      await getOrCreateSettings(
        user.id,
      );

    /*
    |--------------------------------------------------------------------------
    | START
    |--------------------------------------------------------------------------
    */

    if (
      action === "START"
    ) {
      const updatedSettings =
        await prisma.aITradeSettings.update(
          {
            where: {
              userId: user.id,
            },

            data: {
              enabled: true,
            },
          },
        );

      const aiTrading =
        await buildAiTradingData(
          user.id,
        );

      return NextResponse.json({
        success: true,

        message:
          "AI Trading started.",

        aiTrading,

        settings:
          updatedSettings,

        tradingMode:
          "AI_TRADING",

        ordersEnabled: true,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | PAUSE
    |--------------------------------------------------------------------------
    */

    if (
      action === "PAUSE"
    ) {
      await prisma.aITradeSettings.update(
        {
          where: {
            userId: user.id,
          },

          data: {
            enabled: false,
          },
        },
      );

      const aiTrading =
        await buildAiTradingData(
          user.id,
        );

      return NextResponse.json({
        success: true,

        message:
          "AI Trading paused.",

        aiTrading,

        tradingMode:
          "AI_TRADING",

        ordersEnabled: false,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | STOP
    |--------------------------------------------------------------------------
    */

    if (
      action === "STOP"
    ) {
      await prisma.aITradeSettings.update(
        {
          where: {
            userId: user.id,
          },

          data: {
            enabled: false,
          },
        },
      );

      const aiTrading =
        await buildAiTradingData(
          user.id,
        );

      return NextResponse.json({
        success: true,

        message:
          "AI Trading stopped.",

        aiTrading,

        tradingMode:
          "AI_TRADING",

        ordersEnabled: false,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | ANALYZE
    |--------------------------------------------------------------------------
    */

    if (
      action === "ANALYZE"
    ) {
      const marketData =
        await getRealMarketData();

      const validPrices =
        Object.values(
          marketData,
        ).filter((data) => {
          const price =
            Number(
              data?.usd ?? 0,
            );

          return (
            Number.isFinite(
              price,
            ) &&
            price > 0
          );
        });

      if (
        validPrices.length === 0
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Unable to retrieve real cryptocurrency market prices.",

            aiTrading:
              await buildAiTradingData(
                user.id,
              ),

            prices: [],
          },
          {
            status: 503,
          },
        );
      }

      const result =
        calculateMarketAnalysis(
          marketData,
        );

      const decision =
        await prisma.aITradeDecision.create(
          {
            data: {
              userId: user.id,

              settingsId:
                settings.id,

              coin: Coin.BTC,

              pair: "BTC/USDT",

              signal:
                result.signal,

              confidence:
                result.confidence,

              price:
                result.prices.BTC,

              reason:
                result.analysis,

              executed: false,
            },
          },
        );

      /*
      |--------------------------------------------------------------------------
      | EXECUTE AI ORDER
      |--------------------------------------------------------------------------
      */

      const execution =
        await executeAIDecision({
          userId: user.id,

          settings,

          signal:
            result.signal,

          confidence:
            result.confidence,

          prices:
            result.prices,
        });

      if (
        execution.action !==
        "NONE"
      ) {
        await prisma.aITradeDecision.update(
          {
            where: {
              id: decision.id,
            },

            data: {
              executed: true,
            },
          },
        );
      }

      const aiTrading =
        await buildAiTradingData(
          user.id,
        );

      const prices =
        formatMarketPrices(
          marketData,
        );

      return NextResponse.json({
        success: true,

        message:
          execution.action ===
          "BUY"
            ? "AI BUY order created."
            : execution.action ===
              "SELL"
            ? "AI SELL order completed."
            : "Market analysis completed.",

        analysis: {
          success: true,

          prices:
            result.prices,

          signal:
            result.signal,

          confidence:
            result.confidence,

          analysis:
            result.analysis,

          timestamp:
            decision.createdAt.toISOString(),
        },

        order: execution.trade
          ? {
              id:
                execution.trade.id,

              action:
                execution.action,

              coin:
                execution.trade.coin,

              pair:
                execution.trade.pair,

              side:
                execution.trade.side,

              amount: Number(
                execution.trade.amount,
              ),

              price: Number(
                execution.trade.entryPrice ??
                  execution.trade.currentPrice,
              ),

              status:
                execution.trade.status,

              createdAt:
                execution.trade.createdAt.toISOString(),
            }
          : null,

        prices,

        aiTrading,

        tradingMode:
          "AI_TRADING",

        ordersEnabled:
          settings.enabled,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | OPEN TRADE
    |--------------------------------------------------------------------------
    */

    if (
      action === "OPEN_TRADE"
    ) {
      if (!settings.enabled) {
        return jsonError(
          "AI Trading is not active.",
          400,
        );
      }

      const coinValue =
        String(
          body.coin ?? "BTC",
        )
          .trim()
          .toUpperCase();

      if (
        !AI_SUPPORTED_COINS.includes(
          coinValue as Coin,
        )
      ) {
        return jsonError(
          "Unsupported AI Trading asset.",
          400,
        );
      }

      const coin =
        coinValue as Coin;

      const amount =
        Number(
          body.amount ?? 0,
        );

      const configuredAmount =
        Number(
          settings.maximumTradeAllocation ??
            10,
        );

      const finalAmount =
        Number.isFinite(
          amount,
        ) && amount > 0
          ? amount
          : configuredAmount;

      if (
        !Number.isFinite(
          finalAmount,
        ) ||
        finalAmount <= 0
      ) {
        return jsonError(
          "Invalid trade amount.",
          400,
        );
      }

      const price =
        await getRealMarketPrice(
          coin,
        );

      if (price <= 0) {
        return jsonError(
          `Unable to retrieve current ${coin} market price.`,
          503,
        );
      }

      const existingTrade =
        await prisma.aITrade.findFirst(
          {
            where: {
              userId: user.id,

              coin,

              status: "OPEN",
            },
          },
        );

      if (existingTrade) {
        return jsonError(
          `There is already an open ${coin} AI order.`,
          400,
        );
      }

      const trade =
        await prisma.aITrade.create(
          {
            data: {
              userId: user.id,

              settingsId:
                settings.id,

              coin,

              pair: `${coin}/USDT`,

              side: "BUY",

              status: "OPEN",

              amount:
                finalAmount,

              entryPrice:
                price,

              currentPrice:
                price,

              profit: 0,

              fee: 0,

              confidence:
                Number(
                  settings.minimumConfidence ??
                    70,
                ),

              openedAt:
                new Date(),
            },
          },
        );

      await prisma.aITradeSettings.update(
        {
          where: {
            id: settings.id,
          },

          data: {
            orderCount: {
              increment: 1,
            },
          },
        },
      );

      const aiTrading =
        await buildAiTradingData(
          user.id,
        );

      return NextResponse.json({
        success: true,

        message:
          `${coin} AI order created.`,

        trade: {
          ...trade,

          amount: Number(
            trade.amount,
          ),

          entryPrice: Number(
            trade.entryPrice,
          ),

          currentPrice: Number(
            trade.currentPrice,
          ),

          profit: Number(
            trade.profit,
          ),

          fee: Number(
            trade.fee,
          ),

          confidence: Number(
            trade.confidence,
          ),
        },

        aiTrading,

        tradingMode:
          "AI_TRADING",

        ordersEnabled: true,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CLOSE TRADE
    |--------------------------------------------------------------------------
    */

    if (
      action === "CLOSE_TRADE"
    ) {
      const tradeId =
        String(
          body.tradeId ?? "",
        ).trim();

      if (!tradeId) {
        return jsonError(
          "Trade ID is required.",
          400,
        );
      }

      const trade =
        await prisma.aITrade.findFirst(
          {
            where: {
              id: tradeId,

              userId: user.id,
            },
          },
        );

      if (!trade) {
        return jsonError(
          "Trade not found.",
          404,
        );
      }

      if (
        trade.status !== "OPEN"
      ) {
        return jsonError(
          "Trade is already closed.",
          400,
        );
      }

      const currentPrice =
        await getRealMarketPrice(
          trade.coin,
        );

      if (
        currentPrice <= 0
      ) {
        return jsonError(
          `Unable to retrieve current ${trade.coin} market price.`,
          503,
        );
      }

      const updatedTrade =
        await closeAIOrder(
          trade,
          currentPrice,
        );

      const aiTrading =
        await buildAiTradingData(
          user.id,
        );

      return NextResponse.json({
        success: true,

        message:
          `${trade.coin} AI order closed.`,

        trade: {
          ...updatedTrade,

          amount: Number(
            updatedTrade.amount,
          ),

          entryPrice: Number(
            updatedTrade.entryPrice,
          ),

          currentPrice: Number(
            updatedTrade.currentPrice,
          ),

          exitPrice: Number(
            updatedTrade.exitPrice,
          ),

          profit: Number(
            updatedTrade.profit,
          ),

          fee: Number(
            updatedTrade.fee,
          ),

          confidence: Number(
            updatedTrade.confidence,
          ),
        },

        aiTrading,

        tradingMode:
          "AI_TRADING",

        ordersEnabled:
          settings.enabled,
      });
    }

    return jsonError(
      "Invalid action. Supported actions: START, PAUSE, STOP, ANALYZE, OPEN_TRADE, CLOSE_TRADE.",
      400,
    );
  } catch (error) {
    console.error(
      "AI TRADE POST ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "AI Trading API error.",

        aiTrading: {
          status: "STOPPED",

          confidence: 0,

          totalProfit: 0,

          todayProfit: 0,

          winRate: 0,

          openTrades: 0,

          orderCount: 0,

          trades: [],

          lastAnalysis: null,

          updatedAt:
            new Date().toISOString(),
        },

        prices: [],

        tradingMode:
          "AI_TRADING",
      },
      {
        status: 500,
      },
    );
  }
}