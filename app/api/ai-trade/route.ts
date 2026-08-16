import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Coin } from "@prisma/client";

/*
|--------------------------------------------------------------------------
| AI TONKEEPER — AI TRADING API
|--------------------------------------------------------------------------
| Market data : CoinGecko
| Trading : interne à AI TONKEEPER
| Positions : AITrade
|--------------------------------------------------------------------------
*/

const AI_TRADABLE_COINS: Coin[] = [
  Coin.BTC,
  Coin.ETH,
  Coin.BNB,
];

type TradeSignal = "BUY" | "SELL" | "WAIT";

type MarketCandle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  turnover: number;
};

type CachedMarket = {
  candles: MarketCandle[];
  expiresAt: number;
};

type CachedPrice = {
  price: number;
  expiresAt: number;
};

/*
|--------------------------------------------------------------------------
| COINGECKO CONFIGURATION
|--------------------------------------------------------------------------
*/

const COINGECKO_BASE_URL =
  "https://api.coingecko.com/api/v3";

const CACHE_TTL = 30_000;

/*
|--------------------------------------------------------------------------
| SERVER MEMORY CACHE
|--------------------------------------------------------------------------
|
| Prevents every browser request from becoming a CoinGecko request.
|
|--------------------------------------------------------------------------
*/

const marketCache =
  new Map<string, CachedMarket>();

const priceCache =
  new Map<Coin, CachedPrice>();

const pendingMarketRequests =
  new Map<string, Promise<MarketCandle[]>>();

const pendingPriceRequests =
  new Map<Coin, Promise<number>>();

/*
|--------------------------------------------------------------------------
| COINGECKO IDS
|--------------------------------------------------------------------------
*/

function getCoinGeckoId(
  coin: Coin
): string | null {
  switch (coin) {
    case Coin.BTC:
      return "bitcoin";

    case Coin.ETH:
      return "ethereum";

    case Coin.BNB:
      return "binancecoin";

    default:
      return null;
  }
}

/*
|--------------------------------------------------------------------------
| SYMBOL -> COIN
|--------------------------------------------------------------------------
*/

function symbolToCoin(
  symbol: string
): Coin | null {
  const normalized =
    symbol
      .replace("/", "")
      .replace("-", "")
      .replace("_", "")
      .toUpperCase();

  if (
    normalized === "BTCUSDT" ||
    normalized === "BTCUSD" ||
    normalized === "BTC"
  ) {
    return Coin.BTC;
  }

  if (
    normalized === "ETHUSDT" ||
    normalized === "ETHUSD" ||
    normalized === "ETH"
  ) {
    return Coin.ETH;
  }

  if (
    normalized === "BNBUSDT" ||
    normalized === "BNBUSD" ||
    normalized === "BNB"
  ) {
    return Coin.BNB;
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| JSON ERROR
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
    { status }
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
| COINGECKO HEADERS
|--------------------------------------------------------------------------
*/

function getCoinGeckoHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/json",
  };

  const apiKey =
    process.env.COINGECKO_API_KEY;

  if (apiKey) {
    headers["x-cg-demo-api-key"] =
      apiKey;
  }

  return headers;
}

/*
|--------------------------------------------------------------------------
| MARKET DAYS
|--------------------------------------------------------------------------
|
| CoinGecko provides historical market data.
|
|--------------------------------------------------------------------------
*/

function getMarketDays(
  intervalMinutes: number
): number {
  if (intervalMinutes <= 5) {
    return 1;
  }

  if (intervalMinutes <= 60) {
    return 2;
  }

  if (intervalMinutes <= 240) {
    return 7;
  }

  if (intervalMinutes <= 1440) {
    return 30;
  }

  return 90;
}

/*
|--------------------------------------------------------------------------
| RESAMPLE MARKET DATA
|--------------------------------------------------------------------------
*/

