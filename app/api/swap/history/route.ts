import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: "Not authenticated.",
        },
        { status: 401 },
      ),
    };
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
    return {
      error: NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 },
      ),
    };
  }

  return {
    userId: user.id,
  };
}

export async function GET() {
  try {
    const auth = await requireUser();

    if (auth.error) {
      return auth.error;
    }

    /*
     * Get all real wallet transactions.
     *
     * IMPORTANT:
     * We only use values that actually exist
     * in the Transaction model.
     */

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: auth.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        coin: true,
        type: true,
        amount: true,
        fee: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    /*
     * Get the user's Swap requests separately.
     *
     * This allows the History page to display
     * the destination cryptocurrency as well.
     */

    const swaps = await prisma.swapRequest.findMany({
      where: {
        userId: auth.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        fromCoin: true,
        toCoin: true,
        fromAmount: true,
        toAmount: true,
        rate: true,
        fee: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    /*
     * Convert Prisma Date objects to strings
     * so the response is easy to use in React.
     */

    const formattedTransactions = transactions.map(
      (transaction) => ({
        id: transaction.id,
        coin: transaction.coin,
        type: transaction.type,
        amount: transaction.amount,
        fee: transaction.fee,
        status: transaction.status,
        createdAt: transaction.createdAt.toISOString(),
        updatedAt: transaction.updatedAt.toISOString(),
      }),
    );

    const formattedSwaps = swaps.map((swap) => ({
      id: swap.id,
      fromCoin: swap.fromCoin,
      toCoin: swap.toCoin,
      fromAmount: swap.fromAmount,
      toAmount: swap.toAmount,
      rate: swap.rate,
      fee: swap.fee,
      status: swap.status,
      createdAt: swap.createdAt.toISOString(),
      updatedAt: swap.updatedAt.toISOString(),
    }));

    /*
     * Summary
     */

    const summary = {
      totalTransactions: formattedTransactions.length,

      deposits: formattedTransactions.filter(
        (transaction) =>
          transaction.type === "DEPOSIT",
      ).length,

      withdrawals: formattedTransactions.filter(
        (transaction) =>
          transaction.type === "WITHDRAW",
      ).length,

      swaps: formattedSwaps.length,

      buyOrders: formattedTransactions.filter(
        (transaction) =>
          transaction.type === "BUY",
      ).length,
    };

    return NextResponse.json({
      success: true,
      transactions: formattedTransactions,
      swaps: formattedSwaps,
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