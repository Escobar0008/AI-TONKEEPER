import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const body = await request.json();

    const currentPassword =
      typeof body.currentPassword === "string"
        ? body.currentPassword
        : "";

    const newPassword =
      typeof body.newPassword === "string"
        ? body.newPassword
        : "";

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Current password and new password are required.",
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message:
            "New password must contain at least 8 characters.",
        },
        { status: 400 }
      );
    }

    if (newPassword.length > 128) {
      return NextResponse.json(
        {
          success: false,
          message:
            "New password is too long.",
        },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The new password must be different from the current password.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        password: true,
        accountLocked: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    if (user.accountLocked) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your account is currently locked.",
        },
        { status: 403 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password authentication is not available for this account.",
        },
        { status: 400 }
      );
    }

    const validPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!validPassword) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Current password is incorrect.",
        },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(
      newPassword,
      12
    );

    const userAgent =
      request.headers.get("user-agent");

    const forwardedFor =
      request.headers.get("x-forwarded-for");

    const realIp =
      request.headers.get("x-real-ip");

    const ipAddress =
      forwardedFor
        ?.split(",")[0]
        ?.trim() ||
      realIp ||
      null;

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          password: passwordHash,
        },
      });

      await tx.securityLog.create({
        data: {
          userId,
          action: "PASSWORD_CHANGED",
          description:
            "Account password changed successfully.",
          ipAddress,
          userAgent,
        },
      });
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Password changed successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "CHANGE_PASSWORD_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "A server error occurred. Please try again.",
      },
      { status: 500 }
    );
  }
}