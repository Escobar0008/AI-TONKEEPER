import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=the-open-network,bitcoin,ethereum,binancecoin&vs_currencies=usd&include_24hr_change=true",
      {
        next: {
          revalidate: 60,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Unable to fetch market data");
    }

    const data = await response.json();

    return NextResponse.json({
      TON: data["the-open-network"],
      BTC: data["bitcoin"],
      ETH: data["ethereum"],
      BNB: data["binancecoin"],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        TON: null,
        BTC: null,
        ETH: null,
        BNB: null,
      },
      {
        status: 500,
      }
    );
  }
}