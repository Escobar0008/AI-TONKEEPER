import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("ai-tonkeeper-user")?.value;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Utilisateur non connecté.",
        },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },

      include: {
        wallet: true,

        balances: {
          orderBy: {
            coin: "asc",
          },
        },

        transactions: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Utilisateur introuvable.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        walletId: user.wallet?.walletId ?? null,
        active: user.wallet?.active ?? false,
      },

      balances: user.balances,

      transactions: user.transactions,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur.",
      },
      { status: 500 }
    );
  }
}