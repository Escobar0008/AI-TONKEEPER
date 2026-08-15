import { NextRequest, NextResponse } from "next/server";
import { runAITradingCycle } from "@/lib/ai-trading/runner";

function unauthorized() {
  return NextResponse.json(
    {
      success: false,
      message: "Unauthorized.",
    },
    { status: 401 }
  );
}

function getCronSecret(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return null;
  }

  if (!authorization.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice(7).trim();
}

export async function POST(request: NextRequest) {
  try {
    const expectedSecret =
      process.env.AI_TRADING_CRON_SECRET;

    if (!expectedSecret) {
      console.error(
        "AI_TRADING_CRON_SECRET is not configured."
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "AI Trading runner is not configured.",
        },
        { status: 500 }
      );
    }

    const providedSecret =
      getCronSecret(request);

    if (
      !providedSecret ||
      providedSecret !== expectedSecret
    ) {
      return unauthorized();
    }

    const result =
      await runAITradingCycle();

    return NextResponse.json(
      {
        success: result.success,
        message:
          "AI Trading cycle completed.",
        result,
      },
      { status: result.success ? 200 : 500 }
    );
  } catch (error) {
    console.error(
      "AI TRADING RUN ROUTE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to run AI Trading cycle.",
      },
      { status: 500 }
    );
  }
}