import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getUserId(request: Request): string | null {
  const userId = request.headers.get("x-user-id");

  if (!userId || userId.trim().length === 0) {
    return null;
  }

  return userId.trim();
}

export async function GET(request: Request) {
  try {
    const userId = getUserId(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Utilisateur non authentifié.",
        },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Utilisateur introuvable.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      enabled: false,
      supported: true,
    });
  } catch (error) {
    console.error("BIOMETRIC_GET_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Impossible de récupérer le statut biométrique.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = getUserId(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Utilisateur non authentifié.",
        },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        accountLocked: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Utilisateur introuvable.",
        },
        { status: 404 },
      );
    }

    if (user.accountLocked) {
      return NextResponse.json(
        {
          success: false,
          message: "Le compte est verrouillé.",
        },
        { status: 403 },
      );
    }

    let body: { enabled?: boolean } = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const enabled = body.enabled;

    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "Le champ 'enabled' doit être un booléen.",
        },
        { status: 400 },
      );
    }

    await prisma.securityLog.create({
      data: {
        userId: user.id,
        action: enabled ? "BIOMETRIC_ENABLED" : "BIOMETRIC_DISABLED",
        description: enabled
          ? "La biométrie a été activée."
          : "La biométrie a été désactivée.",
        ipAddress:
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          request.headers.get("x-real-ip"),
        userAgent: request.headers.get("user-agent"),
      },
    });

    return NextResponse.json({
      success: true,
      enabled,
      message: enabled
        ? "Biométrie activée."
        : "Biométrie désactivée.",
    });
  } catch (error) {
    console.error("BIOMETRIC_POST_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Impossible de modifier la biométrie.",
      },
      { status: 500 },
    );
  }
}