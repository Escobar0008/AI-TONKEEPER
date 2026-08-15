import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/resend";

const CODE_EXPIRATION_MS = 10 * 60 * 1000;

function generateVerificationCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

function getDeviceType(userAgent: string): string {
  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return "iOS";
  }

  if (/Android/i.test(userAgent)) {
    return "Android";
  }

  if (/Windows/i.test(userAgent)) {
    return "Windows";
  }

  if (/Macintosh|Mac OS/i.test(userAgent)) {
    return "macOS";
  }

  if (/Linux/i.test(userAgent)) {
    return "Linux";
  }

  return "Unknown";
}

function getRequestSecurityInfo(request: NextRequest) {
  const userAgent =
    request.headers.get("user-agent") || null;

  const forwardedFor =
    request.headers.get("x-forwarded-for");

  const realIp =
    request.headers.get("x-real-ip");

  const ipAddress =
    forwardedFor?.split(",")[0]?.trim() ||
    realIp ||
    null;

  return {
    ipAddress,
    userAgent,
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isCodeExpired(date: Date | null): boolean {
  if (!date) {
    return true;
  }

  const age = Date.now() - date.getTime();

  return age < 0 || age > CODE_EXPIRATION_MS;
}

export async function POST(request: NextRequest) {
  try {
    // ============================================================
    // 1. VÃ‰RIFIER LA SESSION
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
    // 2. INITIALISER RESEND
    // ============================================================

    const resend = getResend();

    // ============================================================
    // 3. LIRE LA REQUÃŠTE
    // ============================================================

    const body = await request.json().catch(() => ({}));

    const action =
      typeof body.action === "string"
        ? body.action.trim()
        : "register";

    const deviceName =
      typeof body.deviceName === "string" &&
      body.deviceName.trim()
        ? body.deviceName.trim().slice(0, 100)
        : "New Device";

    const code =
      typeof body.code === "string"
        ? body.code.trim()
        : "";

    const deviceId =
      typeof body.deviceId === "string"
        ? body.deviceId.trim()
        : "";

    // ============================================================
    // 4. INFORMATIONS DE SÃ‰CURITÃ‰
    // ============================================================

    const {
      ipAddress,
      userAgent,
    } = getRequestSecurityInfo(request);

    const currentUserAgent =
      userAgent || "Unknown";

    const deviceType =
      getDeviceType(currentUserAgent);

    // ============================================================
    // 5. RÃ‰CUPÃ‰RER L'UTILISATEUR
    // ============================================================

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
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
    // 6. VÃ‰RIFIER L'EMAIL
    // ============================================================

    if (!user.email) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Aucune adresse e-mail associÃ©e Ã  ce compte.",
        },
        { status: 400 }
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Votre adresse e-mail doit Ãªtre vÃ©rifiÃ©e.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // ACTION REGISTER
    //
    // Enregistre le nouvel appareil et envoie
    // un code de vÃ©rification par e-mail.
    // ============================================================

    if (action === "register") {
      // ----------------------------------------------------------
      // GÃ©nÃ©rer un code sÃ©curisÃ©
      // ----------------------------------------------------------

      const verificationCode =
        generateVerificationCode();

      const verificationSent =
        new Date();

      // ----------------------------------------------------------
      // CrÃ©er l'appareil
      // ----------------------------------------------------------

      const device =
        await prisma.securityDevice.create({
          data: {
            userId,
            deviceName,
            deviceType,
            ipAddress,
            userAgent: currentUserAgent,
            trusted: false,
            lastUsedAt: verificationSent,
          },
        });

      // ----------------------------------------------------------
      // Sauvegarder le code
      // ----------------------------------------------------------

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          verificationCode,
          verificationSent,
        },
      });

      // ----------------------------------------------------------
      // SÃ©curiser les valeurs affichÃ©es dans l'email
      // ----------------------------------------------------------

      const safeDeviceName =
        escapeHtml(deviceName);

      const safeDeviceType =
        escapeHtml(deviceType);

      // ----------------------------------------------------------
      // Envoyer le code avec getResend()
      // ----------------------------------------------------------

      try {
        const emailResult =
          await getResend().emails.send({
            from:
              "AI TONKEEPER <security@ai-tonkeeper.xyz>",

            to: [user.email],

            subject:
              "Nouvelle connexion dÃ©tectÃ©e - AI TONKEEPER",

            html: `
              <!DOCTYPE html>

              <html lang="fr">

                <head>
                  <meta charset="UTF-8" />

                  <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                  />

                  <title>
                    Nouvelle connexion AI TONKEEPER
                  </title>
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
                          margin:0 0 15px;
                          color:#ffffff;
                        "
                      >
                        Nouvelle connexion dÃ©tectÃ©e
                      </h2>

                      <p
                        style="
                          color:#cbd5e1;
                          font-size:15px;
                          line-height:1.6;
                        "
                      >
                        Une tentative de connexion
                        depuis un nouvel appareil
                        a Ã©tÃ© dÃ©tectÃ©e.
                      </p>

                      <div
                        style="
                          margin:25px 0;
                          padding:18px;
                          background:#050B18;
                          border-radius:14px;
                          text-align:left;
                        "
                      >

                        <p
                          style="
                            margin:0 0 10px;
                            color:#94a3b8;
                            font-size:13px;
                          "
                        >
                          Appareil
                        </p>

                        <p
                          style="
                            margin:0;
                            color:#ffffff;
                            font-size:15px;
                            font-weight:bold;
                          "
                        >
                          ${safeDeviceName}
                        </p>

                        <p
                          style="
                            margin:15px 0 10px;
                            color:#94a3b8;
                            font-size:13px;
                          "
                        >
                          Type
                        </p>

                        <p
                          style="
                            margin:0;
                            color:#ffffff;
                            font-size:15px;
                            font-weight:bold;
                          "
                        >
                          ${safeDeviceType}
                        </p>

                      </div>

                      <p
                        style="
                          color:#cbd5e1;
                          font-size:15px;
                          line-height:1.6;
                        "
                      >
                        Votre code de vÃ©rification est :
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
                          line-height:1.6;
                        "
                      >
                        Ce code est valable pendant
                        10 minutes.
                      </p>

                      <p
                        style="
                          margin-top:25px;
                          color:#64748b;
                          font-size:12px;
                          line-height:1.6;
                        "
                      >
                        Si vous n'Ãªtes pas Ã  l'origine
                        de cette connexion, ne partagez
                        pas ce code et sÃ©curisez
                        immÃ©diatement votre compte.
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

        // --------------------------------------------------------
        // VÃ©rifier une Ã©ventuelle erreur Resend
        // --------------------------------------------------------

        if (emailResult.error) {
          console.error(
            "NEW_DEVICE_RESEND_ERROR:",
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

          await prisma.securityDevice.delete({
            where: {
              id: device.id,
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
      } catch (emailError) {
        console.error(
          "NEW_DEVICE_EMAIL_ERROR:",
          emailError
        );

        // --------------------------------------------------------
        // Nettoyage si l'envoi Ã©choue
        // --------------------------------------------------------

        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            verificationCode: null,
            verificationSent: null,
          },
        });

        await prisma.securityDevice.delete({
          where: {
            id: device.id,
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

      // ----------------------------------------------------------
      // Security Log
      // ----------------------------------------------------------

      await prisma.securityLog.create({
        data: {
          userId,
          action:
            "NEW_DEVICE_CODE_SENT",
          description:
            `Code envoyÃ© pour vÃ©rifier le nouvel appareil : ${deviceName}.`,
          ipAddress,
          userAgent:
            currentUserAgent,
        },
      });

      return NextResponse.json({
        success: true,
        requiresVerification: true,
        deviceId: device.id,
        message:
          "Un code de vÃ©rification a Ã©tÃ© envoyÃ© Ã  votre adresse e-mail.",
      });
    }

    // ============================================================
    // ACTION VERIFY
    //
    // VÃ©rifie le code et rend l'appareil fiable.
    // ============================================================

    if (action === "verify") {
      // ----------------------------------------------------------
      // VÃ©rifier le code
      // ----------------------------------------------------------

      if (!code) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Code de vÃ©rification requis.",
          },
          { status: 400 }
        );
      }

      if (!/^\d{6}$/.test(code)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Le code doit contenir exactement 6 chiffres.",
          },
          { status: 400 }
        );
      }

      // ----------------------------------------------------------
      // VÃ©rifier deviceId
      // ----------------------------------------------------------

      if (!deviceId) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Appareil non spÃ©cifiÃ©.",
          },
          { status: 400 }
        );
      }

      // ----------------------------------------------------------
      // RÃ©cupÃ©rer l'appareil
      // ----------------------------------------------------------

      const device =
        await prisma.securityDevice.findFirst({
          where: {
            id: deviceId,
            userId,
          },
        });

      if (!device) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Appareil introuvable.",
          },
          { status: 404 }
        );
      }

      // ----------------------------------------------------------
      // VÃ©rifier le code actif
      // ----------------------------------------------------------

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

      // ----------------------------------------------------------
      // VÃ©rifier la date
      // ----------------------------------------------------------

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

      if (
        isCodeExpired(
          user.verificationSent
        )
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
              "Le code a expirÃ©. Demandez un nouveau code.",
          },
          { status: 400 }
        );
      }

      // ----------------------------------------------------------
      // VÃ©rifier le code
      // ----------------------------------------------------------

      if (
        code !== user.verificationCode
      ) {
        await prisma.securityLog.create({
          data: {
            userId,
            action:
              "NEW_DEVICE_CODE_FAILED",
            description:
              `Code incorrect utilisÃ© pour vÃ©rifier l'appareil : ${device.deviceName}.`,
            ipAddress,
            userAgent:
              currentUserAgent,
          },
        });

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
      // VÃ‰RIFICATION RÃ‰USSIE
      // ==========================================================

      await prisma.$transaction([
        prisma.securityDevice.update({
          where: {
            id: device.id,
          },
          data: {
            trusted: true,
            lastUsedAt: new Date(),
          },
        }),

        prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            verificationCode: null,
            verificationSent: null,
          },
        }),

        prisma.securityLog.create({
          data: {
            userId,
            action:
              "NEW_DEVICE_VERIFIED",
            description:
              `Nouvel appareil vÃ©rifiÃ© avec succÃ¨s : ${device.deviceName}.`,
            ipAddress,
            userAgent:
              currentUserAgent,
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        verified: true,
        trusted: true,
        message:
          "Nouvel appareil vÃ©rifiÃ© avec succÃ¨s.",
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
      "NEW_DEVICE_VERIFICATION_ERROR:",
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