function buildCandlesFromPrices(
  prices: [number, number][],
  volumes: [number, number][],
  intervalMinutes: number,
  limit: number
): MarketCandle[] {
  if (!Array.isArray(prices)) {
    return [];
  }

  const intervalMs =
    intervalMinutes *
    60 *
    1000;

  const volumeMap =
    new Map<number, number>();

  for (const item of volumes ?? []) {
    if (
      Array.isArray(item) &&
      item.length >= 2
    ) {
      volumeMap.set(
        Number(item[0]),
        Number(item[1])
      );
    }
  }

  const buckets =
    new Map<
      number,
      {
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
        turnover: number;
      }
    >();

  for (const item of prices) {
    if (
      !Array.isArray(item) ||
      item.length < 2
    ) {
      continue;
    }

    const timestamp =
      Number(item[0]);

    const price =
      Number(item[1]);

    if (
      !Number.isFinite(
        timestamp
      ) ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      continue;
    }

    const bucketTime =
      Math.floor(
        timestamp / intervalMs
      ) * intervalMs;

    const existing =
      buckets.get(bucketTime);

    const volume =
      volumeMap.get(
        timestamp
      ) ?? 0;

    if (!existing) {
      buckets.set(
        bucketTime,
        {
          open: price,
          high: price,
          low: price,
          close: price,
          volume:
            Number.isFinite(
              volume
            )
              ? volume
              : 0,
          turnover:
            Number.isFinite(
              volume
            )
              ? volume * price
              : 0,
        }
      );
    } else {
      existing.high =
        Math.max(
          existing.high,
          price
        );

      existing.low =
        Math.min(
          existing.low,
          price
        );

      existing.close =
        price;

      if (
        Number.isFinite(volume)
      ) {
        existing.volume +=
          volume;

        existing.turnover +=
          volume * price;
      }
    }
  }

  return Array.from(
    buckets.entries()
  )
    .sort(
      (a, b) =>
        a[0] - b[0]
    )
    .map(
      ([time, candle]) => ({
        time,

        open: candle.open,

        high: candle.high,

        low: candle.low,

        close: candle.close,

        volume:
          candle.volume,

        turnover:
          candle.turnover,
      })
    )
    .filter(
      (candle) =>
        Number.isFinite(
          candle.open
        ) &&
        Number.isFinite(
          candle.high
        ) &&
        Number.isFinite(
          candle.low
        ) &&
        Number.isFinite(
          candle.close
        ) &&
        candle.close > 0
    )
    .slice(-limit);
}

/*
|--------------------------------------------------------------------------
| FETCH MARKET FROM COINGECKO
|--------------------------------------------------------------------------
*/

async function fetchMarketFromCoinGecko(
  coin: Coin,
  intervalMinutes: number,
  limit: number
): Promise<MarketCandle[]> {
  const coinId =
    getCoinGeckoId(coin);

  if (!coinId) {
    return [];
  }

  const days =
    getMarketDays(
      intervalMinutes
    );

  const url =
    `${COINGECKO_BASE_URL}/coins/${coinId}/market_chart` +
    `?vs_currency=usd` +
    `&days=${days}` +
    `&precision=full`;

  const response =
    await fetch(url, {
      method: "GET",

      cache: "no-store",

      headers:
        getCoinGeckoHeaders(),
    });

  if (
    response.status ===
    429
  ) {
    throw new Error(
      "COINGECKO_RATE_LIMIT"
    );
  }

  if (!response.ok) {
    console.error(
      "COINGECKO MARKET HTTP ERROR:",
      response.status
    );

    throw new Error(
      `CoinGecko market request failed (${response.status}).`
    );
  }

  const data =
    (await response.json()) as {
      prices?: [number, number][];
      total_volumes?: [
        number,
        number
      ][];
    };

  return buildCandlesFromPrices(
    data.prices ?? [],
    data.total_volumes ?? [],
    intervalMinutes,
    limit
  );
}

/*
|--------------------------------------------------------------------------
| GET MARKET DATA WITH CACHE
|--------------------------------------------------------------------------
*/

async function getMarketData(
  coin: Coin,
  intervalMinutes: number,
  limit: number
): Promise<MarketCandle[]> {
  const cacheKey =
    `${coin}-${intervalMinutes}-${limit}`;

  const cached =
    marketCache.get(
      cacheKey
    );

  if (
    cached &&
    cached.expiresAt >
      Date.now() &&
    cached.candles.length > 0
  ) {
    return cached.candles;
  }

  const pending =
    pendingMarketRequests.get(
      cacheKey
    );

  if (pending) {
    return pending;
  }

  const request =
    (async () => {
      try {
        const candles =
          await fetchMarketFromCoinGecko(
            coin,
            intervalMinutes,
            limit
          );

        if (
          candles.length === 0
        ) {
          throw new Error(
            "CoinGecko returned no market data."
          );
        }

        marketCache.set(
          cacheKey,
          {
            candles,
            expiresAt:
              Date.now() +
              CACHE_TTL,
          }
        );

        return candles;
      } catch (error) {
        /*
        |--------------------------------------------------------------------------
        | IMPORTANT:
        | If CoinGecko temporarily returns 429,
        | use the last cached data when available.
        |--------------------------------------------------------------------------
        */

        const stale =
          marketCache.get(
            cacheKey
          );

        if (
          stale &&
          stale.candles.length > 0
        ) {
          return stale.candles;
        }

        throw error;
      } finally {
        pendingMarketRequests.delete(
          cacheKey
        );
      }
    })();

  pendingMarketRequests.set(
    cacheKey,
    request
  );

  return request;
}

