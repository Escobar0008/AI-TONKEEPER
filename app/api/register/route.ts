import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/resend";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          error: "Tous les champs sont obligatoires.",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "Cette adresse e-mail est déjà utilisée.",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const walletId =
      "AIW-" +
      crypto
        .randomBytes(12)
        .toString("hex")
        .toUpperCase();

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        emailVerified: false,
        verificationCode,
        verificationSent: new Date(),

        wallet: {
          create: {
            walletId,
          },
        },

        balances: {
          create: [
            {
              coin: "TON",
              balance: 0,
            },
            {
              coin: "BTC",
              balance: 0,
            },
            {
              coin: "ETH",
              balance: 0,
            },
            {
              coin: "USDT",
              balance: 0,
            },
            {
              coin: "BNB",
              balance: 0,
            },
          ],
        },
      },

      include: {
        wallet: true,
      },
    });

    // ============================================================
    // RESEND
    // ============================================================

    const resend = getResend();

    const emailResult = await resend.emails.send({
      from: "AI TONKEEPER <onboarding@resend.dev>",

      to: [normalizedEmail],

      subject:
        "Verify your AI TONKEEPER account",

      html: `
        <!DOCTYPE html>
        <html lang="en">

          <head>
            <meta charset="UTF-8" />

            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />

            <title>
              Verify AI TONKEEPER
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
                    color:#ffffff;
                    margin-bottom:15px;
                  "
                >
                  Verify your account
                </h2>

                <p
                  style="
                    color:#cbd5e1;
                    font-size:15px;
                    line-height:1.6;
                  "
                >
                  Thank you for creating your
                  AI TONKEEPER account.
                </p>

                <p
                  style="
                    color:#cbd5e1;
                    font-size:15px;
                    line-height:1.6;
                  "
                >
                  Use the verification code below
                  to verify your email address.
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
                  This code expires in 10 minutes.
                </p>

                <p
                  style="
                    margin-top:25px;
                    color:#64748b;
                    font-size:12px;
                  "
                >
                  If you did not create this account,
                  you can safely ignore this email.
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
    // VÉRIFICATION DE L'ENVOI
    // ============================================================

    if (emailResult.error) {
      console.error(
        "REGISTER RESEND ERROR:",
        emailResult.error
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Compte créé, mais impossible d'envoyer l'e-mail de vérification.",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            walletId: user.wallet?.walletId,
          },
        },
        { status: 500 }
      );
    }

    // ============================================================
    // SUCCÈS
    // ============================================================

    return NextResponse.json(
      {
        success: true,
        message:
          "Compte créé avec succès. Vérifiez votre adresse e-mail.",

        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          walletId: user.wallet?.walletId,
        },
      },
      { status: 201 }
    );

  } catch (error: unknown) {
    console.error(
      "========== REGISTER ERROR =========="
    );

    console.error(error);

    console.error(
      "===================================="
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue.",
      },
      { status: 500 }
    );
  }
}