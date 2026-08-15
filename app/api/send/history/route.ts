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
        { status: 401 }
      );
    }

    const requests =
      await prisma.withdrawalRequest.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          coin: true,
          amount: true,
          fee: true,
          address: true,
          status: true,
          txHash: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error(
      "SEND HISTORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to retrieve send history.",
      },
      { status: 500 }
    );
  }
}
