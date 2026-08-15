import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

const ACTIONS = ["APPROVE", "REJECT"] as const;

type Action = (typeof ACTIONS)[number];

function isAction(value: unknown): value is Action {
  return typeof value === "string" && ACTIONS.includes(value as Action);
}

async function requireAdmin() {
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
      role: true,
    },
  });

  if (!user || user.role !== "ADMIN") {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        { status: 403 },
      ),
    };
  }

  return {
    adminId: user.id,
  };
}

export async function GET() {
  try {
    const auth = await requireAdmin();

    if (auth.error) {
      return auth.error;
    }

    const requests = await prisma.swapRequest.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("ADMIN SWAP GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve Swap requests.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin();

    if (auth.error) {
      return auth.error;
    }

    const body = await request.json();

    const swapId = typeof body?.swapId === "string" ? body.swapId.trim() : "";

    const action = body?.action;

    if (!swapId) {
      return NextResponse.json(
        {
          success: false,
          message: "Swap request ID is required.",
        },
        { status: 400 },
      );
    }

    if (!isAction(action)) {
      return NextResponse.json(
        {
          success: false,
          message: "Action must be APPROVE or REJECT.",
        },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const swap = await tx.swapRequest.findUnique({
        where: {
          id: swapId,
        },
      });

      if (!swap) {
        throw new Error("SWAP_NOT_FOUND");
      }

      if (swap.status === "COMPLETED" || swap.status === "REJECTED") {
        throw new Error("SWAP_ALREADY_FINALIZED");
      }

      /*
       * REJECT
       */

      if (action === "REJECT") {
        const updatedSwap = await tx.swapRequest.update({
          where: {
            id: swapId,
          },
          data: {
            status: "REJECTED",
          },
        });

        const transaction = await tx.transaction.findFirst({
          where: {
            userId: swap.userId,
            coin: swap.fromCoin,
            type: "SWAP",
            amount: swap.fromAmount,
            status: {
              in: ["PENDING", "PROCESSING"],
            },
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
              status: "FAILED",
            },
          });
        }

        return {
          type: "REJECTED" as const,
          swap: updatedSwap,
        };
      }

      /*
       * APPROVE / EXECUTE
       */

      if (swap.fromCoin === swap.toCoin) {
        throw new Error("SAME_COIN");
      }

      if (!Number.isFinite(swap.fromAmount) || swap.fromAmount <= 0) {
        throw new Error("INVALID_FROM_AMOUNT");
      }

      if (!Number.isFinite(swap.toAmount) || swap.toAmount <= 0) {
        throw new Error("INVALID_TO_AMOUNT");
      }

      /*
       * Lock the source balance row.
       *
       * PostgreSQL FOR UPDATE prevents two
       * simultaneous Swap executions from
       * spending the same balance.
       */

      const sourceBalanceRows = await tx.$queryRaw<
        Array<{
          id: string;
          userId: string;
          coin: string;
          balance: number;
        }>
      >`
            SELECT
              "id",
              "userId",
              "coin",
              "balance"
            FROM "Balance"
            WHERE
              "userId" = ${swap.userId}
              AND "coin" = ${swap.fromCoin}::"Coin"
            FOR UPDATE
          `;

      const sourceBalance = sourceBalanceRows[0];

      if (!sourceBalance) {
        throw new Error("SOURCE_BALANCE_NOT_FOUND");
      }

      if (sourceBalance.balance < swap.fromAmount) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      /*
       * Make sure destination balance exists.
       */

      const destinationBalance = await tx.balance.upsert({
        where: {
          userId_coin: {
            userId: swap.userId,
            coin: swap.toCoin,
          },
        },
        create: {
          userId: swap.userId,
          coin: swap.toCoin,
          balance: 0,
        },
        update: {},
      });

      /*
       * Debit source balance.
       */

      const newSourceBalance = sourceBalance.balance - swap.fromAmount;

      await tx.balance.update({
        where: {
          id: sourceBalance.id,
        },
        data: {
          balance: newSourceBalance,
        },
      });

      /*
       * Credit destination balance.
       */

      await tx.balance.update({
        where: {
          id: destinationBalance.id,
        },
        data: {
          balance: {
            increment: swap.toAmount,
          },
        },
      });

      /*
       * Complete Swap.
       */

      const updatedSwap = await tx.swapRequest.update({
        where: {
          id: swapId,
        },
        data: {
          status: "COMPLETED",
        },
      });

      /*
       * Complete the original Swap transaction.
       */

      const transaction = await tx.transaction.findFirst({
        where: {
          userId: swap.userId,
          coin: swap.fromCoin,
          type: "SWAP",
          amount: swap.fromAmount,
          status: {
            in: ["PENDING", "PROCESSING"],
          },
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

      /*
       * Create a transaction record for
       * the received cryptocurrency.
       */

      await tx.transaction.create({
        data: {
          userId: swap.userId,
          coin: swap.toCoin,
          type: "SWAP",
          amount: swap.toAmount,
          fee: 0,
          status: "COMPLETED",
        },
      });

      return {
        type: "COMPLETED" as const,
        swap: updatedSwap,
        sourceBalance: newSourceBalance,
      };
    });

    if (result.type === "REJECTED") {
      return NextResponse.json({
        success: true,
        message: "Swap request rejected.",
        request: result.swap,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Swap approved and executed successfully.",
      request: result.swap,
      sourceBalance: result.sourceBalance,
    });
  } catch (error) {
    console.error("ADMIN SWAP PATCH ERROR:", error);

    if (error instanceof Error && error.message === "SWAP_NOT_FOUND") {
      return NextResponse.json(
        {
          success: false,
          message: "Swap request not found.",
        },
        { status: 404 },
      );
    }

    if (error instanceof Error && error.message === "SWAP_ALREADY_FINALIZED") {
      return NextResponse.json(
        {
          success: false,
          message: "This Swap request has already been finalized.",
        },
        { status: 409 },
      );
    }

    if (error instanceof Error && error.message === "INSUFFICIENT_BALANCE") {
      return NextResponse.json(
        {
          success: false,
          message: "Insufficient balance to execute this Swap.",
        },
        { status: 400 },
      );
    }

    if (
      error instanceof Error &&
      error.message === "SOURCE_BALANCE_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Source cryptocurrency balance was not found.",
        },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message === "SAME_COIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Source and destination coins must be different.",
        },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message === "INVALID_FROM_AMOUNT") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid source amount.",
        },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message === "INVALID_TO_AMOUNT") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid destination amount.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to execute Swap request.",
      },
      { status: 500 },
    );
  }
}
