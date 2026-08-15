import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  AITradeStrategy,
  AIRiskLevel,
} from "@prisma/client";

function isStrategy(
  value: unknown
): value is AITradeStrategy {
  return (
    value === "CONSERVATIVE" ||
    value === "BALANCED" ||
    value === "AGGRESSIVE"
  );
}

function isRiskLevel(
  value: unknown
): value is AIRiskLevel {
  return (
    value === "LOW" ||
    value === "MEDIUM" ||
    value === "HIGH"
  );
}

function isValidPercentage(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 100
  );
}

async function getAuthenticatedUserId() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return String(session.user.id);
}

/*
|--------------------------------------------------------------------------
| GET /api/ai-trade/settings
|--------------------------------------------------------------------------
|
| AI Trading settings are kept for the interface and configuration.
|
| IMPORTANT:
|
| These settings do NOT authorize real Bybit trading.
|
| The AI Trading system is currently simulation/display only.
|
|--------------------------------------------------------------------------
*/

export async function GET() {
  try {
    const userId =
      await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Authentication required.",
        },
        { status: 401 }
      );
    }

    const settings =
      await prisma.aITradeSettings.findUnique({
        where: {
          userId,
        },
      });

    if (!settings) {
      const newSettings =
        await prisma.aITradeSettings.create({
          data: {
            userId,

            strategy:
              AITradeStrategy.BALANCED,

            riskLevel:
              AIRiskLevel.MEDIUM,

            minimumConfidence: 70,

            maximumTradeAllocation: 10,

            stopLossProtection: true,

            dailyLossProtection: true,

            emergencyStop: true,

            enabled: false,
          },
        });

      return NextResponse.json({
        success: true,
        settings: newSettings,
      });
    }

    return NextResponse.json({
      success: true,
      settings: {
        ...settings,

        /*
        |------------------------------------------------------------------
        | Simulation mode
        |------------------------------------------------------------------
        |
        | The interface can still display its ACTIVE/PAUSED/STOPPED
        | states, but the backend never uses this setting to authorize
        | real exchange orders.
        |
        */
        enabled: settings.enabled,
      },
    });
  } catch (error) {
    console.error(
      "AI TRADE SETTINGS GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load AI Trade settings.",
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| POST /api/ai-trade/settings
|--------------------------------------------------------------------------
|
| Saves AI Trading interface settings.
|
| IMPORTANT:
|
| `enabled` is accepted for UI state compatibility only.
|
| It does NOT activate real trading.
|
|--------------------------------------------------------------------------
*/

export async function POST(
  request: NextRequest
) {
  try {
    const userId =
      await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Authentication required.",
        },
        { status: 401 }
      );
    }

    let body: Record<
      string,
      unknown
    >;

    try {
      body =
        (await request.json()) as Record<
          string,
          unknown
        >;
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid request body.",
        },
        { status: 400 }
      );
    }

    if (
      !body ||
      typeof body !== "object"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid request body.",
        },
        { status: 400 }
      );
    }

    const data: {
      strategy?: AITradeStrategy;
      riskLevel?: AIRiskLevel;
      minimumConfidence?: number;
      maximumTradeAllocation?: number;
      stopLossProtection?: boolean;
      dailyLossProtection?: boolean;
      emergencyStop?: boolean;
      enabled?: boolean;
    } = {};

    /*
    |--------------------------------------------------------------------------
    | Strategy
    |--------------------------------------------------------------------------
    */

    if (
      body.strategy !== undefined
    ) {
      if (
        !isStrategy(
          body.strategy
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid strategy. Use CONSERVATIVE, BALANCED or AGGRESSIVE.",
          },
          { status: 400 }
        );
      }

      data.strategy =
        body.strategy;
    }

    /*
    |--------------------------------------------------------------------------
    | Risk Level
    |--------------------------------------------------------------------------
    */

    if (
      body.riskLevel !== undefined
    ) {
      if (
        !isRiskLevel(
          body.riskLevel
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid risk level. Use LOW, MEDIUM or HIGH.",
          },
          { status: 400 }
        );
      }

      data.riskLevel =
        body.riskLevel;
    }

    /*
    |--------------------------------------------------------------------------
    | Minimum Confidence
    |--------------------------------------------------------------------------
    */

    if (
      body.minimumConfidence !==
      undefined
    ) {
      const confidence =
        Number(
          body.minimumConfidence
        );

      if (
        !isValidPercentage(
          confidence
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Minimum AI confidence must be between 0 and 100.",
          },
          { status: 400 }
        );
      }

      data.minimumConfidence =
        confidence;
    }

    /*
    |--------------------------------------------------------------------------
    | Maximum Trade Allocation
    |--------------------------------------------------------------------------
    */

    if (
      body.maximumTradeAllocation !==
      undefined
    ) {
      const allocation =
        Number(
          body.maximumTradeAllocation
        );

      if (
        !isValidPercentage(
          allocation
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Maximum trade allocation must be between 0 and 100.",
          },
          { status: 400 }
        );
      }

      data.maximumTradeAllocation =
        allocation;
    }

    /*
    |--------------------------------------------------------------------------
    | Stop Loss Protection
    |--------------------------------------------------------------------------
    */

    if (
      body.stopLossProtection !==
      undefined
    ) {
      if (
        typeof body.stopLossProtection !==
        "boolean"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "stopLossProtection must be true or false.",
          },
          { status: 400 }
        );
      }

      data.stopLossProtection =
        body.stopLossProtection;
    }

    /*
    |--------------------------------------------------------------------------
    | Daily Loss Protection
    |--------------------------------------------------------------------------
    */

    if (
      body.dailyLossProtection !==
      undefined
    ) {
      if (
        typeof body.dailyLossProtection !==
        "boolean"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "dailyLossProtection must be true or false.",
          },
          { status: 400 }
        );
      }

      data.dailyLossProtection =
        body.dailyLossProtection;
    }

    /*
    |--------------------------------------------------------------------------
    | Emergency Stop
    |--------------------------------------------------------------------------
    */

    if (
      body.emergencyStop !==
      undefined
    ) {
      if (
        typeof body.emergencyStop !==
        "boolean"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "emergencyStop must be true or false.",
          },
          { status: 400 }
        );
      }

      data.emergencyStop =
        body.emergencyStop;
    }

    /*
    |--------------------------------------------------------------------------
    | Enabled
    |--------------------------------------------------------------------------
    |
    | Kept for compatibility with the existing UI.
    |
    | It DOES NOT enable real trading.
    |
    */

    if (
      body.enabled !== undefined
    ) {
      if (
        typeof body.enabled !==
        "boolean"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "enabled must be true or false.",
          },
          { status: 400 }
        );
      }

      data.enabled =
        body.enabled;
    }

    /*
    |--------------------------------------------------------------------------
    | Nothing to update
    |--------------------------------------------------------------------------
    */

    if (
      Object.keys(data).length ===
      0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No valid settings were provided.",
        },
        { status: 400 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE / UPDATE
    |--------------------------------------------------------------------------
    */

    const settings =
      await prisma.aITradeSettings.upsert({
        where: {
          userId,
        },

        create: {
          userId,

          strategy:
            data.strategy ??
            AITradeStrategy.BALANCED,

          riskLevel:
            data.riskLevel ??
            AIRiskLevel.MEDIUM,

          minimumConfidence:
            data.minimumConfidence ??
            70,

          maximumTradeAllocation:
            data.maximumTradeAllocation ??
            10,

          stopLossProtection:
            data.stopLossProtection ??
            true,

          dailyLossProtection:
            data.dailyLossProtection ??
            true,

          emergencyStop:
            data.emergencyStop ??
            true,

          enabled:
            data.enabled ??
            false,
        },

        update: data,
      });

    return NextResponse.json({
      success: true,

      message:
        "AI Trade settings saved.",

      settings,
    });
  } catch (error) {
    console.error(
      "AI TRADE SETTINGS POST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to save AI Trade settings.",
      },
      { status: 500 }
    );
  }
}