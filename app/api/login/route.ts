import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getResend } from "@/lib/resend";

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

    const resendCode = body.resend === true;

    // ============================================================
    // 1. VÉRIFICATION DE L'EMAIL
    // ============================================================

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email requis.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 2. RECHERCHE DE L'UTILISATEUR
    // ============================================================

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

    // ============================================================
    // 3. VÉRIFICATION DU COMPTE
    // ============================================================

    if (user.accountLocked) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Votre compte est temporairement verrouillé.",
        },
        { status: 403 }
      );
    }

    // ============================================================
    // 4. CONNEXION NORMALE
    // ============================================================

    if (!resendCode) {
      if (!password) {
        return NextResponse.json(
          {
            success: false,
            message: "Mot de passe requis.",
          },
          { status: 400 }
        );
      }

      const validPassword = await bcrypt.compare(
        password,
        user.password
      );

      if (!validPassword) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Email ou mot de passe incorrect.",
          },
          { status: 401 }
        );
      }

      // ==========================================================
      // 5. VÉRIFICATION DE L'ADRESSE EMAIL
      // ==========================================================

      if (!user.emailVerified) {
        return NextResponse.json(
          {
            success: false,
            requiresEmailVerification: true,
            message:
              "Veuillez vérifier votre adresse e-mail avant de vous connecter.",
          },
          { status: 403 }
        );
      }
    }

    // ============================================================
    // 6. GÉNÉRER LE CODE DE CONNEXION
    // ============================================================

    const loginCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const verificationSent = new Date();

    // ============================================================
    // 7. SAUVEGARDER LE CODE
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
    // 8. INITIALISER RESEND
    // ============================================================

    const resend = getResend();

    // ============================================================
    // 9. ENVOYER LE CODE PAR EMAIL
    // ============================================================

    const emailResult = await resend.emails.send({
      from: "AI TONKEEPER <onboarding@resend.dev>",

      to: [email],

      subject:
        "Votre code de connexion AI TONKEEPER",

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
              Code de connexion AI TONKEEPER
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
                  Secure TON Wallet • AI Powered
                </p>

                <h2
                  style="
                    margin:0 0 15px;
                    color:#ffffff;
                  "
                >
                  Code de connexion
                </h2>

                <p
                  style="
                    color:#cbd5e1;
                    font-size:15px;
                    line-height:1.6;
                  "
                >
                  Utilisez le code ci-dessous pour
                  confirmer votre connexion à
                  AI TONKEEPER.
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
                    ${loginCode}
                  </span>

                </div>

                <p
                  style="
                    color:#94a3b8;
                    font-size:13px;
                    line-height:1.6;
                  "
                >
                  Ce code est temporaire.
                  Ne le partagez avec personne.
                </p>

                <p
                  style="
                    margin-top:25px;
                    color:#64748b;
                    font-size:12px;
                  "
                >
                  Si vous n'êtes pas à l'origine
                  de cette tentative de connexion,
                  vous pouvez ignorer cet e-mail.
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

    // ============================================================
    // 10. VÉRIFIER L'ENVOI RESEND
    // ============================================================

    if (emailResult.error) {
      console.error(
        "RESEND LOGIN ERROR:",
        emailResult.error
      );

      // Supprimer le code s'il n'a pas été envoyé.

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
    // 11. SUCCÈS
    // ============================================================

    return NextResponse.json(
      {
        success: true,
        requiresLoginVerification: true,
        message: resendCode
          ? "Code renvoyé avec succès."
          : "Code envoyé avec succès.",
      },
      { status: 200 }
    );

  } catch (error: unknown) {

    console.error(
      "========== LOGIN ERROR =========="
    );

    console.error(error);

    console.error(
      "================================="
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Une erreur serveur est survenue.",
      },
      { status: 500 }
    );
  }
}