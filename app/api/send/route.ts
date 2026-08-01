import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      userId,
      address,
      amount,
      comment,
    } = await req.json();

    if (!userId || !address || !amount) {
      return NextResponse.json(
        {
          success: false,
          message: "Please complete all fields.",
        },
        {
          status: 400,
        }
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
        {
          status: 404,
        }
      );
    }

    if (wallet.balance < Number(amount)) {
      return NextResponse.json(
        {
          success: false,
          message: "Insufficient balance.",
        },
        {
          status: 400,
        }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        type: "SEND",
        amount: Number(amount),
        status: "Pending",
        walletAddress: address,
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
      message: "TON transfer request created successfully.",
      transactionId: transaction.id,
      status: transaction.status,
      address,
      amount,
      comment,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error.",
      },
      {
        status: 500,
      }
    );
  }
}