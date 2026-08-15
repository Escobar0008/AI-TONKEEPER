import { NextRequest, NextResponse } from "next/server";

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
  const authorization =
    request.headers.get("authorization");

  if (!authorization) {
    return null;
  }

  if (!authorization.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice(7).trim();
}

/*
|--------------------------------------------------------------------------
| AI TONKEEPER — SIMULATION RUNNER
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| This endpoint NO LONGER starts the real AI Trading engine.
|
| It does NOT:
| - call runner.ts
| - create Bybit orders
| - buy assets
| - sell assets
| - open real positions
| - close real positions
|
| The endpoint only confirms that the AI Trading cycle was
| requested and returns a simulated result for the interface.
|
|--------------------------------------------------------------------------
*/

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
            "AI Trading simulation runner is not configured.",
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

    /*
    |--------------------------------------------------------------------------
    | SIMULATED CYCLE
    |--------------------------------------------------------------------------
    |
    | Nothing is executed here.
    |
    */

    const result = {
      success: true,

      mode: "SIMULATION",

      executed: false,

      tradesCreated: 0,

      tradesExecuted: 0,

      ordersCreated: 0,

      ordersExecuted: 0,

      positionsOpened: 0,

      positionsClosed: 0,

      message:
        "AI Trading cycle simulated successfully. No real trade was executed.",

      timestamp:
        new Date().toISOString(),
    };

    console.log(
      "AI TRADING SIMULATION CYCLE:",
      result
    );

    return NextResponse.json(
      {
        success: true,

        message:
          "AI Trading simulation cycle completed.",

        result,
      },
      { status: 200 }
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
          "Unable to run AI Trading simulation cycle.",
      },
      { status: 500 }
    );
  }
}