import { NextResponse } from "next/server";

const COINGECKO_IDS: Record<string, string> = {
  TON: "the-open-network",
  BTC: "bitcoin",
  ETH: "ethereum",
  BNB: "binancecoin",
  USDT: "tether",
};

const SUPPORTED_COINS = Object.keys(COINGECKO_IDS);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const from = (searchParams.get("from") || "").toUpperCase();

    const to = (searchParams.get("to") || "").toUpperCase();

    if (!SUPPORTED_COINS.includes(from) || !SUPPORTED_COINS.includes(to)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unsupported cryptocurrency.",
        },
        { status: 400 },
      );
    }

    if (from === to) {
      return NextResponse.json(
        {
          success: false,
          message: "Source and destination cryptocurrencies must be different.",
        },
        { status: 400 },
      );
    }

    const fromId = COINGECKO_IDS[from];
    const toId = COINGECKO_IDS[to];

    const url =
      `https://api.coingecko.com/api/v3/simple/price` +
      `?ids=${encodeURIComponent(`${fromId},${toId}`)}` +
      `&vs_currencies=usd`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 15,
      },
    });

    if (!response.ok) {
      console.error("COINGECKO ERROR:", response.status);

      return NextResponse.json(
        {
          success: false,
          message: "Unable to retrieve live cryptocurrency prices.",
        },
        { status: 502 },
      );
    }

    const prices = await response.json();

    const fromUsd = prices?.[fromId]?.usd;

    const toUsd = prices?.[toId]?.usd;

    if (
      typeof fromUsd !== "number" ||
      typeof toUsd !== "number" ||
      fromUsd <= 0 ||
      toUsd <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Live price data is unavailable.",
        },
        { status: 502 },
      );
    }

    const rate = fromUsd / toUsd;

    return NextResponse.json({
      success: true,
      from,
      to,
      fromUsd,
      toUsd,
      rate,
      source: "CoinGecko",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("SWAP RATE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve live Swap rate.",
      },
      { status: 500 },
    );
  }
}
