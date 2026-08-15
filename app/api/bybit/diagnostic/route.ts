import { NextResponse } from "next/server";

export async function GET() {
  try {
    const baseUrl =
      process.env.BYBIT_BASE_URL ||
      "https://api.bybit.com";

    const url =
      `${baseUrl}/v5/market/tickers` +
      `?category=spot&symbol=BTCUSDT`;

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    const text = await response.text();

    return NextResponse.json({
      success: response.ok,
      httpStatus: response.status,
      httpStatusText: response.statusText,
      bybitResponse: text,
      baseUrl,
    });
  } catch (error) {
    console.error(
      "BYBIT_DIAGNOSTIC_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}