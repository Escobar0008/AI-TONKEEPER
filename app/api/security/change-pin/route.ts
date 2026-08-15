import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { resend } from "@/lib/resend";

type PinAction =
  | "create"
  | "change"
  | "send-reset"
  | "reset";

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

function isValidPin(pin: string) {
  return /^\d{4,6}$/.test(pin);
}

function generateVerificationCode() {
  return Math.floor(
    100000 + Math.random() * 900000
  ).toString();
}

export async function POST(request: NextRequest) {
  try {
    // ============================================================
    // 1. AUTHENTICATION
    // ============================================================

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    const userId = String(session.user.id);

    // ============================================================
    // 2. REQUEST BODY
    // ============================================================

    const body = await request.json();

    let action = String(
      body.action ?? ""
    ).trim() as PinAction;

    const currentPin = String(
      body.currentPin ?? ""
    ).trim();

    const newPin = String(
      body.newPin ?? ""
    ).trim();

    const code = String(
      body.code ?? ""
    ).trim();

    // ============================================================
    // 3. SECURITY INFORMATION
    // ============================================================

    const {
      ipAddress,
      userAgent,
    } = getRequestSecurityInfo(request);

    // ============================================================
    // 4. GET USER
    // ============================================================

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        pinHash: true,
        verificationCode: true,
        verificationSent: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    // ============================================================
    // 5. AUTO-DETECT CHANGE ACTION
    // ============================================================
    //
    // Le SecurityPage actuel envoie :
    //
    // {
    //   currentPin,
    //   newPin
    // }
    //
    // sans envoyer action:"change".
    //
    // On garde donc la compatibilité avec le frontend actuel.
    //
    // ============================================================

    if (
      !action &&
      currentPin &&
      newPin
    ) {
      action = "change";
    }

    // ============================================================
    // 6. CREATE PIN
    // ============================================================

    if (action === "create") {
      if (user.pinHash) {
        return NextResponse.json(
          {
            success: false,
            message:
              "A PIN is already configured. Use change PIN instead.",
          },
          { status: 400 }
        );
      }

      if (!newPin) {
        return NextResponse.json(
          {
            success: false,
            message: "New PIN is required.",
          },
          { status: 400 }
        );
      }

      if (!isValidPin(newPin)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "PIN must contain 4 to 6 digits.",
          },
          { status: 400 }
        );
      }

      const pinHash = await bcrypt.hash(
        newPin,
        12
      );

      await prisma.$transaction([
        prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            pinHash,
          },
        }),

        prisma.securityLog.create({
          data: {
            userId,
            action: "PIN_CREATED",
            description:
              "The account security PIN was created.",
            ipAddress,
            userAgent,
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: "PIN created successfully.",
      });
    }

    // ============================================================
    // 7. CHANGE PIN
    // ============================================================

    if (action === "change") {
      if (!currentPin || !newPin) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Current PIN and new PIN are required.",
          },
          { status: 400 }
        );
      }

      if (!isValidPin(currentPin)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Current PIN must contain 4 to 6 digits.",
          },
          { status: 400 }
        );
      }

      if (!isValidPin(newPin)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "New PIN must contain 4 to 6 digits.",
          },
          { status: 400 }
        );
      }

      if (currentPin === newPin) {
        return NextResponse.json(
          {
            success: false,
            message:
              "The new PIN must be different from the current PIN.",
          },
          { status: 400 }
        );
      }

      if (!user.pinHash) {
        return NextResponse.json(
          {
            success: false,
            message:
              "No PIN has been configured yet. Create a PIN first.",
          },
          { status: 400 }
        );
      }

      const currentPinIsValid =
        await bcrypt.compare(
          currentPin,
          user.pinHash
        );

      if (!currentPinIsValid) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Current PIN is incorrect.",
          },
          { status: 400 }
        );
      }

      const newPinHash =
        await bcrypt.hash(newPin, 12);

      await prisma.$transaction([
        prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            pinHash: newPinHash,
          },
        }),

        prisma.securityLog.create({
          data: {
            userId,
            action: "PIN_CHANGED",
            description:
              "The account security PIN was changed.",
            ipAddress,
            userAgent,
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message:
          "PIN changed successfully.",
      });
    }

    // ============================================================
    // 8. SEND PIN RESET CODE
    // ============================================================

    if (action === "send-reset") {
      if (!user.email) {
        return NextResponse.json(
          {
            success: false,
            message:
              "No email address is associated with this account.",
          },
          { status: 400 }
        );
      }

      if (!user.emailVerified) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Your account email must be verified before resetting the PIN.",
          },
          { status: 400 }
        );
      }

      const verificationCode =
        generateVerificationCode();

      const verificationSent =
        new Date();

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          verificationCode,
          verificationSent,
        },
      });

      try {
        await resend.emails.send({
          from:
            "AI TONKEEPER <onboarding@resend.dev>",
          to: user.email,
          subject:
            "AI TONKEEPER - PIN Reset Code",
          html: `
            <div
              style="
                font-family:Arial,sans-serif;
                background:#050B18;
                padding:32px;
                color:#ffffff;
              "
            >
              <div
                style="
                  max-width:520px;
                  margin:auto;
                  background:#101A2C;
                  border-radius:20px;
                  padding:28px;
                "
              >
                <h2
                  style="
                    margin:0 0 16px;
                    color:#ffffff;
                  "
                >
                  AI TONKEEPER
                </h2>

                <p
                  style="
                    color:#cbd5e1;
                    line-height:1.6;
                  "
                >
                  You requested to reset the security PIN
                  for your AI TONKEEPER account.
                </p>

                <p
                  style="
                    color:#cbd5e1;
                    line-height:1.6;
                  "
                >
                  Your PIN reset verification code is:
                </p>

                <div
                  style="
                    margin:24px 0;
                    padding:20px;
                    text-align:center;
                    background:#050B18;
                    border-radius:16px;
                  "
                >
                  <div
                    style="
                      font-size:38px;
                      font-weight:bold;
                      letter-spacing:10px;
                      color:#22d3ee;
                    "
                  >
                    ${verificationCode}
                  </div>
                </div>

                <p
                  style="
                    color:#94a3b8;
                    font-size:14px;
                    line-height:1.6;
                  "
                >
                  This code expires after 10 minutes.
                </p>

                <p
                  style="
                    color:#94a3b8;
                    font-size:14px;
                    line-height:1.6;
                  "
                >
                  If you did not request a PIN reset,
                  you can safely ignore this email.
                </p>
              </div>
            </div>
          `,
        });
      } catch (emailError) {
        console.error(
          "PIN_RESET_EMAIL_ERROR:",
          emailError
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
              "Unable to send the PIN reset code. Please try again.",
          },
          { status: 500 }
        );
      }

      await prisma.securityLog.create({
        data: {
          userId,
          action: "PIN_RESET_CODE_SENT",
          description:
            "A PIN reset verification code was sent to the account email.",
          ipAddress,
          userAgent,
        },
      });

      return NextResponse.json({
        success: true,
        message:
          "PIN reset code sent to your email address.",
      });
    }

    // ============================================================
    // 9. RESET PIN
    // ============================================================

    if (action === "reset") {
      if (!code) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Verification code is required.",
          },
          { status: 400 }
        );
      }

      if (!/^\d{6}$/.test(code)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Verification code must contain 6 digits.",
          },
          { status: 400 }
        );
      }

      if (!newPin) {
        return NextResponse.json(
          {
            success: false,
            message:
              "New PIN is required.",
          },
          { status: 400 }
        );
      }

      if (!isValidPin(newPin)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "New PIN must contain 4 to 6 digits.",
          },
          { status: 400 }
        );
      }

      if (!user.verificationCode) {
        return NextResponse.json(
          {
            success: false,
            message:
              "No active PIN reset code. Request a new code.",
          },
          { status: 400 }
        );
      }

      if (!user.verificationSent) {
        return NextResponse.json(
          {
            success: false,
            message:
              "No active PIN reset request.",
          },
          { status: 400 }
        );
      }

      const codeAge =
        Date.now() -
        new Date(
          user.verificationSent
        ).getTime();

      const tenMinutes =
        10 * 60 * 1000;

      if (
        codeAge < 0 ||
        codeAge > tenMinutes
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
              "The verification code has expired. Request a new code.",
          },
          { status: 400 }
        );
      }

      if (
        code !== user.verificationCode
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Incorrect verification code.",
          },
          { status: 400 }
        );
      }

      const newPinHash =
        await bcrypt.hash(newPin, 12);

      await prisma.$transaction([
        prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            pinHash: newPinHash,
            verificationCode: null,
            verificationSent: null,
          },
        }),

        prisma.securityLog.create({
          data: {
            userId,
            action: "PIN_RESET",
            description:
              "The account security PIN was reset using email verification.",
            ipAddress,
            userAgent,
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message:
          "PIN reset successfully.",
      });
    }

    // ============================================================
    // 10. INVALID ACTION
    // ============================================================

    return NextResponse.json(
      {
        success: false,
        message:
          "Invalid PIN action.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error(
      "CHANGE_PIN_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "A server error occurred. Please try again.",
      },
      { status: 500 }
    );
  }
}