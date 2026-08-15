import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const wallets = await prisma.mainWallet.findMany({
  select: {
    coin: true,
    network: true,
    address: true,
    enabled: true,
  },
});

    return NextResponse.json({
      success: true,
      wallets,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load deposit addresses.",
      },
      { status: 500 }
    );
  }
}