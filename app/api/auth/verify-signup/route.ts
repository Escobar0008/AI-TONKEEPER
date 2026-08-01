import { NextResponse } from "next/server";
import { verifyCode } from "@/lib/verification";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    console.log("STEP 1");

    const { email, code } = await req.json();

    console.log("STEP 2", email, code);

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required." },
        { status: 400 }
      );
    }

    console.log("STEP 3");

    const valid = await verifyCode(email, code, "signup");

    console.log("STEP 4", valid);

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid or expired code." },
        { status: 400 }
      );
    }

    console.log("STEP 5");

    await prisma.user.update({
      where: {
        email,
      },
      data: {
        emailVerified: true,
      },
    });

    console.log("STEP 6");

    return NextResponse.json({
      success: true,
      message: "Account verified successfully.",
    });

  } catch (error) {
    console.error("VERIFY ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}