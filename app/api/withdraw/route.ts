import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, address, amount } = await req.json();

    if (!userId || !address || !amount) {
      return NextResponse.json(
        {
          success: false,
          message: "Please complete all fields.",
        },
        { status: 400 }
      );
    }

    const wallet = await prisma.wallet.findUnique({
      where: {
        userId,
      },
    });

    if (!wallet) {
      return NextResponse.json(
        {
          success: false,
          message: "Wallet not found.",
        },
        { status: 404 }
      );
    }

    if (wallet.balance < Number(amount)) {
      return NextResponse.json(
        {
          success: false,
          message: "Insufficient balance.",
        },
        { status: 400 }
      );
    }

    const withdrawal = await prisma.withdrawal.create({
      data: {
        destinationAddress: address,
        amount: Number(amount),
        status: "Pending",
        userId,
      },
    });

    await prisma.wallet.update({
      where: {
        userId,
      },
      data: {
        balance: {
          decrement: Number(amount),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Withdrawal request submitted successfully.",
      withdrawal,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error.",
      },
      { status: 500 }
    );
  }
}