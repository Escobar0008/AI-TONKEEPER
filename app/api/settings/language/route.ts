import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";

const SUPPORTED_LANGUAGES = [
  "English",
  "Français",
  "Español",
  "Deutsch",
] as const;

type SupportedLanguage =
  (typeof SUPPORTED_LANGUAGES)[number];

const DEFAULT_LANGUAGE: SupportedLanguage = "English";

const LANGUAGE_COOKIE = "ai_tonkeeper_language";

function isSupportedLanguage(
  value: unknown,
): value is SupportedLanguage {
  return (
    typeof value === "string" &&
    SUPPORTED_LANGUAGES.includes(
      value as SupportedLanguage,
    )
  );
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

    const cookieLanguage = request.cookies.get(
      LANGUAGE_COOKIE,
    )?.value;

    const language = isSupportedLanguage(cookieLanguage)
      ? cookieLanguage
      : DEFAULT_LANGUAGE;

    return NextResponse.json({
      success: true,
      language,
      supportedLanguages: SUPPORTED_LANGUAGES,
    });
  } catch (error) {
    console.error("LANGUAGE_GET_API_ERROR:", error);

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
      body === null ||
      !("language" in body)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Language is required.",
        },
        { status: 400 },
      );
    }

    const language = (
      body as { language?: unknown }
    ).language;

    if (!isSupportedLanguage(language)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unsupported language.",
          supportedLanguages: SUPPORTED_LANGUAGES,
        },
        { status: 400 },
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Language updated successfully.",
      language,
    });

    response.cookies.set({
      name: LANGUAGE_COOKIE,
      value: language,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  } catch (error) {
    console.error("LANGUAGE_PUT_API_ERROR:", error);

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