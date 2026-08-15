import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
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

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 },
      );
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const summary = {
      total: transactions.length,

      deposits: transactions.filter(
        (transaction) => transaction.type === "DEPOSIT",
      ).length,

      withdrawals: transactions.filter(
        (transaction) => transaction.type === "WITHDRAW",
      ).length,

      swaps: transactions.filter(
        (transaction) => transaction.type === "SWAP",
      ).length,

      buys: transactions.filter(
        (transaction) => transaction.type === "BUY",
      ).length,

      aiTrades: transactions.filter(
  (transaction) => String(transaction.type) === "AI_TRADE",
).length,
    };

    return NextResponse.json({
      success: true,
      transactions,
      summary,
    });
  } catch (error) {
    console.error("HISTORY GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve transaction history.",
      },
      { status: 500 },
    );
  }
}