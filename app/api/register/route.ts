import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Tous les champs sont obligatoires." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "Cette adresse e-mail est déjà utilisée.",
        },
        {
          status: 409,
        }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const walletId =
      "AIW-" +
      crypto.randomBytes(12).toString("hex").toUpperCase();

    const user = await prisma.user.create({
      data: {
        name,
        email,
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

    await resend.emails.send({
      from: "AI TONKEEPER <onboarding@resend.dev>",
      to: email,
      subject: "Verify your AI TONKEEPER account",
      html: `
      <div style="font-family:Arial,sans-serif;padding:20px">

        <h2>Welcome to AI TONKEEPER</h2>

        <p>Thank you for creating your account.</p>

        <p>Your verification code is:</p>

        <h1 style="font-size:40px;letter-spacing:8px;color:#06b6d4;">
          ${verificationCode}
        </h1>

        <p>This code expires in 10 minutes.</p>

      </div>
      `,
    });

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
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Une erreur est survenue.",
      },
      {
        status: 500,
      }
    );
  }
}