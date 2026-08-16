import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      success: false as const,
      status: 401,
      message: "Not authenticated.",
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

  if (!user) {
    return {
      success: false as const,
      status: 401,
      message: "User account not found.",
    };
  }

  if (user.role !== "ADMIN") {
    return {
      success: false as const,
      status: 403,
      message: "Administrator access required.",
    };
  }

  return {
    success: true as const,
    status: 200,
    session,
    user,
  };
}

export async function GET() {
  try {
    const admin = await requireAdmin();

    if (!admin.success) {
      return NextResponse.json(
        {
          success: false,
          message: admin.message,
        },
        {
          status: admin.status,
        },
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        users,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("ADMIN USERS GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve users.",
      },
      {
        status: 500,
      },
    );
  }
}
