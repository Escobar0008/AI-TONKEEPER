import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Adresse e-mail requise.",
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
          message: "Aucun compte trouvé avec cette adresse e-mail.",
        },
        { status: 404 }
      );
    }

    const resetCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    await prisma.user.update({
      where: {
        email,
      },
      data: {
        verificationCode: resetCode,
        verificationSent: new Date(),
      },
    });

    await resend.emails.send({
      from: "AI TONKEEPER <onboarding@resend.dev>",
      to: email,
      subject: "Réinitialisation du mot de passe AI TONKEEPER",
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px">
          <h2>Réinitialisation du mot de passe</h2>

          <p>Votre code de vérification est :</p>

          <h1 style="font-size:40px;letter-spacing:8px;color:#06b6d4;">
            ${resetCode}
          </h1>

          <p>Ce code expire dans quelques minutes.</p>

          <p>
            Si vous n'avez pas demandé cette réinitialisation,
            ignorez cet e-mail.
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Code envoyé avec succès.",
    });
  } catch (error: unknown) {
    console.error(error);

    const message =
      error instanceof Error
        ? error.message
        : "Erreur serveur.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}