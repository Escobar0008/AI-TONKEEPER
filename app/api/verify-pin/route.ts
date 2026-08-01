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

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user || !user.transactionPin) {
      return NextResponse.json(
        { error: "Transaction PIN not found." },
        { status: 404 }
      );
    }

    const valid = await bcrypt.compare(
      pin,
      user.transactionPin
    );

    if (!valid) {
      return NextResponse.json(
        { error: "Incorrect transaction PIN." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Transaction PIN verified.",
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}