import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { resend } from "@/lib/resend";
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
    // 3. Vérifier l'utilisateur
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
    // 4. Vérification du nouvel e-mail
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

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    // 5. Vérifier que le nouvel e-mail est différent
    // ============================================================

    if (user.email.toLowerCase() === newEmail) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cette adresse e-mail est déjà utilisée par votre compte.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 6. Vérifier que le nouvel e-mail n'est pas déjà utilisé
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
            "Cette adresse e-mail est déjà associée à un autre compte.",
        },
        { status: 409 }
      );
    }

    // ============================================================
    // ACTION 1 : ENVOYER LE CODE À L'ANCIEN E-MAIL
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

      // ----------------------------------------------------------
      // Envoyer le code à l'ANCIEN e-mail
      // ----------------------------------------------------------

      const emailResult =
        await resend.emails.send({
          from: "AI TONKEEPER <onboarding@resend.dev>",
          to: user.email,
          subject:
            "Code de sécurité - Changement d'adresse e-mail",
          html: `
            <div
              style="
                font-family:Arial,sans-serif;
                background:#050B18;
                color:#ffffff;
                padding:32px;
              "
            >
              <div
                style="
                  max-width:520px;
                  margin:auto;
                  background:#101A2C;
                  border-radius:16px;
                  padding:32px;
                "
              >
                <h2 style="margin-bottom:20px;">
                  AI TONKEEPER
                </h2>

                <p>
                  Une demande de changement d'adresse e-mail
                  a été effectuée sur votre compte.
                </p>

                <p>
                  Pour confirmer que cette demande vient bien
                  de vous, utilisez le code de sécurité suivant :
                </p>

                <div
                  style="
                    margin:28px 0;
                    padding:20px;
                    background:#050B18;
                    border-radius:12px;
                    text-align:center;
                  "
                >
                  <span
                    style="
                      font-size:36px;
                      font-weight:bold;
                      letter-spacing:8px;
                      color:#22d3ee;
                    "
                  >
                    ${verificationCode}
                  </span>
                </div>

                <p>
                  Ce code est valable pendant 10 minutes.
                </p>

                <p>
                  Si vous n'êtes pas à l'origine de cette
                  demande, sécurisez immédiatement votre compte.
                </p>

                <p style="margin-top:30px;color:#94a3b8;">
                  AI TONKEEPER Security
                </p>
              </div>
            </div>
          `,
        });

      if (emailResult.error) {
        console.error(
          "CHANGE_EMAIL_RESEND_ERROR:",
          emailResult.error
        );

        // Ne pas laisser un code inutilisable rester actif.
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
              "Impossible d'envoyer le code de vérification.",
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
          action: "EMAIL_CHANGE_CODE_SENT",
          description:
            "Un code de sécurité pour le changement d'adresse e-mail a été envoyé à l'adresse e-mail actuelle du compte.",
          ipAddress: getClientIp(request),
          userAgent:
            request.headers.get("user-agent"),
        },
      });

      return NextResponse.json({
        success: true,
        requiresVerification: true,
        message:
          "Un code de sécurité a été envoyé à votre adresse e-mail actuelle.",
      });
    }

    // ============================================================
    // ACTION 2 : VÉRIFIER LE CODE
    // ============================================================

    if (action === "verify") {
      if (!code) {
        return NextResponse.json(
          {
            success: false,
            message: "Code de vérification requis.",
          },
          { status: 400 }
        );
      }

      // ----------------------------------------------------------
      // Le code doit contenir exactement 6 chiffres
      // ----------------------------------------------------------

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

      // ----------------------------------------------------------
      // Vérifier qu'un code existe
      // ----------------------------------------------------------

      if (!user.verificationCode) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Aucun code de vérification actif. Demandez un nouveau code.",
          },
          { status: 400 }
        );
      }

      // ----------------------------------------------------------
      // Vérifier la date d'envoi
      // ----------------------------------------------------------

      if (!user.verificationSent) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Aucune vérification active. Demandez un nouveau code.",
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
              "Le code de vérification a expiré. Demandez un nouveau code.",
          },
          { status: 400 }
        );
      }

      // ----------------------------------------------------------
      // Vérifier le code
      // ----------------------------------------------------------

      if (code !== user.verificationCode) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Code de vérification incorrect.",
          },
          { status: 400 }
        );
      }

      // ----------------------------------------------------------
      // Dernière vérification de disponibilité du nouvel e-mail
      // ----------------------------------------------------------

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
              "Cette adresse e-mail est maintenant utilisée par un autre compte.",
          },
          { status: 409 }
        );
      }

      // ==========================================================
      // 7. Changement définitif
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
              "L'adresse e-mail du compte a été modifiée après vérification du code envoyé à l'ancienne adresse e-mail.",
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