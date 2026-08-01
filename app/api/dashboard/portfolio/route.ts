import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const wallet = await prisma.wallet.findFirst();

    if (!wallet) {
      return NextResponse.json({
        balance: 0,
        usd: 0,
      });
    }

    return NextResponse.json({
      balance: wallet.balance,
      usd: wallet.balance * 3,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        balance: 0,
        usd: 0,
      },
      {
        status: 500,
      }
    );
  }
}