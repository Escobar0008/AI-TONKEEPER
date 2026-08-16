import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Coin } from "@prisma/client";
/*
|--------------------------------------------------------------------------
| AI TONKEEPER — AI TRADING API
|--------------------------------------------------------------------------
|
| Market data:
| CoinGecko
|
| Trading engine:
| AI TONKEEPER
|
| Positions:
| AITrade
|
| IMPORTANT:
| No exchange orders are sent.
| AI Trading uses internal AITrade positions only.
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
type CoinGeckoMarketResponse = {
  prices?: [number, number][];
  total_volumes?: [number, number][];
};
const COINGECKO_BASE_URL =
  "https://api.coingecko.com/api/v3";
/*
|--------------------------------------------------------------------------
| CACHE
|--------------------------------------------------------------------------
|
| IMPORTANT:
| These values are milliseconds.
|
| 900 = 0.9 second  ❌
| 15_000 = 15 seconds
| 60_000 = 1 minute
| 120_000 = 2 minutes
|
| We use a longer cache to avoid CoinGecko 429 rate limits.
|--------------------------------------------------------------------------
*/
const MARKET_CACHE_TTL = 60_000;
const PRICE_CACHE_TTL = 30_000;
/*
|--------------------------------------------------------------------------
| CoinGecko 429 cooldown
|--------------------------------------------------------------------------
|
| When CoinGecko says "Too Many Requests", do not immediately
| send another request.
|--------------------------------------------------------------------------
*/
let coinGeckoRateLimitedUntil = 0;
const COINGECKO_RATE_LIMIT_COOLDOWN = 60_000;
/*
|--------------------------------------------------------------------------
| In-memory caches
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
| Helpers
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
function symbolToCoin(
  symbol: string
): Coin | null {
  const normalized = symbol
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
function getMarketDays(
  intervalMinutes: number
): number {
  if (intervalMinutes <= 5) {
    return 1;
  }
  if (intervalMinutes <= 15) {
    return 2;
  }
  if (intervalMinutes <= 30) {
    return 7;
  }
  if (intervalMinutes <= 60) {
    return 14;
  }
  if (intervalMinutes <= 240) {
    return 30;
  }
  if (intervalMinutes <= 720) {
    return 90;
  }
  return 365;
}
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
function isCoinGeckoRateLimited(): boolean {
  return (
    coinGeckoRateLimitedUntil >
    Date.now()
  );
}
function markCoinGeckoRateLimited(): void {
  coinGeckoRateLimitedUntil =
    Date.now() +
    COINGECKO_RATE_LIMIT_COOLDOWN;
}
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
| COINGECKO MARKET DATA
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
  if (isCoinGeckoRateLimited()) {
    throw new Error(
      "CoinGecko market data is temporarily rate limited. Please use cached market data."
    );
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
      headers: {
        Accept: "application/json",
      },
    });
  if (!response.ok) {
    if (response.status === 429) {
      markCoinGeckoRateLimited();
      console.error(
        "COINGECKO MARKET HTTP ERROR: 429"
      );
      throw new Error(
        "CoinGecko market data is temporarily rate limited."
      );
    }
    console.error(
      "COINGECKO MARKET HTTP ERROR:",
      response.status
    );
    throw new Error(
      `CoinGecko market request failed (${response.status}).`
    );
  }
  const data =
    (await response.json()) as CoinGeckoMarketResponse;
  if (
    !Array.isArray(data.prices)
  ) {
    throw new Error(
      "CoinGecko returned an invalid market response."
    );
  }
  const prices = data.prices
    .filter(
      (item) =>
        Array.isArray(item) &&
        item.length >= 2 &&
        Number.isFinite(
          Number(item[0])
        ) &&
        Number.isFinite(
          Number(item[1])
        ) &&
        Number(item[1]) > 0
    )
    .map((item) => ({
      time: Number(item[0]),
      price: Number(item[1]),
    }))
    .sort(
      (a, b) =>
        a.time - b.time
    );
  if (prices.length === 0) {
    throw new Error(
      "CoinGecko returned no market prices."
    );
  }
  const volumes =
    Array.isArray(
      data.total_volumes
    )
      ? data.total_volumes
          .filter(
            (item) =>
              Array.isArray(item) &&
              item.length >= 2 &&
              Number.isFinite(
                Number(item[0])
              ) &&
              Number.isFinite(
                Number(item[1])
              )
          )
          .map((item) => ({
            time: Number(item[0]),
            volume: Number(item[1]),
          }))
          .sort(
            (a, b) =>
              a.time - b.time
          )
      : [];
  const candlesMap =
    new Map<
      number,
      MarketCandle
    >();
  const intervalMs =
    intervalMinutes *
    60 *
    1000;
  for (const point of prices) {
    const bucket =
      Math.floor(
        point.time /
          intervalMs
      ) * intervalMs;
    const existing =
      candlesMap.get(
        bucket
      );
    if (!existing) {
      candlesMap.set(
        bucket,
        {
          time: bucket,
          open: point.price,
          high: point.price,
          low: point.price,
          close: point.price,
          volume: 0,
          turnover: 0,
        }
      );
    } else {
      existing.high =
        Math.max(
          existing.high,
          point.price
        );
      existing.low =
        Math.min(
          existing.low,
          point.price
        );
      existing.close =
        point.price;
    }
  }
  for (
    let i = 0;
    i < volumes.length;
    i++
  ) {
    const current =
      volumes[i];
    const next =
      volumes[i + 1];
    const volumeDelta =
      next
        ? Math.max(
            0,
            next.volume -
              current.volume
          )
        : 0;
    const bucket =
      Math.floor(
        current.time /
          intervalMs
      ) * intervalMs;
    const candle =
      candlesMap.get(
        bucket
      );
    if (candle) {
      candle.volume +=
        volumeDelta;
    }
  }
  const candles =
    Array.from(
      candlesMap.values()
    )
      .sort(
        (a, b) =>
          a.time - b.time
      )
      .slice(-limit);
  return candles;
}
async function getMarketData(
  coin: Coin,
  intervalMinutes: number,
  limit: number
): Promise<MarketCandle[]> {
  const cacheKey =
    `${coin}-${intervalMinutes}`;
  const cached =
    marketCache.get(
      cacheKey
    );
  if (
    cached &&
    cached.candles.length > 0
  ) {
    if (
      cached.expiresAt >
      Date.now()
    ) {
      return cached.candles.slice(
        -limit
      );
    }
    /*
     * If CoinGecko is currently rate limited,
     * return the last valid market data.
     */
    if (
      isCoinGeckoRateLimited()
    ) {
      return cached.candles.slice(
        -limit
      );
    }
  }
  const pending =
    pendingMarketRequests.get(
      cacheKey
    );
  if (pending) {
    const candles =
      await pending;
    return candles.slice(
      -limit
    );
  }
  const request =
    (async () => {
      try {
        const candles =
          await fetchMarketFromCoinGecko(
            coin,
            intervalMinutes,
            200
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
              MARKET_CACHE_TTL,
          }
        );
        return candles;
      } catch (error) {
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
  const candles =
    await request;
  return candles.slice(
    -limit
  );
}
/*
|--------------------------------------------------------------------------
| COINGECKO CURRENT PRICE
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
  if (isCoinGeckoRateLimited()) {
    throw new Error(
      "CoinGecko price data is temporarily rate limited."
    );
  }
  const url =
    `${COINGECKO_BASE_URL}/simple/price` +
    `?ids=${coinId}` +
    `&vs_currencies=usd` +
    `&precision=full`;
  const response =
    await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });
  if (!response.ok) {
    if (response.status === 429) {
      markCoinGeckoRateLimited();
      throw new Error(
        "CoinGecko price data is temporarily rate limited."
      );
    }
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
    throw new Error(
      "CoinGecko returned an invalid price."
    );
  }
  return price;
}
async function getCoinGeckoPrice(
  coin: Coin
): Promise<number> {
  const cached =
    priceCache.get(coin);
  if (
    cached &&
    cached.price > 0
  ) {
    if (
      cached.expiresAt >
      Date.now()
    ) {
      return cached.price;
    }
    if (
      isCoinGeckoRateLimited()
    ) {
      return cached.price;
    }
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
        priceCache.set(
          coin,
          {
            price,
            expiresAt:
              Date.now() +
              PRICE_CACHE_TTL,
          }
        );
        return price;
      } catch (error) {
        const stale =
          priceCache.get(coin);
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
| USER TRADES
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
| AI TRADING DATA
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
        trade.status === "CLOSED"
    );
  const openTrades =
    trades.filter(
      (trade) =>
        trade.status === "OPEN"
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
     * MARKET DATA ENDPOINT
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
      const intervalValue =
        Number(
          searchParams.get(
            "interval"
          ) ?? 15
        );
      const interval =
        Number.isFinite(
          intervalValue
        )
          ? Math.max(
              1,
              Math.floor(
                intervalValue
              )
            )
          : 15;
      const limitValue =
        Number(
          searchParams.get(
            "limit"
          ) ?? 200
        );
      const limit =
        Number.isFinite(
          limitValue
        )
          ? Math.min(
              200,
              Math.max(
                20,
                Math.floor(
                  limitValue
                )
              )
            )
          : 200;
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
            source: "CoinGecko",
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
        /*
         * If we have stale cached data,
         * return it instead of 503.
         */
        const cacheKey =
          `${coin}-${interval}`;
        const stale =
          marketCache.get(
            cacheKey
          );
        if (
          stale &&
          stale.candles.length > 0
        ) {
          return NextResponse.json(
            {
              success: true,
              market: true,
              source: "CoinGecko",
              cached: true,
              symbol,
              coin,
              interval,
              candles:
                stale.candles.slice(
                  -limit
                ),
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
        }
        return NextResponse.json(
          {
            success: false,
            market: true,
            source: "CoinGecko",
            symbol,
            candles: [],
            message:
              error instanceof Error
                ? error.message
                : "Unable to retrieve real market data from CoinGecko.",
          },
          {
            status: 503,
          }
        );
      }
    }
    /*
     * AUTHENTICATED AI TRADING DATA
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
    const user =
      await getAuthenticatedUser();
    if (!user) {
      return jsonError(
        "Authentication required.",
        401
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
        400
      );
    }
    const action =
      String(
        body.action ?? ""
      )
        .trim()
        .toUpperCase();
    const settings =
      await getOrCreateSettings(
        user.id
      );
    /*
     * START
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
     * PAUSE
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
     * STOP
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
     * ANALYZE
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
        "AI is monitoring BTC, ETH and BNB using real public CoinGecko market data.";
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
          source: "CoinGecko",
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
     * OPEN INTERNAL TRADE
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
     * CLOSE INTERNAL TRADE
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