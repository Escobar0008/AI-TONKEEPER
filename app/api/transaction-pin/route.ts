import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, pin } = await req.json();

    if (!userId || !pin) {
      return NextResponse.json(
        { error: "Missing data." },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(pin)) {
      return NextResponse.json(
        { error: "PIN must contain exactly 6 digits." },
        { status: 400 }
      );
    }

    const hashedPin = await bcrypt.hash(pin, 12);

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        transactionPin: hashedPin,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Transaction PIN created successfully.",
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}