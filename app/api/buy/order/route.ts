import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

const allowedAssets = ["TON", "BTC", "ETH", "BNB", "USDT"];
const allowedCurrencies = ["USD", "EUR", "GBP"];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { asset, currency, amount } = body;

    if (!allowedAssets.includes(asset)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unsupported cryptocurrency.",
        },
        { status: 400 }
      );
    }

    if (!allowedCurrencies.includes(currency)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unsupported payment currency.",
        },
        { status: 400 }
      );
    }

    if (
      typeof amount !== "number" ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid purchase amount.",
        },
        { status: 400 }
      );
    }

    const orderId = `ATK-${Date.now()}-${randomUUID()
      .replace(/-/g, "")
      .slice(0, 8)
      .toUpperCase()}`;

    return NextResponse.json({
      success: true,
      orderId,
      asset,
      currency,
      amount,
      status: "CREATED",
    });
  } catch (error) {
    console.error("BUY ORDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create purchase order.",
      },
      { status: 500 }
    );
  }
}