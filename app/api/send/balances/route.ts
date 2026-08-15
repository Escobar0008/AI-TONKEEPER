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

    const balances = await prisma.balance.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        coin: true,
        balance: true,
      },
    });

    const result = {
      TON: 0,
      BTC: 0,
      ETH: 0,
      USDT: 0,
      BNB: 0,
    };

    for (const item of balances) {
      if (item.coin in result) {
        result[item.coin as keyof typeof result] =
          item.balance;
      }
    }

    return NextResponse.json({
      success: true,
      balances: result,
    });
  } catch (error) {
    console.error("SEND BALANCES ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve balances.",
      },
      { status: 500 }
    );
  }
}
