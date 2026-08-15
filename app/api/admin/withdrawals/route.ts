import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_ACTIONS = ["APPROVE", "REJECT"] as const;
type Action = (typeof ALLOWED_ACTIONS)[number];

function isAction(value: unknown): value is Action {
  return (
    typeof value === "string" &&
    ALLOWED_ACTIONS.includes(value as Action)
  );
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated.",
        },
        { status: 401 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        { status: 403 }
      );
    }

    const withdrawals =
      await prisma.withdrawalRequest.findMany({
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
      withdrawals,
    });
  } catch (error) {
    console.error(
      "ADMIN WITHDRAWALS GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to retrieve withdrawal requests.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest
) {
  try {
    const session =
      await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated.",
        },
        { status: 401 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const withdrawalId =
      typeof body?.withdrawalId === "string"
        ? body.withdrawalId.trim()
        : "";

    const action = body?.action;

    if (!withdrawalId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Withdrawal ID is required.",
        },
        { status: 400 }
      );
    }

    if (!isAction(action)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Action must be APPROVE or REJECT.",
        },
        { status: 400 }
      );
    }

    const withdrawal =
      await prisma.withdrawalRequest.findUnique({
        where: {
          id: withdrawalId,
        },
      });

    if (!withdrawal) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Withdrawal request not found.",
        },
        { status: 404 }
      );
    }

    if (
      withdrawal.status === "SENT" ||
      withdrawal.status === "REJECTED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This withdrawal request has already been finalized.",
        },
        { status: 409 }
      );
    }

    if (action === "REJECT") {
      const result =
        await prisma.$transaction(
          async (tx) => {
            const updatedWithdrawal =
              await tx.withdrawalRequest.update({
                where: {
                  id: withdrawalId,
                },
                data: {
                  status: "REJECTED",
                },
              });

            const transaction =
              await tx.transaction.findFirst({
                where: {
                  userId: withdrawal.userId,
                  coin: withdrawal.coin,
                  type: "WITHDRAW",
                  amount: withdrawal.amount,
                  toAddress: withdrawal.address,
                  status: {
                    in: [
                      "PENDING",
                      "PROCESSING",
                    ],
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
              updatedWithdrawal,
              transactionId:
                transaction?.id ?? null,
            };
          }
        );

      return NextResponse.json({
        success: true,
        message:
          "Withdrawal request rejected.",
        withdrawal: result.updatedWithdrawal,
        transactionId:
          result.transactionId,
      });
    }

    /*
     * APPROVE
     *
     * Important:
     * Approval does NOT send crypto.
     * It only moves the request to PROCESSING.
     * The actual blockchain execution must happen
     * through a separate secure execution service.
     */

    const result =
      await prisma.$transaction(
        async (tx) => {
          const updatedWithdrawal =
            await tx.withdrawalRequest.update({
              where: {
                id: withdrawalId,
              },
              data: {
                status: "APPROVED",
              },
            });

          const transaction =
            await tx.transaction.findFirst({
              where: {
                userId: withdrawal.userId,
                coin: withdrawal.coin,
                type: "WITHDRAW",
                amount: withdrawal.amount,
                toAddress: withdrawal.address,
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
                status: "PROCESSING",
              },
            });
          }

          return {
            updatedWithdrawal,
            transactionId:
              transaction?.id ?? null,
          };
        }
      );

    return NextResponse.json({
      success: true,
      message:
        "Withdrawal request approved and marked for processing.",
      withdrawal:
        result.updatedWithdrawal,
      transactionId:
        result.transactionId,
    });
  } catch (error) {
    console.error(
      "ADMIN WITHDRAWALS PATCH ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to process withdrawal request.",
      },
      { status: 500 }
    );
  }
}
