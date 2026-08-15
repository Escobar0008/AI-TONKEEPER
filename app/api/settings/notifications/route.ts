import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";

const PUSH_COOKIE = "ai_tonkeeper_push_notifications";
const EMAIL_COOKIE = "ai_tonkeeper_email_alerts";

function parseBoolean(
  value: unknown,
): boolean | null {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return null;
}

// ============================================================
// GET
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be logged in.",
        },
        { status: 401 },
      );
    }

    const pushCookie = request.cookies.get(
      PUSH_COOKIE,
    )?.value;

    const emailCookie = request.cookies.get(
      EMAIL_COOKIE,
    )?.value;

    const pushNotifications =
      pushCookie === undefined
        ? true
        : pushCookie === "true";

    const emailAlerts =
      emailCookie === undefined
        ? true
        : emailCookie === "true";

    return NextResponse.json({
      success: true,
      notifications: {
        pushNotifications,
        emailAlerts,
      },
    });
  } catch (error) {
    console.error(
      "NOTIFICATION_SETTINGS_GET_ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "A server error occurred. Please try again.",
      },
      { status: 500 },
    );
  }
}

// ============================================================
// PUT
// ============================================================

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be logged in.",
        },
        { status: 401 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON body.",
        },
        { status: 400 },
      );
    }

    if (
      typeof body !== "object" ||
      body === null
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 },
      );
    }

    const data = body as {
      pushNotifications?: unknown;
      emailAlerts?: unknown;
    };

    const hasPush =
      data.pushNotifications !== undefined;

    const hasEmail =
      data.emailAlerts !== undefined;

    if (!hasPush && !hasEmail) {
      return NextResponse.json(
        {
          success: false,
          message:
            "At least one notification setting is required.",
        },
        { status: 400 },
      );
    }

    const responseData: {
      pushNotifications?: boolean;
      emailAlerts?: boolean;
    } = {};

    const response = NextResponse.json({
      success: true,
      message:
        "Notification settings updated successfully.",
      notifications: responseData,
    });

    // --------------------------------------------------------
    // PUSH
    // --------------------------------------------------------

    if (hasPush) {
      const pushValue = parseBoolean(
        data.pushNotifications,
      );

      if (pushValue === null) {
        return NextResponse.json(
          {
            success: false,
            message:
              "pushNotifications must be a boolean.",
          },
          { status: 400 },
        );
      }

      responseData.pushNotifications = pushValue;

      response.cookies.set({
        name: PUSH_COOKIE,
        value: String(pushValue),
        httpOnly: true,
        secure:
          process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    // --------------------------------------------------------
    // EMAIL
    // --------------------------------------------------------

    if (hasEmail) {
      const emailValue = parseBoolean(
        data.emailAlerts,
      );

      if (emailValue === null) {
        return NextResponse.json(
          {
            success: false,
            message:
              "emailAlerts must be a boolean.",
          },
          { status: 400 },
        );
      }

      responseData.emailAlerts = emailValue;

      response.cookies.set({
        name: EMAIL_COOKIE,
        value: String(emailValue),
        httpOnly: true,
        secure:
          process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    return NextResponse.json({
      success: true,
      message:
        "Notification settings updated successfully.",
      notifications: responseData,
    });
  } catch (error) {
    console.error(
      "NOTIFICATION_SETTINGS_PUT_ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "A server error occurred. Please try again.",
      },
      { status: 500 },
    );
  }
}