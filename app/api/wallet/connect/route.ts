import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { address, network } = await req.json();

    if (!address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    const wallet = await prisma.wallet.upsert({
      where: {
        address,
      },
      update: {
        network,
      },
      create: {
        address,
        network: network || "TON",
        balance: 0,
        user: {
          create: {},
        },
      },
    });

    return NextResponse.json({
      success: true,
      wallet,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}