import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getResend } from "@/lib/resend";
import crypto from "crypto";

const CODE_EXPIRATION_MS = 10 * 60 * 1000;

function generateVerificationCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

function getClientIp(request: NextRequest): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  return (
    forwardedFor?.split(",")[0]?.trim() ||
    realIp ||
    null
  );
}

export async function POST(request: NextRequest) {
  try {
    const resend = getResend();

    // ============================================================
    // 1. VÃ©rifier la session
    // ============================================================

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Vous devez Ãªtre connectÃ©.",
        },
        { status: 401 }
      );
    }

    const userId = String(session.user.id);

    // ============================================================
    // 2. Lire la requÃªte
    // ============================================================

    const body = await request.json();

    const action = String(body.action ?? "").trim();

    const newEmail = String(body.newEmail ?? "")
      .trim()
      .toLowerCase();

    const code = String(body.code ?? "").trim();

    // ============================================================
    // 3. VÃ©rifier l'utilisateur
    // ============================================================

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        verificationCode: true,
        verificationSent: true,
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

    // ============================================================
    // 4. VÃ©rification du nouvel e-mail
    // ============================================================

    if (!newEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "Nouvelle adresse e-mail requise.",
        },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: "Adresse e-mail invalide.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 5. VÃ©rifier que le nouvel e-mail est diffÃ©rent
    // ============================================================

    if (user.email.toLowerCase() === newEmail) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cette adresse e-mail est dÃ©jÃ  utilisÃ©e par votre compte.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 6. VÃ©rifier que le nouvel e-mail n'est pas dÃ©jÃ  utilisÃ©
    // ============================================================

    const existingUser = await prisma.user.findUnique({
      where: {
        email: newEmail,
      },
      select: {
        id: true,
      },
    });

    if (existingUser && existingUser.id !== userId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cette adresse e-mail est dÃ©jÃ  associÃ©e Ã  un autre compte.",
        },
        { status: 409 }
      );
    }

    // ============================================================
    // ACTION 1 : ENVOYER LE CODE Ã€ L'ANCIEN E-MAIL
    // ============================================================

    if (action === "send") {
      const verificationCode =
        generateVerificationCode();

      const verificationSent = new Date();

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          verificationCode,
          verificationSent,
        },
      });

      const emailResult =
        await getResend().emails.send({
          from: "AI TONKEEPER <security@ai-tonkeeper.xyz>",
          to: [user.email],
          subject:
            "Code de sÃ©curitÃ© - Changement d'adresse e-mail",
          html: `
            <!DOCTYPE html>
            <html lang="fr">
              <head>
                <meta charset="UTF-8" />
                <meta
                  name="viewport"
                  content="width=device-width, initial-scale=1.0"
                />
                <title>AI TONKEEPER</title>
              </head>

              <body
                style="
                  margin:0;
                  padding:0;
                  background:#050B18;
                  font-family:Arial,Helvetica,sans-serif;
                  color:#ffffff;
                "
              >
                <div
                  style="
                    max-width:600px;
                    margin:0 auto;
                    padding:40px 20px;
                  "
                >
                  <div
                    style="
                      background:#101A2C;
                      border:1px solid #1e293b;
                      border-radius:20px;
                      padding:32px;
                      text-align:center;
                    "
                  >
                    <h1
                      style="
                        margin:0 0 10px;
                        color:#22d3ee;
                        font-size:28px;
                      "
                    >
                      AI TONKEEPER
                    </h1>

                    <p
                      style="
                        margin:0 0 30px;
                        color:#94a3b8;
                        font-size:14px;
                      "
                    >
                      Secure TON Wallet â€¢ AI Powered
                    </p>

                    <h2
                      style="
                        margin:0 0 20px;
                        color:#ffffff;
                      "
                    >
                      Code de sÃ©curitÃ©
                    </h2>

                    <p
                      style="
                        color:#cbd5e1;
                        font-size:15px;
                        line-height:1.6;
                      "
                    >
                      Une demande de changement d'adresse
                      e-mail a Ã©tÃ© effectuÃ©e sur votre compte.
                    </p>

                    <p
                      style="
                        color:#cbd5e1;
                        font-size:15px;
                        line-height:1.6;
                      "
                    >
                      Pour confirmer que cette demande vient
                      bien de vous, utilisez le code suivant :
                    </p>

                    <div
                      style="
                        margin:30px 0;
                        padding:20px;
                        background:#050B18;
                        border:1px solid #0891b2;
                        border-radius:16px;
                      "
                    >
                      <span
                        style="
                          color:#22d3ee;
                          font-size:40px;
                          font-weight:bold;
                          letter-spacing:8px;
                        "
                      >
                        ${verificationCode}
                      </span>
                    </div>

                    <p
                      style="
                        color:#94a3b8;
                        font-size:13px;
                      "
                    >
                      Ce code est valable pendant 10 minutes.
                    </p>

                    <p
                      style="
                        margin-top:25px;
                        color:#64748b;
                        font-size:12px;
                      "
                    >
                      Si vous n'Ãªtes pas Ã  l'origine de cette
                      demande, sÃ©curisez immÃ©diatement votre compte.
                    </p>
                  </div>

                  <p
                    style="
                      margin-top:20px;
                      text-align:center;
                      color:#475569;
                      font-size:12px;
                    "
                  >
                    Â© 2026 AI TONKEEPER
                  </p>
                </div>
              </body>
            </html>
          `,
        });

      if (emailResult.error) {
        console.error(
          "CHANGE_EMAIL_RESEND_ERROR:",
          emailResult.error
        );

        await prisma.user.update({
          where: {
            id: userId,
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
              "Impossible d'envoyer le code de vÃ©rification.",
          },
          { status: 500 }
        );
      }

      await prisma.securityLog.create({
        data: {
          userId,
          action: "EMAIL_CHANGE_CODE_SENT",
          description:
            "Un code de sÃ©curitÃ© pour le changement d'adresse e-mail a Ã©tÃ© envoyÃ© Ã  l'adresse e-mail actuelle du compte.",
          ipAddress: getClientIp(request),
          userAgent:
            request.headers.get("user-agent"),
        },
      });

      return NextResponse.json({
        success: true,
        requiresVerification: true,
        message:
          "Un code de sÃ©curitÃ© a Ã©tÃ© envoyÃ© Ã  votre adresse e-mail actuelle.",
      });
    }

    // ============================================================
    // ACTION 2 : VÃ‰RIFIER LE CODE
    // ============================================================

    if (action === "verify") {
      if (!code) {
        return NextResponse.json(
          {
            success: false,
            message: "Code de vÃ©rification requis.",
          },
          { status: 400 }
        );
      }

      if (!/^\d{6}$/.test(code)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Le code de vÃ©rification doit contenir 6 chiffres.",
          },
          { status: 400 }
        );
      }

      if (!user.verificationCode) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Aucun code de vÃ©rification actif. Demandez un nouveau code.",
          },
          { status: 400 }
        );
      }

      if (!user.verificationSent) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Aucune vÃ©rification active. Demandez un nouveau code.",
          },
          { status: 400 }
        );
      }

      const codeAge =
        Date.now() -
        user.verificationSent.getTime();

      if (
        codeAge < 0 ||
        codeAge > CODE_EXPIRATION_MS
      ) {
        await prisma.user.update({
          where: {
            id: userId,
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
              "Le code de vÃ©rification a expirÃ©. Demandez un nouveau code.",
          },
          { status: 400 }
        );
      }

      if (code !== user.verificationCode) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Code de vÃ©rification incorrect.",
          },
          { status: 400 }
        );
      }

      // ==========================================================
      // DerniÃ¨re vÃ©rification de disponibilitÃ©
      // ==========================================================

      const emailStillAvailable =
        await prisma.user.findUnique({
          where: {
            email: newEmail,
          },
          select: {
            id: true,
          },
        });

      if (
        emailStillAvailable &&
        emailStillAvailable.id !== userId
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Cette adresse e-mail est maintenant utilisÃ©e par un autre compte.",
          },
          { status: 409 }
        );
      }

      // ==========================================================
      // Changement dÃ©finitif
      // ==========================================================

      const ipAddress =
        getClientIp(request);

      const userAgent =
        request.headers.get("user-agent");

      await prisma.$transaction([
        prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            email: newEmail,
            emailVerified: false,
            verificationCode: null,
            verificationSent: null,
          },
        }),

        prisma.securityLog.create({
          data: {
            userId,
            action: "EMAIL_CHANGED",
            description:
              "L'adresse e-mail du compte a Ã©tÃ© modifiÃ©e aprÃ¨s vÃ©rification du code envoyÃ© Ã  l'ancienne adresse e-mail.",
            ipAddress,
            userAgent,
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message:
          "Adresse e-mail modifiÃ©e avec succÃ¨s.",
      });
    }

    // ============================================================
    // ACTION INVALIDE
    // ============================================================

    return NextResponse.json(
      {
        success: false,
        message: "Action invalide.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error(
      "CHANGE_EMAIL_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Une erreur serveur est survenue. Veuillez rÃ©essayer.",
      },
      { status: 500 }
    );
  }
}
