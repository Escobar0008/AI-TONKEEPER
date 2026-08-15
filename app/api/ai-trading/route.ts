import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Coin } from "@prisma/client";

/*
|--------------------------------------------------------------------------
| AI TONKEEPER — AI TRADING API
|--------------------------------------------------------------------------
|
| AI TRADING ASSETS
|
| BTC
| ETH
| BNB
|
| TON:
| - supported by AI TONKEEPER
| - can exist in user balances
| - monitored separately
| - NOT traded through Bybit AI Trading
|
| USDT:
| - quote currency
| - NOT an AI trading asset
|
|--------------------------------------------------------------------------
*/

const AI_TRADABLE_COINS: Coin[] = [
  Coin.BTC,
  Coin.ETH,
  Coin.BNB,
];

type TradeSignal = "BUY" | "SELL" | "WAIT";

type BybitTicker = {
  symbol: string;
  lastPrice: string;
};

type BybitTickerResponse = {
  retCode: number;
  retMsg: string;
  result?: {
    category?: string;
    list?: BybitTicker[];
  };
};

/*
|--------------------------------------------------------------------------
| ERROR RESPONSE
|--------------------------------------------------------------------------
*/

function jsonError(
  message: string,
  status = 400
) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    {
      status,
    }
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

async function getOrCreateSettings(
  userId: string
) {
  let settings =
    await prisma.aITradeSettings.findUnique({
      where: {
        userId,
      },
    });

  if (!settings) {
    settings =
      await prisma.aITradeSettings.create({
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
| BYBIT SYMBOL
|--------------------------------------------------------------------------
*/

function getBybitSymbol(
  coin: Coin
) {
  switch (coin) {
    case Coin.BTC:
      return "BTCUSDT";

    case Coin.ETH:
      return "ETHUSDT";

    case Coin.BNB:
      return "BNBUSDT";

    default:
      return null;
  }
}

/*
|--------------------------------------------------------------------------
| GET ALL BYBIT PRICES
|--------------------------------------------------------------------------
|
| One public Bybit request.
|
| BTC
| ETH
| BNB
|
| TON is intentionally excluded.
|
|--------------------------------------------------------------------------
*/

async function getBybitPrices(): Promise<
  Partial<Record<Coin, number>>
> {
  try {
    const baseUrl =
      process.env.BYBIT_BASE_URL ||
      "https://api.bybit.com";

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
        "BYBIT PRICE HTTP ERROR:",
        response.status
      );

      return {};
    }

    const data =
      (await response.json()) as BybitTickerResponse;

    if (
      data.retCode !== 0
    ) {
      console.error(
        "BYBIT PRICE API ERROR:",
        data.retCode,
        data.retMsg
      );

      return {};
    }

    const list =
      data.result?.list ?? [];

    const prices: Partial<
      Record<Coin, number>
    > = {};

    for (const coin of AI_TRADABLE_COINS) {
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

      if (
        Number.isFinite(price) &&
        price > 0
      ) {
        prices[coin] =
          price;
      }
    }

    return prices;
  } catch (error) {
    console.error(
      "BYBIT PRICE FETCH ERROR:",
      error
    );

    return {};
  }
}

/*
|--------------------------------------------------------------------------
| GET ONE BYBIT PRICE
|--------------------------------------------------------------------------
*/

async function getBybitPrice(
  coin: Coin
): Promise<number> {
  const symbol =
    getBybitSymbol(coin);

  if (!symbol) {
    return 0;
  }

  try {
    const baseUrl =
      process.env.BYBIT_BASE_URL ||
      "https://api.bybit.com";

    const response =
      await fetch(
        `${baseUrl}/v5/market/tickers?category=spot&symbol=${encodeURIComponent(
          symbol
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
        `BYBIT PRICE HTTP ERROR (${coin}):`,
        response.status
      );

      return 0;
    }

    const data =
      (await response.json()) as BybitTickerResponse;

    if (
      data.retCode !== 0
    ) {
      console.error(
        `BYBIT PRICE API ERROR (${coin}):`,
        data.retCode,
        data.retMsg
      );

      return 0;
    }

    const ticker =
      data.result?.list?.find(
        (item) =>
          item.symbol ===
          symbol
      );

    if (!ticker) {
      return 0;
    }

    const price =
      Number(
        ticker.lastPrice
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
      `BYBIT PRICE ERROR (${coin}):`,
      error
    );

    return 0;
  }
}

/*
|--------------------------------------------------------------------------
| LOAD USER TRADES
|--------------------------------------------------------------------------
*/

async function getUserTrades(
  userId: string
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
| BUILD AI TRADING DATA
|--------------------------------------------------------------------------
*/

async function buildAiTradingData(
  userId: string
) {
  const settings =
    await prisma.aITradeSettings.findUnique({
      where: {
        userId,
      },
    });

  const trades =
    await getUserTrades(userId);

  const closedTrades =
    trades.filter(
      (trade) =>
        trade.status ===
        "CLOSED"
    );

  const openTrades =
    trades.filter(
      (trade) =>
        trade.status ===
        "OPEN"
    );

  /*
  |--------------------------------------------------------------------------
  | TOTAL PROFIT
  |--------------------------------------------------------------------------
  */

  const totalProfit =
    closedTrades.reduce(
      (total, trade) =>
        total +
        Number(
          trade.profit ?? 0
        ),
      0
    );

  /*
  |--------------------------------------------------------------------------
  | WIN RATE
  |--------------------------------------------------------------------------
  */

  const winningTrades =
    closedTrades.filter(
      (trade) =>
        Number(
          trade.profit ?? 0
        ) > 0
    );

  const winRate =
    closedTrades.length > 0
      ? (winningTrades.length /
          closedTrades.length) *
        100
      : 0;

  /*
  |--------------------------------------------------------------------------
  | TODAY PROFIT
  |--------------------------------------------------------------------------
  */

  const todayStart =
    new Date();

  todayStart.setHours(
    0,
    0,
    0,
    0
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
            trade.profit ?? 0
          ),
        0
      );

  /*
  |--------------------------------------------------------------------------
  | LATEST AI DECISION
  |--------------------------------------------------------------------------
  */

  const latestDecision =
    await prisma.aITradeDecision.findFirst({
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

  let status:
    | "ACTIVE"
    | "PAUSED"
    | "STOPPED";

  if (settings?.enabled) {
    status = "ACTIVE";
  } else if (
    openTrades.length > 0
  ) {
    status = "PAUSED";
  } else {
    status = "STOPPED";
  }

  /*
  |--------------------------------------------------------------------------
  | MAP TRADES
  |--------------------------------------------------------------------------
  */

  const mappedTrades =
    trades.map((trade) => ({
      id: trade.id,

      coin: trade.coin,

      pair: trade.pair,

      side: trade.side,

      amount: Number(
        trade.amount ?? 0
      ),

      entryPrice: Number(
        trade.entryPrice ?? 0
      ),

      currentPrice: Number(
        trade.currentPrice ?? 0
      ),

      exitPrice:
        trade.exitPrice === null
          ? null
          : Number(
              trade.exitPrice
            ),

      profit: Number(
        trade.profit ?? 0
      ),

      fee: Number(
        trade.fee ?? 0
      ),

      confidence: Number(
        trade.confidence ?? 0
      ),

      status: trade.status,

      openedAt:
        trade.openedAt?.toISOString() ??
        null,

      closedAt:
        trade.closedAt?.toISOString() ??
        null,

      createdAt:
        trade.createdAt.toISOString(),
    }));

  return {
    status,

    confidence:
      Number(
        latestDecision?.confidence ??
          0
      ),

    totalProfit,

    todayProfit,

    winRate,

    openTrades:
      openTrades.length,

    trades:
      mappedTrades,

    lastAnalysis:
      latestDecision?.reason ??
      null,

    updatedAt:
      new Date().toISOString(),
  };
}

/*
|--------------------------------------------------------------------------
| GET /api/ai-trade
|--------------------------------------------------------------------------
*/

export async function GET() {
  try {
    const user =
      await getAuthenticatedUser();

    if (!user) {
      return jsonError(
        "Authentication required.",
        401
      );
    }

    const settings =
      await getOrCreateSettings(
        user.id
      );

    const aiTrading =
      await buildAiTradingData(
        user.id
      );

    return NextResponse.json({
      success: true,

      user: {
        id: user.id,

        email: user.email,

        name: user.name,
      },

      aiTrading,

      settings,
    });
  } catch (error) {
    console.error(
      "AI TRADE GET ERROR:",
      error
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

          trades: [],

          lastAnalysis: null,

          updatedAt:
            new Date().toISOString(),
        },
      },
      {
        status: 500,
      }
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
|--------------------------------------------------------------------------
*/

export async function POST(
  request: NextRequest
) {
  try {
    /*
    |--------------------------------------------------------------------------
    | AUTH
    |--------------------------------------------------------------------------
    */

    const user =
      await getAuthenticatedUser();

    if (!user) {
      return jsonError(
        "Authentication required.",
        401
      );
    }

    /*
    |--------------------------------------------------------------------------
    | BODY
    |--------------------------------------------------------------------------
    */

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
        400
      );
    }

    const action =
      String(
        body.action ?? ""
      )
        .trim()
        .toUpperCase();

    /*
    |--------------------------------------------------------------------------
    | SETTINGS
    |--------------------------------------------------------------------------
    */

    const settings =
      await getOrCreateSettings(
        user.id
      );

    /*
    |--------------------------------------------------------------------------
    | START
    |--------------------------------------------------------------------------
    */

    if (
      action === "START"
    ) {
      await prisma.aITradeSettings.update({
        where: {
          userId: user.id,
        },

        data: {
          enabled: true,
        },
      });

      const aiTrading =
        await buildAiTradingData(
          user.id
        );

      return NextResponse.json({
        success: true,

        message:
          "AI Trading started.",

        aiTrading,
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
      await prisma.aITradeSettings.update({
        where: {
          userId: user.id,
        },

        data: {
          enabled: false,
        },
      });

      const aiTrading =
        await buildAiTradingData(
          user.id
        );

      return NextResponse.json({
        success: true,

        message:
          "AI Trading paused.",

        aiTrading,
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
      await prisma.aITradeSettings.update({
        where: {
          userId: user.id,
        },

        data: {
          enabled: false,
        },
      });

      const aiTrading =
        await buildAiTradingData(
          user.id
        );

      return NextResponse.json({
        success: true,

        message:
          "AI Trading stopped.",

        aiTrading,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | ANALYZE
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    |
    | One Bybit request.
    |
    | BTC
    | ETH
    | BNB
    |
    | No TON request.
    | No /api/crypto request.
    |
    |--------------------------------------------------------------------------
    */

    if (
      action === "ANALYZE"
    ) {
      const prices =
        await getBybitPrices();

      const validPrices =
        Object.values(
          prices
        ).filter(
          (price) =>
            typeof price ===
              "number" &&
            Number.isFinite(
              price
            ) &&
            price > 0
        );

      if (
        validPrices.length ===
        0
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Unable to retrieve crypto market prices from Bybit.",

            aiTrading:
              await buildAiTradingData(
                user.id
              ),
          },
          {
            status: 503,
          }
        );
      }

      /*
      |--------------------------------------------------------------------------
      | SAFE ANALYSIS
      |--------------------------------------------------------------------------
      |
      | No automatic BUY/SELL.
      |
      */

      const signal: TradeSignal =
        "WAIT";

      const confidence = 50;

      const analysis =
        "AI is monitoring BTC, ETH and BNB using live Bybit market prices. TON remains supported by AI TONKEEPER but is not traded through Bybit.";

      /*
      |--------------------------------------------------------------------------
      | SAVE DECISION
      |--------------------------------------------------------------------------
      */

      const decision =
        await prisma.aITradeDecision.create({
          data: {
            userId:
              user.id,

            settingsId:
              settings.id,

            coin: Coin.BTC,

            pair:
              "BTC/USDT",

            signal,

            confidence,

            price:
              prices[
                Coin.BTC
              ] ?? 0,

            reason:
              analysis,

            executed:
              false,
          },
        });

      const aiTrading =
        await buildAiTradingData(
          user.id
        );

      return NextResponse.json({
        success: true,

        message:
          "Market analysis completed.",

        analysis: {
          success: true,

          prices,

          signal,

          confidence,

          analysis,

          timestamp:
            decision.createdAt.toISOString(),
        },

        aiTrading,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | OPEN TRADE
    |--------------------------------------------------------------------------
    */

    if (
      action ===
      "OPEN_TRADE"
    ) {
      /*
      |--------------------------------------------------------------------------
      | AI MUST BE ACTIVE
      |--------------------------------------------------------------------------
      */

      if (!settings.enabled) {
        return jsonError(
          "AI Trading is not active.",
          400
        );
      }

      /*
      |--------------------------------------------------------------------------
      | COIN
      |--------------------------------------------------------------------------
      */

      const coinValue =
        String(
          body.coin ?? ""
        )
          .trim()
          .toUpperCase();

      /*
      |--------------------------------------------------------------------------
      | ONLY BTC / ETH / BNB
      |--------------------------------------------------------------------------
      */

      if (
        !AI_TRADABLE_COINS.includes(
          coinValue as Coin
        )
      ) {
        return jsonError(
          `${
            coinValue ||
            "This coin"
          } is not currently tradable by AI Trading. Supported AI trading assets: BTC, ETH and BNB. TON remains supported by AI TONKEEPER but is not traded through Bybit.`,
          400
        );
      }

      const coin =
        coinValue as Coin;

      /*
      |--------------------------------------------------------------------------
      | AMOUNT
      |--------------------------------------------------------------------------
      */

      const amount =
        Number(
          body.amount ?? 0
        );

      if (
        !Number.isFinite(
          amount
        ) ||
        amount <= 0
      ) {
        return jsonError(
          "Invalid trade amount.",
          400
        );
      }

      /*
      |--------------------------------------------------------------------------
      | CURRENT PRICE
      |--------------------------------------------------------------------------
      */

      const price =
        await getBybitPrice(
          coin
        );

      if (price <= 0) {
        return jsonError(
          `Unable to retrieve current ${coin} price from Bybit.`,
          503
        );
      }

      /*
      |--------------------------------------------------------------------------
      | PREVENT DUPLICATE POSITION
      |--------------------------------------------------------------------------
      */

      const existingTrade =
        await prisma.aITrade.findFirst({
          where: {
            userId:
              user.id,

            coin,

            status: "OPEN",
          },
        });

      if (existingTrade) {
        return jsonError(
          `There is already an open ${coin} AI trade.`,
          400
        );
      }

      /*
      |--------------------------------------------------------------------------
      | CREATE TRADE
      |--------------------------------------------------------------------------
      */

      const trade =
        await prisma.aITrade.create({
          data: {
            userId:
              user.id,

            settingsId:
              settings.id,

            coin,

            pair:
              `${coin}/USDT`,

            side: "BUY",

            status: "OPEN",

            amount,

            entryPrice:
              price,

            currentPrice:
              price,

            profit: 0,

            fee: 0,

            confidence:
              settings.minimumConfidence,

            openedAt:
              new Date(),
          },
        });

      const aiTrading =
        await buildAiTradingData(
          user.id
        );

      return NextResponse.json({
        success: true,

        message:
          `${coin} trade opened.`,

        trade,

        aiTrading,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CLOSE TRADE
    |--------------------------------------------------------------------------
    */

    if (
      action ===
      "CLOSE_TRADE"
    ) {
      /*
      |--------------------------------------------------------------------------
      | TRADE ID
      |--------------------------------------------------------------------------
      */

      const tradeId =
        String(
          body.tradeId ?? ""
        ).trim();

      if (!tradeId) {
        return jsonError(
          "Trade ID is required.",
          400
        );
      }

      /*
      |--------------------------------------------------------------------------
      | FIND USER TRADE
      |--------------------------------------------------------------------------
      */

      const trade =
        await prisma.aITrade.findFirst({
          where: {
            id: tradeId,

            userId:
              user.id,
          },
        });

      if (!trade) {
        return jsonError(
          "Trade not found.",
          404
        );
      }

      /*
      |--------------------------------------------------------------------------
      | STATUS
      |--------------------------------------------------------------------------
      */

      if (
        trade.status !==
        "OPEN"
      ) {
        return jsonError(
          "Trade is already closed.",
          400
        );
      }

      /*
      |--------------------------------------------------------------------------
      | ONLY BYBIT TRADABLE COINS
      |--------------------------------------------------------------------------
      */

      if (
        !AI_TRADABLE_COINS.includes(
          trade.coin
        )
      ) {
        return jsonError(
          `${trade.coin} is not tradable through the Bybit AI Trading engine.`,
          400
        );
      }

      /*
      |--------------------------------------------------------------------------
      | CURRENT PRICE
      |--------------------------------------------------------------------------
      */

      const currentPrice =
        await getBybitPrice(
          trade.coin
        );

      if (
        currentPrice <= 0
      ) {
        return jsonError(
          `Unable to retrieve current ${trade.coin} price from Bybit.`,
          503
        );
      }

      /*
      |--------------------------------------------------------------------------
      | PROFIT
      |--------------------------------------------------------------------------
      */

      const profit =
        (currentPrice -
          Number(
            trade.entryPrice
          )) *
        Number(
          trade.amount
        );

      /*
      |--------------------------------------------------------------------------
      | UPDATE TRADE
      |--------------------------------------------------------------------------
      */

      const updatedTrade =
        await prisma.aITrade.update({
          where: {
            id: trade.id,
          },

          data: {
            currentPrice,

            exitPrice:
              currentPrice,

            profit,

            status:
              "CLOSED",

            closedAt:
              new Date(),
          },
        });

      /*
      |--------------------------------------------------------------------------
      | RETURN
      |--------------------------------------------------------------------------
      */

      const aiTrading =
        await buildAiTradingData(
          user.id
        );

      return NextResponse.json({
        success: true,

        message:
          `${trade.coin} trade closed.`,

        trade:
          updatedTrade,

        aiTrading,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | INVALID ACTION
    |--------------------------------------------------------------------------
    */

    return jsonError(
      "Invalid action. Supported actions: START, PAUSE, STOP, ANALYZE, OPEN_TRADE, CLOSE_TRADE.",
      400
    );
  } catch (error) {
    console.error(
      "AI TRADE POST ERROR:",
      error
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

          trades: [],

          lastAnalysis: null,

          updatedAt:
            new Date().toISOString(),
        },
      },
      {
        status: 500,
      }
    );
  }
}