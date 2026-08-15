import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated.",
        },
        { status: 401 },
      );
    }

    const body = await request.json();

    const swapId = typeof body?.swapId === "string" ? body.swapId.trim() : "";

    if (!swapId) {
      return NextResponse.json(
        {
          success: false,
          message: "Swap ID is required.",
        },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const swap = await tx.swapRequest.findFirst({
        where: {
          id: swapId,
          userId: session.user.id,
        },
      });

      if (!swap) {
        throw new Error("SWAP_NOT_FOUND");
      }

      if (swap.status !== "PENDING") {
        throw new Error("SWAP_ALREADY_PROCESSED");
      }

      if (swap.fromCoin === swap.toCoin) {
        throw new Error("INVALID_SWAP_COINS");
      }

      if (swap.fromAmount <= 0 || swap.toAmount <= 0 || swap.rate <= 0) {
        throw new Error("INVALID_SWAP_AMOUNT");
      }

      const fromBalance = await tx.balance.findUnique({
        where: {
          userId_coin: {
            userId: session.user.id,
            coin: swap.fromCoin,
          },
        },
      });

      if (!fromBalance || fromBalance.balance < swap.fromAmount) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      let toBalance = await tx.balance.findUnique({
        where: {
          userId_coin: {
            userId: session.user.id,
            coin: swap.toCoin,
          },
        },
      });

      if (!toBalance) {
        toBalance = await tx.balance.create({
          data: {
            userId: session.user.id,
            coin: swap.toCoin,
            balance: 0,
          },
        });
      }

      const updatedFrom = await tx.balance.update({
        where: {
          userId_coin: {
            userId: session.user.id,
            coin: swap.fromCoin,
          },
        },
        data: {
          balance: {
            decrement: swap.fromAmount,
          },
        },
      });

      const updatedTo = await tx.balance.update({
        where: {
          userId_coin: {
            userId: session.user.id,
            coin: swap.toCoin,
          },
        },
        data: {
          balance: {
            increment: swap.toAmount,
          },
        },
      });

      const updatedSwap = await tx.swapRequest.update({
        where: {
          id: swap.id,
        },
        data: {
          status: "COMPLETED",
        },
      });

      const transaction = await tx.transaction.findFirst({
        where: {
          userId: session.user.id,
          coin: swap.fromCoin,
          type: "SWAP",
          amount: swap.fromAmount,
          status: "PENDING",
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (transaction) {
        await tx.transaction.update({
          where: {
            id: transaction.id,
          },
          data: {
            status: "COMPLETED",
          },
        });
      }

      return {
        swap: updatedSwap,
        fromBalance: updatedFrom,
        toBalance: updatedTo,
        transaction,
      };
    });

    return NextResponse.json({
      success: true,
      message: "Swap executed successfully.",
      swap: result.swap,
      balances: {
        from: {
          coin: result.swap.fromCoin,
          balance: result.fromBalance.balance,
        },
        to: {
          coin: result.swap.toCoin,
          balance: result.toBalance.balance,
        },
      },
      transaction: result.transaction,
    });
  } catch (error) {
    console.error("SWAP EXECUTE ERROR:", error);

    if (error instanceof Error) {
      switch (error.message) {
        case "SWAP_NOT_FOUND":
          return NextResponse.json(
            {
              success: false,
              message: "Swap request not found.",
            },
            { status: 404 },
          );

        case "SWAP_ALREADY_PROCESSED":
          return NextResponse.json(
            {
              success: false,
              message: "This Swap has already been processed.",
            },
            { status: 409 },
          );

        case "INVALID_SWAP_COINS":
          return NextResponse.json(
            {
              success: false,
              message: "Invalid Swap coins.",
            },
            { status: 400 },
          );

        case "INVALID_SWAP_AMOUNT":
          return NextResponse.json(
            {
              success: false,
              message: "Invalid Swap amount or rate.",
            },
            { status: 400 },
          );

        case "INSUFFICIENT_BALANCE":
          return NextResponse.json(
            {
              success: false,
              message: "Insufficient balance to execute this Swap.",
            },
            { status: 400 },
          );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to execute Swap.",
      },
      { status: 500 },
    );
  }
}
