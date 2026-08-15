import { NextRequest, NextResponse } from "next/server";

type BybitKlineResponse = {
  retCode: number;
  retMsg: string;
  result?: {
    category: string;
    symbol: string;
    list: string[][];
  };
};

const BASE_URL =
  process.env.BYBIT_BASE_URL ||
  "https://api.bybit.com";

const ALLOWED_SYMBOLS = new Set([
  "BTCUSDT",
  "ETHUSDT",
  "BNBUSDT",
  "TONUSDT",
]);

const ALLOWED_INTERVALS = new Set([
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
]);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } =
      new URL(request.url);

    const symbol = (
      searchParams.get("symbol") ||
      "BTCUSDT"
    )
      .trim()
      .toUpperCase();

    const interval =
      searchParams.get("interval") || "15";

    const limitValue = Number(
      searchParams.get("limit") || "100"
    );

    if (!ALLOWED_SYMBOLS.has(symbol)) {
      return NextResponse.json(
        {
          success: false,
          message: `Unsupported symbol: ${symbol}`,
          candles: [],
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_INTERVALS.has(interval)) {
      return NextResponse.json(
        {
          success: false,
          message: `Unsupported interval: ${interval}`,
          candles: [],
        },
        { status: 400 }
      );
    }

    const limit = Math.min(
      Math.max(
        Number.isFinite(limitValue)
          ? Math.floor(limitValue)
          : 100,
        1
      ),
      1000
    );

    const params = new URLSearchParams({
      category: "spot",
      symbol,
      interval,
      limit: String(limit),
    });

    const response = await fetch(
      `${BASE_URL}/v5/market/kline?${params.toString()}`,
      {
        method: "GET",
        cache: "no-store",
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
        },
        { status: 502 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            data.retMsg ||
            `Bybit HTTP ${response.status}`,
          candles: [],
        },
        { status: response.status }
      );
    }

    if (data.retCode !== 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            data.retMsg ||
            "Unable to retrieve market candles.",
          candles: [],
        },
        { status: 502 }
      );
    }

    const rawCandles =
      data.result?.list ?? [];

    /*
     * Bybit returns:
     *
     * [
     *   startTime,
     *   open,
     *   high,
     *   low,
     *   close,
     *   volume,
     *   turnover
     * ]
     *
     * The API returns newest candles first.
     * We reverse them so the chart receives
     * chronological data.
     */

    const candles = rawCandles
      .map((candle) => ({
        time: Number(candle[0]),
        open: Number(candle[1]),
        high: Number(candle[2]),
        low: Number(candle[3]),
        close: Number(candle[4]),
        volume: Number(candle[5]),
        turnover: Number(candle[6]),
      }))
      .filter(
        (candle) =>
          Number.isFinite(candle.time) &&
          Number.isFinite(candle.open) &&
          Number.isFinite(candle.high) &&
          Number.isFinite(candle.low) &&
          Number.isFinite(candle.close) &&
          Number.isFinite(candle.volume)
      )
      .reverse();

    return NextResponse.json({
      success: true,
      source: "BYBIT_MAINNET",
      symbol,
      interval,
      candles,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      "BYBIT KLINES ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to retrieve market candles.",
        candles: [],
      },
      { status: 500 }
    );
  }
}