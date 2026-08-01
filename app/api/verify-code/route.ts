import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCode } from "@/lib/verification";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required." },
        { status: 400 }
      );
    }

    const valid = await verifyCode(
      email,
      code,
      "signup"
    );

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: {
        email,
      },
      data: {
        emailVerified: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully.",
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}