import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/resend";

export async function POST(request: NextRequest) {
  try {
    const resend = getResend();

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Vous devez être connecté.",
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const { action, code } = await request.json();

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
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

    /*
     * ============================================================
     * ENABLE
     * Demande l'activation de la 2FA.
     * ============================================================
     */

    if (action === "enable") {
      if (user.twoFactorEnabled) {
        return NextResponse.json({
          success: true,
          enabled: true,
          message: "La 2FA est déjà activée.",
        });
      }

      const verificationCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          verificationCode,
          verificationSent: new Date(),
        },
      });

      const emailResult = await resend.emails.send({
        from: "AI TONKEEPER <onboarding@resend.dev>",
        to: [user.email],
        subject: "Activation de la 2FA - AI TONKEEPER",
        html: `
          <!DOCTYPE html>
          <html lang="fr">
            <head>
              <meta charset="UTF-8" />
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
              />
              <title>Activation 2FA</title>
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
                    Secure TON Wallet • AI Powered
                  </p>

                  <h2
                    style="
                      color:#ffffff;
                      margin:0 0 15px;
                    "
                  >
                    Activation de la 2FA
                  </h2>

                  <p
                    style="
                      color:#cbd5e1;
                      font-size:15px;
                      line-height:1.6;
                    "
                  >
                    Vous avez demandé l'activation de
                    l'authentification à deux facteurs.
                  </p>

                  <p
                    style="
                      color:#cbd5e1;
                      font-size:15px;
                      line-height:1.6;
                    "
                  >
                    Votre code de confirmation est :
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
                    Ce code expire dans 10 minutes.
                  </p>

                  <p
                    style="
                      margin-top:25px;
                      color:#64748b;
                      font-size:12px;
                    "
                  >
                    Si vous n'avez pas demandé cette activation,
                    ignorez cet e-mail.
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
                  © 2026 AI TONKEEPER
                </p>
              </div>
            </body>
          </html>
        `,
      });

      if (emailResult.error) {
        console.error(
          "2FA ENABLE RESEND ERROR:",
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
              "Impossible d'envoyer le code par e-mail.",
          },
          { status: 500 }
        );
      }

      await prisma.securityLog.create({
        data: {
          userId,
          action: "2FA_ENABLE_CODE_SENT",
          description:
            "Code envoyé pour confirmer l'activation de la 2FA.",
        },
      });

      return NextResponse.json({
        success: true,
        requiresVerification: true,
        message:
          "Un code de confirmation a été envoyé à votre adresse e-mail.",
      });
    }

    /*
     * ============================================================
     * VERIFY ENABLE
     * Vérifie le code puis active réellement la 2FA.
     * ============================================================
     */

    if (action === "verify-enable") {
      if (!code) {
        return NextResponse.json(
          {
            success: false,
            message: "Code de vérification requis.",
          },
          { status: 400 }
        );
      }

      if (!user.verificationCode) {
        return NextResponse.json(
          {
            success: false,
            message: "Aucun code de vérification actif.",
          },
          { status: 400 }
        );
      }

      if (user.verificationSent) {
        const codeAge =
          Date.now() -
          new Date(user.verificationSent).getTime();

        if (codeAge > 10 * 60 * 1000) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Le code a expiré. Demandez un nouveau code.",
            },
            { status: 400 }
          );
        }
      }

      if (code.toString() !== user.verificationCode) {
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
          id: userId,
        },
        data: {
          twoFactorEnabled: true,
          verificationCode: null,
          verificationSent: null,
        },
      });

      await prisma.securityLog.create({
        data: {
          userId,
          action: "2FA_ENABLED",
          description:
            "L'authentification à deux facteurs a été activée.",
        },
      });

      return NextResponse.json({
        success: true,
        enabled: true,
        message:
          "Authentification à deux facteurs activée avec succès.",
      });
    }

    /*
     * ============================================================
     * DISABLE
     * Demande un code avant de désactiver la 2FA.
     * ============================================================
     */

    if (action === "disable") {
      if (!user.twoFactorEnabled) {
        return NextResponse.json({
          success: true,
          enabled: false,
          message: "La 2FA est déjà désactivée.",
        });
      }

      const verificationCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          verificationCode,
          verificationSent: new Date(),
        },
      });

      const emailResult = await resend.emails.send({
        from: "AI TONKEEPER <onboarding@resend.dev>",
        to: [user.email],
        subject: "Désactivation de la 2FA - AI TONKEEPER",
        html: `
          <!DOCTYPE html>
          <html lang="fr">
            <head>
              <meta charset="UTF-8" />
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
              />
              <title>Désactivation 2FA</title>
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
                    Secure TON Wallet • AI Powered
                  </p>

                  <h2
                    style="
                      color:#ffffff;
                      margin:0 0 15px;
                    "
                  >
                    Désactivation de la 2FA
                  </h2>

                  <p
                    style="
                      color:#cbd5e1;
                      font-size:15px;
                      line-height:1.6;
                    "
                  >
                    Vous avez demandé la désactivation de
                    l'authentification à deux facteurs.
                  </p>

                  <p
                    style="
                      color:#cbd5e1;
                      font-size:15px;
                      line-height:1.6;
                    "
                  >
                    Votre code de confirmation est :
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
                    Ce code expire dans 10 minutes.
                  </p>

                  <p
                    style="
                      margin-top:25px;
                      color:#64748b;
                      font-size:12px;
                    "
                  >
                    Si vous n'avez pas demandé cette modification,
                    ignorez cet e-mail.
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
                  © 2026 AI TONKEEPER
                </p>
              </div>
            </body>
          </html>
        `,
      });

      if (emailResult.error) {
        console.error(
          "2FA DISABLE RESEND ERROR:",
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
              "Impossible d'envoyer le code par e-mail.",
          },
          { status: 500 }
        );
      }

      await prisma.securityLog.create({
        data: {
          userId,
          action: "2FA_DISABLE_CODE_SENT",
          description:
            "Code envoyé pour confirmer la désactivation de la 2FA.",
        },
      });

      return NextResponse.json({
        success: true,
        requiresVerification: true,
        message:
          "Un code de confirmation a été envoyé à votre adresse e-mail.",
      });
    }

    /*
     * ============================================================
     * VERIFY DISABLE
     * Vérifie le code puis désactive réellement la 2FA.
     * ============================================================
     */

    if (action === "verify-disable") {
      if (!code) {
        return NextResponse.json(
          {
            success: false,
            message: "Code de vérification requis.",
          },
          { status: 400 }
        );
      }

      if (!user.verificationCode) {
        return NextResponse.json(
          {
            success: false,
            message: "Aucun code de vérification actif.",
          },
          { status: 400 }
        );
      }

      if (user.verificationSent) {
        const codeAge =
          Date.now() -
          new Date(user.verificationSent).getTime();

        if (codeAge > 10 * 60 * 1000) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Le code a expiré. Demandez un nouveau code.",
            },
            { status: 400 }
          );
        }
      }

      if (code.toString() !== user.verificationCode) {
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
          id: userId,
        },
        data: {
          twoFactorEnabled: false,
          verificationCode: null,
          verificationSent: null,
        },
      });

      await prisma.securityLog.create({
        data: {
          userId,
          action: "2FA_DISABLED",
          description:
            "L'authentification à deux facteurs a été désactivée.",
        },
      });

      return NextResponse.json({
        success: true,
        enabled: false,
        message:
          "Authentification à deux facteurs désactivée.",
      });
    }

    /*
     * ============================================================
     * STATUS
     * Permet à l'interface de connaître l'état actuel.
     * ============================================================
     */

    if (action === "status") {
      return NextResponse.json({
        success: true,
        enabled: user.twoFactorEnabled,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Action invalide.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("2FA_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur.",
      },
      { status: 500 }
    );
  }
}