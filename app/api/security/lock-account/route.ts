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
      return NextResponse.json({
        success: true,
        locked: true,
        message: "Le compte est déjà verrouillé.",
      });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          accountLocked: true,
        },
      }),

      prisma.securityLog.create({
        data: {
          userId: user.id,
          action: "ACCOUNT_LOCKED",
          description: "Le compte a été verrouillé par l'utilisateur.",
          ipAddress: getClientIp(request),
          userAgent: request.headers.get("user-agent"),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      locked: true,
      message: "Compte verrouillé avec succès.",
    });
  } catch (error) {
    console.error("LOCK_ACCOUNT_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Impossible de verrouiller le compte.",
      },
      { status: 500 },
    );
  }
}