/*
|--------------------------------------------------------------------------
| FETCH ONE PRICE
|--------------------------------------------------------------------------
*/

async function fetchPriceFromCoinGecko(
  coin: Coin
): Promise<number> {
  const coinId =
    getCoinGeckoId(coin);

  if (!coinId) {
    return 0;
  }

  const url =
    `${COINGECKO_BASE_URL}/simple/price` +
    `?ids=${encodeURIComponent(
      coinId
    )}` +
    `&vs_currencies=usd` +
    `&precision=full`;

  const response =
    await fetch(url, {
      method: "GET",

      cache: "no-store",

      headers:
        getCoinGeckoHeaders(),
    });

  if (
    response.status ===
    429
  ) {
    throw new Error(
      "COINGECKO_RATE_LIMIT"
    );
  }

  if (!response.ok) {
    throw new Error(
      `CoinGecko price request failed (${response.status}).`
    );
  }

  const data =
    (await response.json()) as Record<
      string,
      {
        usd?: number;
      }
    >;

  const price =
    Number(
      data?.[coinId]?.usd
    );

  if (
    !Number.isFinite(price) ||
    price <= 0
  ) {
    return 0;
  }

  return price;
}

/*
|--------------------------------------------------------------------------
| GET PRICE WITH CACHE
|--------------------------------------------------------------------------
*/

