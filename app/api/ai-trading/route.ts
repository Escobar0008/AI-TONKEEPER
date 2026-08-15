import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SUPPORTED_COINS = [
  "TON",
  "BTC",
  "ETH",
  "BNB",
  "USDT",
] as const;

type TradeSignal = "BUY" | "SELL" | "WAIT";

function jsonError(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
}

/*
|--------------------------------------------------------------------------
| AUTHENTICATED USER
|--------------------------------------------------------------------------
*/

async function getUserId() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  return userId || null;
}

/*
|--------------------------------------------------------------------------
| CRYPTO PRICE
|--------------------------------------------------------------------------
*/

async function getCryptoPrice(
  request: NextRequest,
  coin: string
): Promise<number> {
  try {
    const origin = new URL(request.url).origin;

    const response = await fetch(
      `${origin}/api/crypto?coin=${encodeURIComponent(coin)}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return 0;
    }

    const data = await response.json();

    if (!data?.success) {
      return 0;
    }

    const price = Number(data.price ?? 0);

    if (!Number.isFinite(price) || price <= 0) {
      return 0;
    }

    return price;
  } catch (error) {
    console.error(
      `AI TRADE CRYPTO PRICE ERROR (${coin}):`,
      error
    );

    return 0;
  }
}

/*
|--------------------------------------------------------------------------
| GET USER AI TRADING DATA
|--------------------------------------------------------------------------
*/

export async function GET() {
  try {
    const userId = await getUserId();

    if (!userId) {
      return jsonError(
        "Authentication required.",
        401
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return jsonError(
        "User not found.",
        404
      );
    }

    const settings =
      await prisma.aITradeSettings.findUnique({
        where: {
          userId,
        },
      });

    const trades = await prisma.aITrade.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    const closedTrades = trades.filter(
      (trade) => trade.status === "CLOSED"
    );

    const totalProfit = closedTrades.reduce(
      (total, trade) =>
        total + Number(trade.profit || 0),
      0
    );

    const winningTrades =
      closedTrades.filter(
        (trade) =>
          Number(trade.profit || 0) > 0
      );

    const winRate =
      closedTrades.length > 0
        ? (winningTrades.length /
            closedTrades.length) *
          100
        : 0;

    const openTrades = trades.filter(
      (trade) =>
        trade.status === "OPEN"
    ).length;

    const todayStart = new Date();

    todayStart.setHours(
      0,
      0,
      0,
      0
    );

    const todayClosedTrades =
      closedTrades.filter((trade) => {
        if (!trade.closedAt) {
          return false;
        }

        return (
          trade.closedAt >= todayStart
        );
      });

    const todayProfit =
      todayClosedTrades.reduce(
        (total, trade) =>
          total +
          Number(trade.profit || 0),
        0
      );

    const latestDecision =
      await prisma.aITradeDecision.findFirst({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    const mappedTrades = trades.map(
      (trade) => ({
        id: trade.id,
        coin: trade.coin,
        pair: trade.pair,
        side: trade.side,
        amount: trade.amount,
        entryPrice: trade.entryPrice,
        currentPrice: trade.currentPrice,
        profit: trade.profit,
        status: trade.status,
        createdAt:
          trade.createdAt.toISOString(),
      })
    );

    return NextResponse.json({
      success: true,

      aiTrading: {
        status:
          settings?.enabled
            ? "ACTIVE"
            : openTrades > 0
            ? "PAUSED"
            : "STOPPED",

        confidence:
          latestDecision?.confidence ?? 0,

        totalProfit,

        todayProfit,

        winRate,

        openTrades,

        trades: mappedTrades,

        lastAnalysis:
          latestDecision?.reason ?? null,

        updatedAt:
          new Date().toISOString(),
      },

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
          "Unable to load AI Trading data.",
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
    const userId = await getUserId();

    if (!userId) {
      return jsonError(
        "Authentication required.",
        401
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return jsonError(
        "User not found.",
        404
      );
    }

    const body = await request.json();

    const action = String(
      body?.action ?? ""
    )
      .trim()
      .toUpperCase();

    /*
    |--------------------------------------------------------------------------
    | GET / CREATE SETTINGS
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | START
    |--------------------------------------------------------------------------
    */

    if (action === "START") {
      const updatedSettings =
        await prisma.aITradeSettings.update({
          where: {
            userId,
          },
          data: {
            enabled: true,
          },
        });

      return NextResponse.json({
        success: true,
        message:
          "AI Trading started.",
        aiTrading: {
          status: "ACTIVE",
          confidence: 0,
          totalProfit: 0,
          todayProfit: 0,
          winRate: 0,
          openTrades: 0,
          trades: [],
          lastAnalysis:
            "AI Trading engine started and is monitoring the market.",
          updatedAt:
            updatedSettings.updatedAt.toISOString(),
        },
      });
    }

    /*
    |--------------------------------------------------------------------------
    | PAUSE
    |--------------------------------------------------------------------------
    */

    if (action === "PAUSE") {
      const updatedSettings =
        await prisma.aITradeSettings.update({
          where: {
            userId,
          },
          data: {
            enabled: false,
          },
        });

      return NextResponse.json({
        success: true,
        message:
          "AI Trading paused.",
        aiTrading: {
          status: "PAUSED",
          confidence: 0,
          totalProfit: 0,
          todayProfit: 0,
          winRate: 0,
          openTrades: 0,
          trades: [],
          lastAnalysis:
            "AI Trading is paused. Existing positions remain unchanged.",
          updatedAt:
            updatedSettings.updatedAt.toISOString(),
        },
      });
    }

    /*
    |--------------------------------------------------------------------------
    | STOP
    |--------------------------------------------------------------------------
    */

    if (action === "STOP") {
      const updatedSettings =
        await prisma.aITradeSettings.update({
          where: {
            userId,
          },
          data: {
            enabled: false,
          },
        });

      return NextResponse.json({
        success: true,
        message:
          "AI Trading stopped.",
        aiTrading: {
          status: "STOPPED",
          confidence: 0,
          totalProfit: 0,
          todayProfit: 0,
          winRate: 0,
          openTrades: 0,
          trades: [],
          lastAnalysis:
            "AI Trading engine stopped.",
          updatedAt:
            updatedSettings.updatedAt.toISOString(),
        },
      });
    }

    /*
    |--------------------------------------------------------------------------
    | ANALYZE
    |--------------------------------------------------------------------------
    */

    if (action === "ANALYZE") {
      const prices: Record<
        string,
        number
      > = {};

      for (const coin of SUPPORTED_COINS) {
        prices[coin] =
          await getCryptoPrice(
            request,
            coin
          );
      }

      const validPrices =
        Object.values(prices).filter(
          (price) => price > 0
        );

      if (validPrices.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Unable to retrieve crypto market prices.",
          },
          {
            status: 503,
          }
        );
      }

      /*
      |--------------------------------------------------------------------------
      | SAFE ANALYSIS MODE
      |--------------------------------------------------------------------------
      */

      const signal: TradeSignal =
        "WAIT";

      const confidence = 50;

      const analysis =
        "AI is monitoring the market and waiting for a stronger signal.";

      const decision =
        await prisma.aITradeDecision.create({
          data: {
            userId,
            settingsId: settings.id,
            coin: "BTC",
            pair: "BTC/USDT",
            signal,
            confidence,
            price:
              prices.BTC ?? 0,
            reason: analysis,
            executed: false,
          },
        });

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
      });
    }

    /*
    |--------------------------------------------------------------------------
    | OPEN TRADE
    |--------------------------------------------------------------------------
    */

    if (action === "OPEN_TRADE") {
      if (!settings.enabled) {
        return jsonError(
          "AI Trading is not active.",
          400
        );
      }

      const coin = String(
        body?.coin ?? ""
      )
        .trim()
        .toUpperCase();

      const amount = Number(
        body?.amount ?? 0
      );

      if (
        !SUPPORTED_COINS.includes(
          coin as (typeof SUPPORTED_COINS)[number]
        )
      ) {
        return jsonError(
          "Unsupported cryptocurrency.",
          400
        );
      }

      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        return jsonError(
          "Invalid trade amount.",
          400
        );
      }

      const price =
        await getCryptoPrice(
          request,
          coin
        );

      if (price <= 0) {
        return jsonError(
          "Unable to retrieve current crypto price.",
          503
        );
      }

      const trade =
        await prisma.aITrade.create({
          data: {
            userId,
            settingsId: settings.id,
            coin: coin as
              | "TON"
              | "BTC"
              | "ETH"
              | "BNB"
              | "USDT",
            pair: `${coin}/USDT`,
            side: "BUY",
            status: "OPEN",
            amount,
            entryPrice: price,
            currentPrice: price,
            profit: 0,
            fee: 0,
            confidence:
              settings.minimumConfidence,
            openedAt: new Date(),
          },
        });

      return NextResponse.json({
        success: true,
        message:
          `${coin} trade opened.`,
        trade,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CLOSE TRADE
    |--------------------------------------------------------------------------
    */

    if (action === "CLOSE_TRADE") {
      const tradeId = String(
        body?.tradeId ?? ""
      ).trim();

      if (!tradeId) {
        return jsonError(
          "Trade ID is required.",
          400
        );
      }

      const trade =
        await prisma.aITrade.findFirst({
          where: {
            id: tradeId,
            userId,
          },
        });

      if (!trade) {
        return jsonError(
          "Trade not found.",
          404
        );
      }

      if (trade.status !== "OPEN") {
        return jsonError(
          "Trade is already closed.",
          400
        );
      }

      const currentPrice =
        await getCryptoPrice(
          request,
          trade.coin
        );

      if (currentPrice <= 0) {
        return jsonError(
          "Unable to retrieve current crypto price.",
          503
        );
      }

      const profit =
        (currentPrice -
          trade.entryPrice) *
        trade.amount;

      const updatedTrade =
        await prisma.aITrade.update({
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

      return NextResponse.json({
        success: true,
        message:
          "Trade closed.",
        trade: updatedTrade,
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
          "AI Trading API error.",
      },
      {
        status: 500,
      }
    );
  }
}