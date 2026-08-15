import { NextResponse } from "next/server";
import { testBybitConnection } from "@/lib/bybit/client";

export async function GET() {
  try {
    const result = await testBybitConnection();

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}