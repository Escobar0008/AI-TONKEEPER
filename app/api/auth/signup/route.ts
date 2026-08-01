import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createUser, getUserByEmail } from "@/lib/auth";
import { createVerificationCode } from "@/lib/verification";
import { sendVerificationEmail } from "@/lib/mail/mailer";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const existingUser = await getUserByEmail(email);

    // ✅ Si le compte existe déjà mais n'est pas vérifié,
    // on renvoie simplement un nouveau code.
    if (existingUser) {
      if (!existingUser.emailVerified) {
        const code = await createVerificationCode(
          email,
          "signup"
        );

        await sendVerificationEmail(
          email,
          code
        );

        return NextResponse.json({
          success: true,
          message: "A new verification code has been sent.",
        });
      }

      return NextResponse.json(
        {
          error: "User already exists.",
        },
        {
          status: 409,
        }
      );
    }

    const user = await createUser(
      name ?? "",
      email,
      password
    );

    await prisma.wallet.create({
      data: {
        address: `wallet_${user.id}`,
        network: "TON",
        balance: 0,
        userId: user.id,
      },
    });

    const code = await createVerificationCode(
      email,
      "signup"
    );

    await sendVerificationEmail(
      email,
      code
    );

    return NextResponse.json({
      success: true,
      message: "Verification code sent.",
    });

  } catch (error) {
    console.error("SIGNUP ERROR:", error);

    return NextResponse.json(
      {
        error: "Internal server error.",
      },
      {
        status: 500,
      }
    );
  }
}