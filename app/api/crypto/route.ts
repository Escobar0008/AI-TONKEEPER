import { NextRequest, NextResponse } from "next/server";

const coinMap: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  TON: "the-open-network",
  GRAM: "the-open-network",
  SOL: "solana",
  BNB: "binancecoin",
  XRP: "ripple",
};

export async function GET(request: NextRequest) {
  try {
    const coin = request.nextUrl.searchParams
      .get("coin")
      ?.toUpperCase();

    if (!coin || !coinMap[coin]) {
      return NextResponse.json(
        {
          success: false,
          message: "Crypto non supportée.",
        },
        { status: 400 }
      );
    }

    const id = coinMap[coin];

    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`,
      {
        next: {
          revalidate: 30,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Impossible de récupérer le prix.",
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const price =
      data.market_data.current_price.usd;

    const change24h =
      data.market_data.price_change_percentage_24h;

    const marketCap =
      data.market_data.market_cap.usd;

    let trend = "Bearish";
    let recommendation = "SELL";

    if (change24h >= 5) {
      trend = "Bullish";
      recommendation = "STRONG BUY";
    } else if (change24h >= 0) {
      trend = "Bullish";
      recommendation = "BUY";
    }

    return NextResponse.json({
      success: true,
      coin,
      name: data.name,
      symbol: data.symbol.toUpperCase(),
      price,
      change24h,
      marketCap,
      trend,
      recommendation,
    });
  } catch (error) {
    console.error("CRYPTO API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur.",
      },
      { status: 500 }
    );
  }
}