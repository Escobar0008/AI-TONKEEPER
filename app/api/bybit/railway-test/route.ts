import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl =
    process.env.BYBIT_BASE_URL ||
    "https://api.bytick.com";

  const url =
    `${baseUrl}/v5/market/tickers` +
    `?category=spot&symbol=BTCUSDT`;

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    const text = await response.text();

    return NextResponse.json({
      success: response.ok,
      httpStatus: response.status,
      httpStatusText: response.statusText,
      baseUrl,
      bybitResponse: text,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        baseUrl,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}
