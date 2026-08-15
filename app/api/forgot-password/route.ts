import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/resend";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Adresse e-mail requise.",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Aucun compte trouvÃ© avec cette adresse e-mail.",
        },
        { status: 404 }
      );
    }

    const resetCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    await prisma.user.update({
      where: {
        email: normalizedEmail,
      },
      data: {
        verificationCode: resetCode,
        verificationSent: new Date(),
      },
    });

    await getResend().emails.send({
      from: "AI TONKEEPER <security@ai-tonkeeper.xyz>",
      to: normalizedEmail,
      subject:
        "RÃ©initialisation du mot de passe AI TONKEEPER",
      html: `
        <div style="
          font-family:Arial,Helvetica,sans-serif;
          padding:20px;
          background:#050B18;
          color:#ffffff;
        ">

          <div style="
            max-width:600px;
            margin:0 auto;
            padding:30px;
            background:#101A2C;
            border:1px solid #1e293b;
            border-radius:20px;
          ">

            <h2 style="
              color:#22d3ee;
              margin-top:0;
            ">
              AI TONKEEPER
            </h2>

            <h3>
              RÃ©initialisation du mot de passe
            </h3>

            <p style="color:#cbd5e1;">
              Votre code de vÃ©rification est :
            </p>

            <div style="
              margin:25px 0;
              padding:20px;
              text-align:center;
              background:#050B18;
              border:1px solid #0891b2;
              border-radius:16px;
            ">

              <span style="
                font-size:40px;
                font-weight:bold;
                letter-spacing:8px;
                color:#22d3ee;
              ">
                ${resetCode}
              </span>

            </div>

            <p style="color:#94a3b8;">
              Ce code expire dans quelques minutes.
            </p>

            <p style="
              color:#64748b;
              font-size:13px;
            ">
              Si vous n'avez pas demandÃ© cette
              rÃ©initialisation, ignorez cet e-mail.
            </p>

          </div>

        </div>
      `,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Code envoyÃ© avec succÃ¨s.",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error(
      "FORGOT PASSWORD ERROR:",
      error
    );

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
