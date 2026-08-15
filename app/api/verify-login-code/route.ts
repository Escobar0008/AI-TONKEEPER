import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        {
          success: false,
          message: "Email et code requis.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        wallet: true,
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

    if (!user.verificationCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Aucun code de connexion actif.",
        },
        { status: 400 }
      );
    }

    if (user.verificationCode !== code) {
      return NextResponse.json(
        {
          success: false,
          message: "Code de connexion incorrect.",
        },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        verificationCode: null,
        verificationSent: null,
      },
    });

    const response = NextResponse.json({
      success: true,
      message: "Connexion vérifiée avec succès.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        walletId: user.wallet?.walletId ?? null,
      },
    });

    /*
     * Session AI TONKEEPER
     */
    response.cookies.set("ai-tonkeeper-user", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("VERIFY LOGIN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur.",
      },
      { status: 500 }
    );
  }
}