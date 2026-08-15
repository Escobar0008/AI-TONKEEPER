import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

export async function GET() {
  try {
    const deposits = await prisma.transaction.findMany({
      where: {
        type: "DEPOSIT",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      deposits,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      success: false,
      deposits: [],
    });
  }
}