import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getResend } from "@/lib/resend";

const CODE_EXPIRATION_MS = 10 * 60 * 1000;

function generateVerificationCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

function getRequestInfo(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || null;

  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  const ipAddress =
    forwardedFor?.split(",")[0]?.trim() ||
    realIp ||
    null;

  return {
    ipAddress,
    userAgent,
  };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
    // 1. Vérifier la session
    // ============================================================

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

    const userId = String(session.user.id);

    // ============================================================
    // 2. Lire la requête
    // ============================================================

    const body = await request.json();

    const action = String(body.action ?? "").trim();

    const newEmail = String(body.newEmail ?? "")
      .trim()
      .toLowerCase();

    const code = String(body.code ?? "").trim();

    // ============================================================
    // 3. Récupérer l'utilisateur
    // ============================================================

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,

        emailChangePendingEmail: true,
        emailChangeCode: true,
        emailChangeSent: true,
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

    const { ipAddress, userAgent } =
      getRequestInfo(request);

    // ============================================================
    // ACTION 1 : REQUEST
    //
    // Vérifie la nouvelle adresse et envoie un code
    // à l'ancienne adresse.
    // ============================================================

    if (action === "request") {
      if (!newEmail) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Nouvelle adresse e-mail requise.",
          },
          { status: 400 }
        );
      }

      if (!isValidEmail(newEmail)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Adresse e-mail invalide.",
          },
          { status: 400 }
        );
      }

      if (
        user.email.toLowerCase() === newEmail
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Cette adresse e-mail est déjà utilisée par votre compte.",
          },
          { status: 400 }
        );
      }

      const existingUser =
        await prisma.user.findUnique({
          where: {
            email: newEmail,
          },
          select: {
            id: true,
          },
        });

      if (
        existingUser &&
        existingUser.id !== userId
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Cette adresse e-mail est déjà associée à un autre compte.",
          },
          { status: 409 }
        );
      }

      const verificationCode =
        generateVerificationCode();

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          emailChangePendingEmail: newEmail,
          emailChangeCode: verificationCode,
          emailChangeSent: new Date(),
        },
      });

      // ========================================================
      // Envoyer le premier code à l'ancien e-mail
      // ========================================================

      const resend = getResend();

      const emailResult =
        await resend.emails.send({
          from:
            "AI TONKEEPER <onboarding@resend.dev>",

          to: [user.email],

          subject:
            "Demande de changement d'adresse e-mail",

          html: `
            <!DOCTYPE html>
            <html lang="fr">
              <head>
                <meta charset="UTF-8" />
                <meta
                  name="viewport"
                  content="width=device-width, initial-scale=1.0"
                />
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
                      "
                    >
                      Changement d'adresse e-mail
                    </h2>

                    <p
                      style="
                        color:#cbd5e1;
                        font-size:15px;
                        line-height:1.6;
                      "
                    >
                      Une demande de changement
                      d'adresse e-mail a été effectuée
                      sur votre compte.
                    </p>

                    <p
                      style="
                        color:#cbd5e1;
                        font-size:15px;
                        line-height:1.6;
                      "
                    >
                      Nouvelle adresse demandée :
                    </p>

                    <p
                      style="
                        color:#22d3ee;
                        font-size:16px;
                        font-weight:bold;
                      "
                    >
                      ${newEmail}
                    </p>

                    <p
                      style="
                        color:#cbd5e1;
                        font-size:15px;
                        line-height:1.6;
                      "
                    >
                      Utilisez le code ci-dessous pour
                      autoriser cette modification :
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
                      Si vous n'êtes pas à l'origine
                      de cette demande, ne partagez pas
                      ce code et sécurisez votre compte.
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
          "CHANGE_EMAIL_OLD_EMAIL_RESEND_ERROR:",
          emailResult.error
        );

        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            emailChangePendingEmail: null,
            emailChangeCode: null,
            emailChangeSent: null,
          },
        });

        return NextResponse.json(
          {
            success: false,
            message:
              "Impossible d'envoyer le code de vérification.",
          },
          { status: 500 }
        );
      }

      await prisma.securityLog.create({
        data: {
          userId,

          action:
            "EMAIL_CHANGE_OLD_EMAIL_CODE_SENT",

          description:
            "Un code de vérification a été envoyé à l'ancienne adresse e-mail pour autoriser le changement d'adresse.",

          ipAddress,
          userAgent,
        },
      });

      return NextResponse.json({
        success: true,

        requiresOldEmailVerification: true,

        message:
          "Un code de vérification a été envoyé à votre ancienne adresse e-mail.",
      });
    }

    // ============================================================
    // ACTION 2 : VERIFY OLD
    //
    // Vérifie le code reçu sur l'ancienne adresse.
    // Aucun changement d'e-mail n'est encore effectué.
    // ============================================================

    if (action === "verify-old") {
      if (!/^\d{6}$/.test(code)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Le code de vérification doit contenir 6 chiffres.",
          },
          { status: 400 }
        );
      }

      if (
        !user.emailChangePendingEmail ||
        !user.emailChangeCode ||
        !user.emailChangeSent
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Aucune demande de changement d'e-mail active.",
          },
          { status: 400 }
        );
      }

      if (
        isCodeExpired(
          user.emailChangeSent
        )
      ) {
        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            emailChangePendingEmail: null,
            emailChangeCode: null,
            emailChangeSent: null,
          },
        });

        return NextResponse.json(
          {
            success: false,
            message:
              "Le code a expiré. Veuillez recommencer la procédure.",
          },
          { status: 400 }
        );
      }

      if (
        code !== user.emailChangeCode
      ) {
        await prisma.securityLog.create({
          data: {
            userId,

            action:
              "EMAIL_CHANGE_OLD_EMAIL_CODE_FAILED",

            description:
              "Tentative avec un code incorrect pour autoriser le changement d'adresse e-mail.",

            ipAddress,
            userAgent,
          },
        });

        return NextResponse.json(
          {
            success: false,
            message:
              "Code de vérification incorrect.",
          },
          { status: 400 }
        );
      }

      const pendingEmail =
        user.emailChangePendingEmail;

      const newEmailCode =
        generateVerificationCode();

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          emailChangeCode: newEmailCode,
          emailChangeSent: new Date(),
        },
      });

      // ========================================================
      // Envoyer le second code à la nouvelle adresse
      // ========================================================

      const resend = getResend();

      const emailResult =
        await resend.emails.send({
          from:
            "AI TONKEEPER <onboarding@resend.dev>",

          to: [pendingEmail],

          subject:
            "Confirmez votre nouvelle adresse e-mail",

          html: `
            <!DOCTYPE html>
            <html lang="fr">
              <head>
                <meta charset="UTF-8" />
                <meta
                  name="viewport"
                  content="width=device-width, initial-scale=1.0"
                />
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

                    <h2>
                      Confirmez votre nouvelle adresse
                    </h2>

                    <p
                      style="
                        color:#cbd5e1;
                        font-size:15px;
                        line-height:1.6;
                      "
                    >
                      Votre ancienne adresse e-mail
                      a été vérifiée avec succès.
                    </p>

                    <p
                      style="
                        color:#cbd5e1;
                        font-size:15px;
                        line-height:1.6;
                      "
                    >
                      Utilisez le code ci-dessous pour
                      confirmer que vous avez accès à
                      cette nouvelle adresse.
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
                        ${newEmailCode}
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
          "CHANGE_EMAIL_NEW_EMAIL_RESEND_ERROR:",
          emailResult.error
        );

        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            emailChangePendingEmail: null,
            emailChangeCode: null,
            emailChangeSent: null,
          },
        });

        return NextResponse.json(
          {
            success: false,
            message:
              "Impossible d'envoyer le code à la nouvelle adresse e-mail.",
          },
          { status: 500 }
        );
      }

      await prisma.securityLog.create({
        data: {
          userId,

          action:
            "EMAIL_CHANGE_NEW_EMAIL_CODE_SENT",

          description:
            "L'ancienne adresse e-mail a été vérifiée. Un second code a été envoyé à la nouvelle adresse.",

          ipAddress,
          userAgent,
        },
      });

      return NextResponse.json({
        success: true,

        requiresNewEmailVerification: true,

        message:
          "Votre ancienne adresse a été vérifiée. Un code a été envoyé à la nouvelle adresse e-mail.",
      });
    }

    // ============================================================
    // ACTION 3 : VERIFY NEW
    //
    // C'est uniquement ici que le changement devient définitif.
    // ============================================================

    if (action === "verify-new") {
      if (!/^\d{6}$/.test(code)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Le code de vérification doit contenir 6 chiffres.",
          },
          { status: 400 }
        );
      }

      if (
        !user.emailChangePendingEmail ||
        !user.emailChangeCode ||
        !user.emailChangeSent
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Aucune demande de changement d'e-mail active.",
          },
          { status: 400 }
        );
      }

      if (
        isCodeExpired(
          user.emailChangeSent
        )
      ) {
        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            emailChangePendingEmail: null,
            emailChangeCode: null,
            emailChangeSent: null,
          },
        });

        return NextResponse.json(
          {
            success: false,
            message:
              "Le code a expiré. Veuillez recommencer la procédure.",
          },
          { status: 400 }
        );
      }

      if (
        code !== user.emailChangeCode
      ) {
        await prisma.securityLog.create({
          data: {
            userId,

            action:
              "EMAIL_CHANGE_NEW_EMAIL_CODE_FAILED",

            description:
              "Tentative avec un code incorrect envoyé à la nouvelle adresse e-mail.",

            ipAddress,
            userAgent,
          },
        });

        return NextResponse.json(
          {
            success: false,
            message:
              "Code de vérification incorrect.",
          },
          { status: 400 }
        );
      }

      const finalEmail =
        user.emailChangePendingEmail;

      // Dernière vérification d'unicité.
      const existingUser =
        await prisma.user.findUnique({
          where: {
            email: finalEmail,
          },
          select: {
            id: true,
          },
        });

      if (
        existingUser &&
        existingUser.id !== userId
      ) {
        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            emailChangePendingEmail: null,
            emailChangeCode: null,
            emailChangeSent: null,
          },
        });

        return NextResponse.json(
          {
            success: false,
            message:
              "Cette adresse e-mail est déjà utilisée par un autre compte.",
          },
          { status: 409 }
        );
      }

      // ========================================================
      // Changement définitif
      // ========================================================

      await prisma.$transaction([
        prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            email: finalEmail,

            // La nouvelle adresse vient d'être vérifiée.
            emailVerified: true,

            emailChangePendingEmail: null,
            emailChangeCode: null,
            emailChangeSent: null,
          },
        }),

        prisma.securityLog.create({
          data: {
            userId,

            action:
              "EMAIL_CHANGED",

            description:
              "L'adresse e-mail a été modifiée après vérification de l'ancienne et de la nouvelle adresse.",

            ipAddress,
            userAgent,
          },
        }),
      ]);

      return NextResponse.json({
        success: true,

        message:
          "Adresse e-mail modifiée avec succès.",
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
  } catch (error: unknown) {
    console.error(
      "CHANGE_EMAIL_VERIFY_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Une erreur serveur est survenue. Veuillez réessayer.",
      },
      { status: 500 }
    );
  }
}