async function getCoinGeckoPrice(
  coin: Coin
): Promise<number> {
  const cached =
    priceCache.get(coin);

  if (
    cached &&
    cached.expiresAt >
      Date.now() &&
    cached.price > 0
  ) {
    return cached.price;
  }

  const pending =
    pendingPriceRequests.get(
      coin
    );

  if (pending) {
    return pending;
  }

  const request =
    (async () => {
      try {
        const price =
          await fetchPriceFromCoinGecko(
            coin
          );

        if (price <= 0) {
          throw new Error(
            "CoinGecko returned an invalid price."
          );
        }

        priceCache.set(
          coin,
          {
            price,
            expiresAt:
              Date.now() +
              CACHE_TTL,
          }
        );

        return price;
      } catch (error) {
        const stale =
          priceCache.get(
            coin
          );

        if (
          stale &&
          stale.price > 0
        ) {
          return stale.price;
        }

        throw error;
      } finally {
        pendingPriceRequests.delete(
          coin
        );
      }
    })();

  pendingPriceRequests.set(
    coin,
    request
  );

  return request;
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

  const totalProfit =
    closedTrades.reduce(
      (total, trade) =>
        total +
        Number(
          trade.profit ?? 0
        ),
      0
    );

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
      .filter(
        (trade) =>
          trade.closedAt &&
          trade.closedAt >=
            todayStart
      )
      .reduce(
        (total, trade) =>
          total +
          Number(
            trade.profit ?? 0
          ),
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
| GET
|--------------------------------------------------------------------------
*/

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } =
      new URL(
        request.url
      );

    /*
    |--------------------------------------------------------------------------
    | MARKET REQUEST
    |--------------------------------------------------------------------------
    */

    if (
      searchParams.get(
        "market"
      ) === "true"
    ) {
      const symbol =
        (
          searchParams.get(
            "symbol"
          ) ??
          "BTCUSDT"
        ).toUpperCase();

      const interval =
        Math.max(
          1,
          Number(
            searchParams.get(
              "interval"
            ) ?? 15
          )
        );

      const limit = Math.min(
        200,
        Math.max(
          20,
          Number(
            searchParams.get(
              "limit"
            ) ?? 200
          )
        )
      );

      const coin =
        symbolToCoin(
          symbol
        );

      if (!coin) {
        return jsonError(
          "Unsupported market symbol. Supported assets: BTCUSDT, ETHUSDT and BNBUSDT.",
          400
        );
      }

      try {
        const candles =
          await getMarketData(
            coin,
            interval,
            limit
          );

        return NextResponse.json(
          {
            success: true,

            market: true,

            source:
              "CoinGecko",

            symbol,

            coin,

            interval,

            candles,

            updatedAt:
              new Date().toISOString(),
          },
          {
            headers: {
              "Cache-Control":
                "no-store",
            },
          }
        );
      } catch (error) {
        console.error(
          "COINGECKO MARKET ERROR:",
          error
        );

        return NextResponse.json(
          {
            success: false,

            market: true,

            source:
              "CoinGecko",

            symbol,

            candles: [],

            message:
              error instanceof Error &&
              error.message ===
                "COINGECKO_RATE_LIMIT"
                ? "CoinGecko rate limit reached. Please retry shortly."
                : "Unable to retrieve real market data from CoinGecko.",
          },
          {
            status: 503,
          }
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | AUTHENTICATION
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
| POST
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

      return NextResponse.json({
        success: true,

        message:
          "AI Trading started.",

        aiTrading:
          await buildAiTradingData(
            user.id
          ),
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

      return NextResponse.json({
        success: true,

        message:
          "AI Trading paused.",

        aiTrading:
          await buildAiTradingData(
            user.id
          ),
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

      return NextResponse.json({
        success: true,

        message:
          "AI Trading stopped.",

        aiTrading:
          await buildAiTradingData(
            user.id
          ),
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
      const prices: Partial<
        Record<Coin, number>
      > = {};

      try {
        const results =
          await Promise.all(
            AI_TRADABLE_COINS.map(
              async (coin) => {
                const price =
                  await getCoinGeckoPrice(
                    coin
                  );

                return [
                  coin,
                  price,
                ] as const;
              }
            )
          );

        for (const [
          coin,
          price,
        ] of results) {
          if (price > 0) {
            prices[coin] =
              price;
          }
        }
      } catch (error) {
        console.error(
          "COINGECKO ANALYSIS ERROR:",
          error
        );

        return NextResponse.json(
          {
            success: false,

            message:
              "Unable to retrieve real crypto market prices from CoinGecko.",

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

      if (
        Object.keys(
          prices
        ).length === 0
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Unable to retrieve real crypto market prices from CoinGecko.",

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

      const signal: TradeSignal =
        "WAIT";

      const confidence = 50;

      const analysis =
        "AI is monitoring BTC, ETH and BNB using real CoinGecko market data.";

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

      return NextResponse.json({
        success: true,

        message:
          "Market analysis completed.",

        analysis: {
          success: true,

          source:
            "CoinGecko",

          prices,

          signal,

          confidence,

          analysis,

          timestamp:
            decision.createdAt.toISOString(),
        },

        aiTrading:
          await buildAiTradingData(
            user.id
          ),
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
      if (!settings.enabled) {
        return jsonError(
          "AI Trading is not active.",
          400
        );
      }

      const coinValue =
        String(
          body.coin ?? ""
        )
          .trim()
          .toUpperCase();

      if (
        !AI_TRADABLE_COINS.includes(
          coinValue as Coin
        )
      ) {
        return jsonError(
          "Supported AI trading assets: BTC, ETH and BNB.",
          400
        );
      }

      const coin =
        coinValue as Coin;

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

      let price = 0;

      try {
        price =
          await getCoinGeckoPrice(
            coin
          );
      } catch {
        return jsonError(
          `Unable to retrieve current ${coin} price from CoinGecko.`,
          503
        );
      }

      if (price <= 0) {
        return jsonError(
          `Unable to retrieve current ${coin} price from CoinGecko.`,
          503
        );
      }

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

      return NextResponse.json({
        success: true,

        message:
          `${coin} internal AI trade opened.`,

        trade,

        aiTrading:
          await buildAiTradingData(
            user.id
          ),
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

      if (
        trade.status !==
        "OPEN"
      ) {
        return jsonError(
          "Trade is already closed.",
          400
        );
      }

      if (
        !AI_TRADABLE_COINS.includes(
          trade.coin
        )
      ) {
        return jsonError(
          `${trade.coin} is not supported by AI Trading.`,
          400
        );
      }

      let currentPrice = 0;

      try {
        currentPrice =
          await getCoinGeckoPrice(
            trade.coin
          );
      } catch {
        return jsonError(
          `Unable to retrieve current ${trade.coin} price from CoinGecko.`,
          503
        );
      }

      if (
        currentPrice <= 0
      ) {
        return jsonError(
          `Unable to retrieve current ${trade.coin} price from CoinGecko.`,
          503
        );
      }

      const profit =
        (currentPrice -
          Number(
            trade.entryPrice
          )) *
        Number(
          trade.amount
        );

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

      return NextResponse.json({
        success: true,

        message:
          `${trade.coin} internal AI trade closed.`,

        trade:
          updatedTrade,

        aiTrading:
          await buildAiTradingData(
            user.id
          ),
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
      },
      {
        status: 500,
      }
    );
  }
}