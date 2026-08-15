import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";

function getDeviceType(userAgent: string) {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "iOS";
  if (/Android/i.test(userAgent)) return "Android";
  if (/Windows/i.test(userAgent)) return "Windows";
  if (/Macintosh|Mac OS/i.test(userAgent)) return "macOS";
  if (/Linux/i.test(userAgent)) return "Linux";

  return "Unknown";
}

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

    const body = await request.json().catch(() => ({}));

    const action =
      typeof body.action === "string"
        ? body.action
        : "register";

    const deviceName =
      typeof body.deviceName === "string" &&
      body.deviceName.trim()
        ? body.deviceName.trim()
        : "New Device";

    const verificationCode =
      typeof body.code === "string"
        ? body.code.trim()
        : "";

    const userAgent =
      request.headers.get("user-agent") || "Unknown";

    const forwardedFor =
      request.headers.get("x-forwarded-for");

    const ipAddress =
      forwardedFor?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "Unknown";

    const deviceType = getDeviceType(userAgent);

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
     * ÉTAPE 1
     * Enregistrer l'appareil et envoyer
     * un code de vérification par e-mail.
     */
    if (action === "register") {
      const code = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      const device = await prisma.securityDevice.create({
        data: {
          userId,
          deviceName,
          deviceType,
          ipAddress,
          userAgent,
          trusted: false,
          lastUsedAt: new Date(),
        },
      });

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          verificationCode: code,
          verificationSent: new Date(),
        },
      });

      await resend.emails.send({
        from: "AI TONKEEPER <onboarding@resend.dev>",
        to: user.email,
        subject:
          "Nouvelle connexion détectée - AI TONKEEPER",
        html: `
          <div style="font-family:Arial,sans-serif;padding:24px">
            <h2>AI TONKEEPER</h2>

            <p>
              Une tentative de connexion depuis un nouvel appareil
              a été détectée.
            </p>

            <p>
              Appareil :
              <strong>${deviceName}</strong>
            </p>

            <p>
              Type :
              <strong>${deviceType}</strong>
            </p>

            <p>
              Votre code de vérification est :
            </p>

            <h1
              style="
                font-size:40px;
                letter-spacing:8px;
                color:#06b6d4;
              "
            >
              ${code}
            </h1>

            <p>
              Ce code expire dans 10 minutes.
            </p>

            <p>
              Si vous n'êtes pas à l'origine de cette connexion,
              changez immédiatement votre mot de passe.
            </p>
          </div>
        `,
      });

      await prisma.securityLog.create({
        data: {
          userId,
          action: "NEW_DEVICE_CODE_SENT",
          description:
            `Code envoyé pour vérifier le nouvel appareil : ${deviceName}.`,
          ipAddress,
          userAgent,
        },
      });

      return NextResponse.json({
        success: true,
        requiresVerification: true,
        deviceId: device.id,
        message:
          "Un code de vérification a été envoyé à votre adresse e-mail.",
      });
    }

    /*
     * ÉTAPE 2
     * Vérifier le code et faire confiance
     * à l'appareil.
     */
    if (action === "verify") {
      if (!verificationCode) {
        return NextResponse.json(
          {
            success: false,
            message: "Code de vérification requis.",
          },
          { status: 400 }
        );
      }

      const deviceId =
        typeof body.deviceId === "string"
          ? body.deviceId
          : null;

      if (!deviceId) {
        return NextResponse.json(
          {
            success: false,
            message: "Appareil non spécifié.",
          },
          { status: 400 }
        );
      }

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
            message: "Appareil introuvable.",
          },
          { status: 404 }
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

      if (verificationCode !== user.verificationCode) {
        return NextResponse.json(
          {
            success: false,
            message: "Code de vérification incorrect.",
          },
          { status: 400 }
        );
      }

      await prisma.securityDevice.update({
        where: {
          id: device.id,
        },
        data: {
          trusted: true,
          lastUsedAt: new Date(),
        },
      });

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          verificationCode: null,
          verificationSent: null,
        },
      });

      await prisma.securityLog.create({
        data: {
          userId,
          action: "NEW_DEVICE_VERIFIED",
          description:
            `Nouvel appareil vérifié : ${device.deviceName}.`,
          ipAddress,
          userAgent,
        },
      });

      return NextResponse.json({
        success: true,
        message:
          "Nouvel appareil vérifié avec succès.",
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
    console.error(
      "NEW_DEVICE_VERIFICATION_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur.",
      },
      { status: 500 }
    );
  }
}