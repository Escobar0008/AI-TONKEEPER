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
      where: {
        email,
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

    if (user.emailVerified) {
      return NextResponse.json(
        {
          success: true,
          message: "Votre e-mail est déjà vérifié.",
        },
        { status: 200 }
      );
    }

    if (user.verificationCode !== code) {
      return NextResponse.json(
        {
          success: false,
          message: "Code de vérification incorrect.",
        },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: {
        email,
      },
      data: {
        emailVerified: true,
        verificationCode: null,
        verificationSent: null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Adresse e-mail vérifiée avec succès.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);

   return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur.",
      },
      { status: 500 }
    );
  }
}