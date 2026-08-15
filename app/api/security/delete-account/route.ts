import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getUserId(request: Request): string | null {
  const userId = request.headers.get("x-user-id");

  if (!userId || userId.trim().length === 0) {
    return null;
  }

  return userId.trim();
}

function getClientIp(request: Request): string | null {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip")
  );
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
      where: {
        id: userId,
      },
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
          message:
            "Votre compte est verrouillé. Impossible de continuer.",
        },
        { status: 403 },
      );
    }

    let body: {
      action?: string;
    } = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    if (body.action !== "request") {
      return NextResponse.json(
        {
          success: false,
          message: "Action invalide.",
        },
        { status: 400 },
      );
    }

    await prisma.securityLog.create({
      data: {
        userId: user.id,
        action: "ACCOUNT_DELETION_REQUESTED",
        description:
          "Une demande de suppression définitive du compte a été effectuée.",
        ipAddress: getClientIp(request),
        userAgent: request.headers.get("user-agent"),
      },
    });

    return NextResponse.json({
      success: true,
      requiresConfirmation: true,
      message:
        "La demande de suppression du compte a été enregistrée. Une confirmation supplémentaire est nécessaire avant la suppression définitive.",
    });
  } catch (error) {
    console.error("DELETE_ACCOUNT_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Impossible de démarrer la procédure de suppression du compte.",
      },
      { status: 500 },
    );
  }
}