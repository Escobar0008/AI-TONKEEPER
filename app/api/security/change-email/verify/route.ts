import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { resend } from "@/lib/resend";

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

  return Date.now() - date.getTime() > CODE_EXPIRATION_MS;
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

    const newEmail = String(
      body.newEmail ?? ""
    )
      .trim()
      .toLowerCase();

    const code = String(
      body.code ?? ""
    ).trim();

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
    // ACTION 1
    //
    // Demander le changement d'e-mail.
    //
    // IMPORTANT :
    // Le premier code est envoyé à l'ANCIEN e-mail.
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
        user.email.toLowerCase() ===
        newEmail
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

      // Vérifier que le nouveau mail n'est pas déjà utilisé.
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

      // Générer le code pour l'ancien e-mail.
      const verificationCode =
        generateVerificationCode();

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          emailChangePendingEmail:
            newEmail,

          emailChangeCode:
            verificationCode,

          emailChangeSent:
            new Date(),
        },
      });

      // Envoyer le code à l'ANCIEN e-mail.
      await resend.emails.send({
        from:
          "AI TONKEEPER <onboarding@resend.dev>",

        to: user.email,

        subject:
          "Demande de changement d'adresse e-mail",

        html: `
          <div
            style="
              font-family:Arial,sans-serif;
              background:#050B18;
              color:#ffffff;
              padding:32px;
            "
          >

            <h2>AI TONKEEPER</h2>

            <p>
              Une demande de changement
              d'adresse e-mail a été effectuée
              sur votre compte.
            </p>

            <p>
              Nouvelle adresse demandée :
            </p>

            <p>
              <strong>${newEmail}</strong>
            </p>

            <p>
              Pour autoriser cette modification,
              utilisez le code suivant :
            </p>

            <h1
              style="
                font-size:40px;
                letter-spacing:8px;
                color:#06b6d4;
              "
            >
              ${verificationCode}
            </h1>

            <p>
              Ce code expire dans 10 minutes.
            </p>

            <p>
              Si vous n'êtes pas à l'origine
              de cette demande, ne partagez pas
              ce code et sécurisez votre compte.
            </p>

          </div>
        `,
      });

      await prisma.securityLog.create({
        data: {
          userId,
          action:
            "EMAIL_CHANGE_OLD_EMAIL_CODE_SENT",

          description:
            "Un code de vérification a été envoyé à l'ancienne adresse e-mail pour autoriser une demande de changement d'adresse.",

          ipAddress,
          userAgent,
        },
      });

      return NextResponse.json({
        success: true,

        requiresOldEmailVerification:
          true,

        message:
          "Un code de vérification a été envoyé à votre ancienne adresse e-mail.",
      });
    }

    // ============================================================
    // ACTION 2
    //
    // Vérifier le code envoyé à l'ancien e-mail.
    //
    // AUCUN changement d'adresse n'est effectué ici.
    // ============================================================

    if (action === "verify-old") {
      if (!code) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Code de vérification requis.",
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
              "Tentative avec un code incorrect pour autoriser un changement d'adresse e-mail.",

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

      // ========================================================
      // Le propriétaire de l'ancien e-mail est maintenant
      // authentifié pour cette demande.
      //
      // On génère maintenant un NOUVEAU code pour le
      // NOUVEL e-mail.
      // ========================================================

      const pendingEmail =
        user.emailChangePendingEmail;

      const newEmailCode =
        generateVerificationCode();

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          emailChangeCode:
            newEmailCode,

          emailChangeSent:
            new Date(),
        },
      });

      // Envoyer maintenant le second code au NOUVEL e-mail.
      await resend.emails.send({
        from:
          "AI TONKEEPER <onboarding@resend.dev>",

        to: pendingEmail,

        subject:
          "Confirmez votre nouvelle adresse e-mail",

        html: `
          <div
            style="
              font-family:Arial,sans-serif;
              background:#050B18;
              color:#ffffff;
              padding:32px;
            "
          >

            <h2>AI TONKEEPER</h2>

            <p>
              Votre ancienne adresse e-mail
              a été vérifiée avec succès.
            </p>

            <p>
              Pour terminer le changement,
              confirmez que vous avez accès
              à cette nouvelle adresse.
            </p>

            <p>
              Votre code de confirmation :
            </p>

            <h1
              style="
                font-size:40px;
                letter-spacing:8px;
                color:#06b6d4;
              "
            >
              ${newEmailCode}
            </h1>

            <p>
              Ce code expire dans 10 minutes.
            </p>

          </div>
        `,
      });

      await prisma.securityLog.create({
        data: {
          userId,
          action:
            "EMAIL_CHANGE_NEW_EMAIL_CODE_SENT",

          description:
            "L'ancienne adresse a été vérifiée. Un second code a été envoyé à la nouvelle adresse e-mail.",

          ipAddress,
          userAgent,
        },
      });

      return NextResponse.json({
        success: true,

        requiresNewEmailVerification:
          true,

        message:
          "Votre ancienne adresse a été vérifiée. Un code a été envoyé à la nouvelle adresse e-mail.",
      });
    }

    // ============================================================
    // ACTION 3
    //
    // Vérifier le code du NOUVEL e-mail.
    //
    // C'est seulement ici que l'adresse est réellement modifiée.
    // ============================================================

    if (action === "verify-new") {
      if (!code) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Code de vérification requis.",
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

      const newEmail =
        user.emailChangePendingEmail;

      // Dernière vérification d'unicité.
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
      // CHANGEMENT DÉFINITIF
      // ========================================================

      await prisma.$transaction([
        prisma.user.update({
          where: {
            id: userId,
          },

          data: {
            email: newEmail,

            emailVerified: true,

            emailChangePendingEmail:
              null,

            emailChangeCode:
              null,

            emailChangeSent:
              null,
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
    // Action inconnue
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
          "Une erreur serveur est survenue. Veuillez réessayer.",
      },
      { status: 500 }
    );
  }
}