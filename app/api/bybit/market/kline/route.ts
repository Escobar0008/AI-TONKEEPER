import { NextRequest, NextResponse } from "next/server";
const BASE_URL =
  process.env.BYBIT_BASE_URL || "https://api.bybit.com";
type BybitKlineResponse = {
  retCode: number;
  retMsg: string;
  result?: {
    category: string;
    symbol: string;
    list: string[][];
  };
};
type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  turnover: number;
};
const ALLOWED_CATEGORIES = [
  "spot",
  "linear",
  "inverse",
] as const;
const ALLOWED_INTERVALS = [
  "1",
  "3",
  "5",
  "15",
  "30",
  "60",
  "120",
  "240",
  "360",
  "720",
  "D",
  "W",
  "M",
] as const;
function normalizeSymbol(
  value: string | null
): string {
  const symbol = (value || "BTCUSDT")
    .trim()
    .toUpperCase();
  if (!/^[A-Z0-9_-]+$/.test(symbol)) {
    return "BTCUSDT";
  }
  return symbol;
}
function normalizeCategory(
  value: string | null
): (typeof ALLOWED_CATEGORIES)[number] {
  const category = (value || "spot")
    .trim()
    .toLowerCase();
  if (
    ALLOWED_CATEGORIES.includes(
      category as (typeof ALLOWED_CATEGORIES)[number]
    )
  ) {
    return category as (typeof ALLOWED_CATEGORIES)[number];
  }
  return "spot";
}
function normalizeInterval(
  value: string | null
): (typeof ALLOWED_INTERVALS)[number] {
  const interval = (value || "15")
    .trim()
    .toUpperCase();
  if (
    ALLOWED_INTERVALS.includes(
      interval as (typeof ALLOWED_INTERVALS)[number]
    )
  ) {
    return interval as (typeof ALLOWED_INTERVALS)[number];
  }
  return "15";
}
function normalizeLimit(
  value: string | null
): number {
  const parsed = Number(value || "200");
  if (!Number.isFinite(parsed)) {
    return 200;
  }
  return Math.min(
    Math.max(Math.floor(parsed), 1),
    1000
  );
}
function parseCandle(
  item: string[]
): Candle | null {
  if (!Array.isArray(item) || item.length < 7) {
    return null;
  }
  const time = Number(item[0]);
  const open = Number(item[1]);
  const high = Number(item[2]);
  const low = Number(item[3]);
  const close = Number(item[4]);
  const volume = Number(item[5]);
  const turnover = Number(item[6]);
  if (
    !Number.isFinite(time) ||
    !Number.isFinite(open) ||
    !Number.isFinite(high) ||
    !Number.isFinite(low) ||
    !Number.isFinite(close)
  ) {
    return null;
  }
  return {
    time,
    open,
    high,
    low,
    close,
    volume: Number.isFinite(volume)
      ? volume
      : 0,
    turnover: Number.isFinite(turnover)
      ? turnover
      : 0,
  };
}
export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } = new URL(
      request.url
    );
    const symbol = normalizeSymbol(
      searchParams.get("symbol")
    );
    const category = normalizeCategory(
      searchParams.get("category")
    );
    const interval = normalizeInterval(
      searchParams.get("interval")
    );
    const limit = normalizeLimit(
      searchParams.get("limit")
    );
    const url = new URL(
      `${BASE_URL}/v5/market/kline`
    );
    url.searchParams.set(
      "category",
      category
    );
    url.searchParams.set(
      "symbol",
      symbol
    );
    url.searchParams.set(
      "interval",
      interval
    );
    url.searchParams.set(
      "limit",
      String(limit)
    );
    const response = await fetch(
      url.toString(),
      {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      }
    );
    let data: BybitKlineResponse;
    try {
      data =
        (await response.json()) as BybitKlineResponse;
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid response received from Bybit.",
          candles: [],
          symbol,
          category,
          interval,
        },
        {
          status: 502,
        }
      );
    }
    if (
      !response.ok ||
      data.retCode !== 0
    ) {
      console.error(
        "BYBIT KLINE API ERROR:",
        {
          status: response.status,
          retCode: data.retCode,
          retMsg: data.retMsg,
          symbol,
          category,
          interval,
        }
      );
      return NextResponse.json(
        {
          success: false,
          message:
            data.retMsg ||
            "Unable to retrieve Bybit market data.",
          candles: [],
          symbol,
          category,
          interval,
        },
        {
          status: 502,
        }
      );
    }
    const rawCandles =
      data.result?.list ?? [];
    const candles: Candle[] =
      rawCandles
        .map(parseCandle)
        .filter(
          (
            candle
          ): candle is Candle =>
            candle !== null
        )
        .sort(
          (a, b) =>
            a.time - b.time
        );
    return NextResponse.json({
      success: true,
      source: "BYBIT_MARKET",
      symbol,
      category,
      interval,
      candles,
      count: candles.length,
      updatedAt:
        new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      "BYBIT KLINE ERROR:",
      error
    );
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to load market candles.",
        candles: [],
      },
      {
        status: 500,
      }
    );
  }
}