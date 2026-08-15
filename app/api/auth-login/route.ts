import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/resend";

function generateLoginCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email et mot de passe requis.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 1. RECHERCHER L'UTILISATEUR
    // ============================================================

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        emailVerified: true,
        accountLocked: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Email ou mot de passe incorrect.",
        },
        { status: 401 }
      );
    }

    // ============================================================
    // 2. VÃ‰RIFIER SI LE COMPTE EST VERROUILLÃ‰
    // ============================================================

    if (user.accountLocked) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Votre compte est temporairement verrouillÃ©.",
        },
        { status: 403 }
      );
    }

    // ============================================================
    // 3. VÃ‰RIFIER LE MOT DE PASSE
    // ============================================================

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Email ou mot de passe incorrect.",
        },
        { status: 401 }
      );
    }

    // ============================================================
    // 4. VÃ‰RIFIER L'ADRESSE E-MAIL
    // ============================================================

    if (!user.emailVerified) {
      return NextResponse.json(
        {
          success: false,
          requiresEmailVerification: true,
          message:
            "Veuillez vÃ©rifier votre adresse e-mail avant de vous connecter.",
        },
        { status: 403 }
      );
    }

    // ============================================================
    // 5. GÃ‰NÃ‰RER UN NOUVEAU CODE DE CONNEXION
    // ============================================================

    const loginCode = generateLoginCode();
    const verificationSent = new Date();

    // ============================================================
    // 6. STOCKER LE CODE
    // ============================================================

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        verificationCode: loginCode,
        verificationSent,
      },
    });

    // ============================================================
    // 7. INITIALISER RESEND UNIQUEMENT ICI
    // ============================================================

    const resend = getResend();

    // ============================================================
    // 8. ENVOYER LE CODE PAR E-MAIL
    // ============================================================

    const emailResult = await getResend().emails.send({
      from: "AI TONKEEPER <security@ai-tonkeeper.xyz>",

      to: [user.email],

      subject: "Votre code de connexion AI TONKEEPER",

      html: `
        <!DOCTYPE html>
        <html lang="fr">
          <body style="
            margin:0;
            padding:0;
            background:#050B18;
            font-family:Arial,Helvetica,sans-serif;
            color:#ffffff;
          ">

            <div style="
              max-width:600px;
              margin:0 auto;
              padding:40px 20px;
            ">

              <div style="
                background:#101A2C;
                border:1px solid #1e293b;
                border-radius:20px;
                padding:32px;
                text-align:center;
              ">

                <h1 style="
                  margin:0 0 10px;
                  color:#22d3ee;
                  font-size:28px;
                ">
                  AI TONKEEPER
                </h1>

                <p style="
                  margin:0 0 30px;
                  color:#94a3b8;
                  font-size:14px;
                ">
                  Secure TON Wallet â€¢ AI Powered
                </p>

                <h2 style="
                  color:#ffffff;
                ">
                  Code de connexion
                </h2>

                <p style="
                  color:#cbd5e1;
                  font-size:15px;
                  line-height:1.6;
                ">
                  Bonjour ${user.name || "Utilisateur"},
                </p>

                <p style="
                  color:#cbd5e1;
                  font-size:15px;
                  line-height:1.6;
                ">
                  Utilisez le code ci-dessous pour confirmer
                  votre connexion Ã  AI TONKEEPER.
                </p>

                <div style="
                  margin:30px 0;
                  padding:20px;
                  background:#050B18;
                  border:1px solid #0891b2;
                  border-radius:16px;
                ">

                  <span style="
                    color:#22d3ee;
                    font-size:40px;
                    font-weight:bold;
                    letter-spacing:8px;
                  ">
                    ${loginCode}
                  </span>

                </div>

                <p style="
                  color:#94a3b8;
                  font-size:13px;
                ">
                  Ce code expire dans 10 minutes.
                </p>

                <p style="
                  margin-top:25px;
                  color:#64748b;
                  font-size:12px;
                ">
                  Si vous n'Ãªtes pas Ã  l'origine de cette
                  tentative de connexion, ignorez cet e-mail.
                </p>

              </div>

              <p style="
                margin-top:20px;
                text-align:center;
                color:#475569;
                font-size:12px;
              ">
                Â© 2026 AI TONKEEPER
              </p>

            </div>

          </body>
        </html>
      `,
    });

    // ============================================================
    // 9. VÃ‰RIFIER L'ENVOI
    // ============================================================

    if (emailResult.error) {
      console.error(
        "AUTH LOGIN RESEND ERROR:",
        emailResult.error
      );

      // Supprimer le code si l'e-mail n'a pas Ã©tÃ© envoyÃ©.

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          verificationCode: null,
          verificationSent: null,
        },
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "Impossible d'envoyer le code par e-mail.",
        },
        { status: 500 }
      );
    }

    // ============================================================
    // 10. SUCCÃˆS
    // ============================================================

    return NextResponse.json(
      {
        success: true,
        requiresLoginVerification: true,
        message:
          "Code de connexion envoyÃ© avec succÃ¨s.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "========== AUTH LOGIN ERROR =========="
    );

    console.error(error);

    console.error(
      "======================================"
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Une erreur serveur est survenue.",
      },
      { status: 500 }
    );
  }
}
