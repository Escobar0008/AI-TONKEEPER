import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Vous devez être connecté.",
        },
        { status: 401 }
      );
    }

    const devices = await prisma.securityDevice.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        lastUsedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      devices,
    });
  } catch (error) {
    console.error("GET_DEVICES_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Vous devez être connecté.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      deviceName,
      deviceType,
      trusted,
    } = body;

    if (!deviceName) {
      return NextResponse.json(
        {
          success: false,
          message: "Nom de l'appareil requis.",
        },
        { status: 400 }
      );
    }

    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      null;

    const userAgent =
      request.headers.get("user-agent") || null;

    const existingDevice =
      await prisma.securityDevice.findFirst({
        where: {
          userId: session.user.id,
          deviceName,
        },
      });

    let device;

    if (existingDevice) {
      device = await prisma.securityDevice.update({
        where: {
          id: existingDevice.id,
        },
        data: {
          deviceType:
            deviceType || existingDevice.deviceType,
          ipAddress,
          userAgent,
          trusted:
            typeof trusted === "boolean"
              ? trusted
              : existingDevice.trusted,
          lastUsedAt: new Date(),
        },
      });
    } else {
      device = await prisma.securityDevice.create({
        data: {
          userId: session.user.id,
          deviceName,
          deviceType: deviceType || null,
          ipAddress,
          userAgent,
          trusted:
            typeof trusted === "boolean"
              ? trusted
              : false,
          lastUsedAt: new Date(),
        },
      });
    }

    await prisma.securityLog.create({
      data: {
        userId: session.user.id,
        action: "DEVICE_REGISTERED",
        description:
          `Appareil enregistré : ${deviceName}`,
        ipAddress,
        userAgent,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Appareil enregistré avec succès.",
      device,
    });
  } catch (error) {
    console.error("CREATE_DEVICE_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Vous devez être connecté.",
        },
        { status: 401 }
      );
    }

    const {
      deviceId,
      trusted,
    } = await request.json();

    if (!deviceId) {
      return NextResponse.json(
        {
          success: false,
          message: "ID de l'appareil requis.",
        },
        { status: 400 }
      );
    }

    const device =
      await prisma.securityDevice.findFirst({
        where: {
          id: deviceId,
          userId: session.user.id,
        },
      });

    if (!device) {
      return NextResponse.json(
        {
          success: false,
          message: "Appareil introuvable.",
        },
        { status: 404 }
      );
    }

    const updatedDevice =
      await prisma.securityDevice.update({
        where: {
          id: device.id,
        },
        data: {
          trusted:
            typeof trusted === "boolean"
              ? trusted
              : device.trusted,
        },
      });

    await prisma.securityLog.create({
      data: {
        userId: session.user.id,
        action: "DEVICE_TRUST_UPDATED",
        description:
          `Statut de confiance modifié pour : ${device.deviceName}`,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Statut de l'appareil mis à jour.",
      device: updatedDevice,
    });
  } catch (error) {
    console.error("UPDATE_DEVICE_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Vous devez être connecté.",
        },
        { status: 401 }
      );
    }

    const { deviceId } = await request.json();

    if (!deviceId) {
      return NextResponse.json(
        {
          success: false,
          message: "ID de l'appareil requis.",
        },
        { status: 400 }
      );
    }

    const device =
      await prisma.securityDevice.findFirst({
        where: {
          id: deviceId,
          userId: session.user.id,
        },
      });

    if (!device) {
      return NextResponse.json(
        {
          success: false,
          message: "Appareil introuvable.",
        },
        { status: 404 }
      );
    }

    await prisma.securityDevice.delete({
      where: {
        id: device.id,
      },
    });

    await prisma.securityLog.create({
      data: {
        userId: session.user.id,
        action: "DEVICE_REMOVED",
        description:
          `Appareil supprimé : ${device.deviceName}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Appareil supprimé avec succès.",
    });
  } catch (error) {
    console.error("DELETE_DEVICE_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur.",
      },
      { status: 500 }
    );
  }
}