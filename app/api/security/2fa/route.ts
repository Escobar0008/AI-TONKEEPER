import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";

export async function POST(request: NextRequest) {
  try {
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
     * ENABLE
     * Demande l'activation de la 2FA.
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

      await resend.emails.send({
        from: "AI TONKEEPER <onboarding@resend.dev>",
        to: user.email,
        subject: "Activation de la 2FA - AI TONKEEPER",
        html: `
          <div style="font-family:Arial,sans-serif;padding:24px">
            <h2>AI TONKEEPER</h2>

            <p>
              Vous avez demandé l'activation de
              l'authentification à deux facteurs.
            </p>

            <p>Votre code de confirmation est :</p>

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
              Si vous n'avez pas demandé cette activation,
              ignorez cet e-mail.
            </p>
          </div>
        `,
      });

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
     * VERIFY ENABLE
     * Vérifie le code puis active réellement la 2FA.
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
            message:
              "Aucun code de vérification actif.",
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
     * DISABLE
     * Demande un code avant de désactiver la 2FA.
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

      await resend.emails.send({
        from: "AI TONKEEPER <onboarding@resend.dev>",
        to: user.email,
        subject: "Désactivation de la 2FA - AI TONKEEPER",
        html: `
          <div style="font-family:Arial,sans-serif;padding:24px">
            <h2>AI TONKEEPER</h2>

            <p>
              Vous avez demandé la désactivation
              de l'authentification à deux facteurs.
            </p>

            <p>Votre code de confirmation est :</p>

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
              Si vous n'avez pas demandé cette modification,
              ignorez cet e-mail.
            </p>
          </div>
        `,
      });

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
     * VERIFY DISABLE
     * Vérifie le code puis désactive réellement la 2FA.
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
            message:
              "Aucun code de vérification actif.",
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
     * STATUS
     * Permet à l'interface de connaître l'état actuel.
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