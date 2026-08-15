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

    /*
     * Supprime tous les appareils enregistrés pour l'utilisateur.
     * Le prochain appareil/session devra donc être réenregistré.
     */
    await prisma.$transaction([
      prisma.securityDevice.deleteMany({
        where: {
          userId: user.id,
        },
      }),

      prisma.securityLog.create({
        data: {
          userId: user.id,
          action: "LOGOUT_ALL",
          description: "Toutes les sessions/appareils de sécurité ont été déconnectés.",
          ipAddress: getClientIp(request),
          userAgent: request.headers.get("user-agent"),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Toutes les sessions ont été déconnectées.",
    });
  } catch (error) {
    console.error("LOGOUT_ALL_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Impossible de déconnecter toutes les sessions.",
      },
      { status: 500 },
    );
  }
}