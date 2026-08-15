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

    const requests = await prisma.withdrawalRequest.findMany({
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
    console.error("ADMIN SEND GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve Send requests.",
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

    const sendId = typeof body?.sendId === "string" ? body.sendId.trim() : "";

    const action = body?.action;

    if (!sendId) {
      return NextResponse.json(
        {
          success: false,
          message: "Send request ID is required.",
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

    const send = await prisma.withdrawalRequest.findUnique({
      where: {
        id: sendId,
      },
    });

    if (!send) {
      return NextResponse.json(
        {
          success: false,
          message: "Send request not found.",
        },
        { status: 404 },
      );
    }

    if (send.status === "SENT" || send.status === "REJECTED") {
      return NextResponse.json(
        {
          success: false,
          message: "This Send request has already been finalized.",
        },
        { status: 409 },
      );
    }

    if (action === "REJECT") {
      const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.withdrawalRequest.update({
          where: {
            id: sendId,
          },
          data: {
            status: "REJECTED",
          },
        });

        const transaction = await tx.transaction.findFirst({
          where: {
            userId: send.userId,
            coin: send.coin,
            type: "WITHDRAW",
            amount: send.amount,
            toAddress: send.address,
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

        return updated;
      });

      return NextResponse.json({
        success: true,
        message: "Send request rejected.",
        request: result,
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.withdrawalRequest.update({
        where: {
          id: sendId,
        },
        data: {
          status: "APPROVED",
        },
      });

      const transaction = await tx.transaction.findFirst({
        where: {
          userId: send.userId,
          coin: send.coin,
          type: "WITHDRAW",
          amount: send.amount,
          toAddress: send.address,
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

      return updated;
    });

    return NextResponse.json({
      success: true,
      message: "Send request approved and marked for processing.",
      request: result,
    });
  } catch (error) {
    console.error("ADMIN SEND PATCH ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to process Send request.",
      },
      { status: 500 },
    );
  }
}
