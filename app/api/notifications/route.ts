import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

// ============================================================
// HELPERS
// ============================================================

async function getAuthenticatedUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
    },
  });

  return user;
}

async function parseJsonBody(
  request: NextRequest,
): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return null;
    }

    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}

// ============================================================
// GET /api/notifications
//
// Récupère les notifications de l'utilisateur connecté.
//
// Query params:
// ?unreadOnly=true
// ?limit=20
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Non authentifié.",
        },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);

    const unreadOnly =
      searchParams.get("unreadOnly") === "true";

    const requestedLimit = Number(
      searchParams.get("limit") ?? "20",
    );

    const limit =
      Number.isFinite(requestedLimit) &&
      requestedLimit > 0
        ? Math.min(Math.floor(requestedLimit), 100)
        : 20;

    const notifications =
      await prisma.notification.findMany({
        where: {
          userId: user.id,
          ...(unreadOnly
            ? {
                read: false,
              }
            : {}),
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
      });

    const unreadCount =
      await prisma.notification.count({
        where: {
          userId: user.id,
          read: false,
        },
      });

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error(
      "GET /api/notifications error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Impossible de récupérer les notifications.",
      },
      { status: 500 },
    );
  }
}

// ============================================================
// POST /api/notifications
//
// Crée une notification pour l'utilisateur connecté.
//
// Body:
//
// {
//   "type": "SYSTEM",
//   "title": "Bienvenue",
//   "message": "Bienvenue sur AI TONKEEPER.",
//   "actionUrl": "/dashboard"
// }
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Non authentifié.",
        },
        { status: 401 },
      );
    }

    const body = await parseJsonBody(request);

    if (!body) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Le corps de la requête doit être un JSON valide.",
        },
        { status: 400 },
      );
    }

    const type =
      typeof body.type === "string"
        ? body.type.trim()
        : "";

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    const actionUrl =
      typeof body.actionUrl === "string"
        ? body.actionUrl.trim()
        : null;

    // --------------------------------------------------------
    // TYPE
    // --------------------------------------------------------

    if (!type) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Le type de notification est requis.",
        },
        { status: 400 },
      );
    }

    if (
      !Object.values(NotificationType).includes(
        type as NotificationType,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Type de notification invalide.",
          allowedTypes:
            Object.values(NotificationType),
        },
        { status: 400 },
      );
    }

    // --------------------------------------------------------
    // TITLE
    // --------------------------------------------------------

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Le titre de la notification est requis.",
        },
        { status: 400 },
      );
    }

    // --------------------------------------------------------
    // MESSAGE
    // --------------------------------------------------------

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Le message de la notification est requis.",
        },
        { status: 400 },
      );
    }

    // --------------------------------------------------------
    // CREATE
    // --------------------------------------------------------

    const notification =
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: type as NotificationType,
          title,
          message,
          actionUrl: actionUrl || null,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Notification créée avec succès.",
        notification,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "POST /api/notifications error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Impossible de créer la notification.",
      },
      { status: 500 },
    );
  }
}

// ============================================================
// PATCH /api/notifications
//
// Marquer UNE notification comme lue/non lue:
//
// {
//   "notificationId": "xxx",
//   "read": true
// }
//
// Marquer TOUTES les notifications comme lues:
//
// {
//   "markAllAsRead": true
// }
// ============================================================

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Non authentifié.",
        },
        { status: 401 },
      );
    }

    const body = await parseJsonBody(request);

    if (!body) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Le corps de la requête doit être un JSON valide.",
        },
        { status: 400 },
      );
    }

    // --------------------------------------------------------
    // MARK ALL AS READ
    // --------------------------------------------------------

    if (body.markAllAsRead === true) {
      const result =
        await prisma.notification.updateMany({
          where: {
            userId: user.id,
            read: false,
          },
          data: {
            read: true,
          },
        });

      return NextResponse.json({
        success: true,
        message:
          "Toutes les notifications ont été marquées comme lues.",
        updatedCount: result.count,
      });
    }

    // --------------------------------------------------------
    // SINGLE NOTIFICATION
    // --------------------------------------------------------

    const notificationId =
      typeof body.notificationId === "string"
        ? body.notificationId.trim()
        : "";

    if (!notificationId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "notificationId est requis.",
        },
        { status: 400 },
      );
    }

    const read =
      typeof body.read === "boolean"
        ? body.read
        : true;

    const notification =
      await prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId: user.id,
        },
      });

    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Notification introuvable.",
        },
        { status: 404 },
      );
    }

    const updatedNotification =
      await prisma.notification.update({
        where: {
          id: notification.id,
        },
        data: {
          read,
        },
      });

    return NextResponse.json({
      success: true,
      message: read
        ? "Notification marquée comme lue."
        : "Notification marquée comme non lue.",
      notification: updatedNotification,
    });
  } catch (error) {
    console.error(
      "PATCH /api/notifications error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Impossible de modifier la notification.",
      },
      { status: 500 },
    );
  }
}

// ============================================================
// DELETE /api/notifications
//
// Supprimer UNE notification:
//
// {
//   "notificationId": "xxx"
// }
//
// Supprimer TOUTES les notifications:
//
// {
//   "deleteAll": true
// }
// ============================================================

export async function DELETE(
  request: NextRequest,
) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Non authentifié.",
        },
        { status: 401 },
      );
    }

    const body = await parseJsonBody(request);

    if (!body) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Le corps de la requête doit être un JSON valide.",
        },
        { status: 400 },
      );
    }

    // --------------------------------------------------------
    // DELETE ALL
    // --------------------------------------------------------

    if (body.deleteAll === true) {
      const result =
        await prisma.notification.deleteMany({
          where: {
            userId: user.id,
          },
        });

      return NextResponse.json({
        success: true,
        message:
          "Toutes les notifications ont été supprimées.",
        deletedCount: result.count,
      });
    }

    // --------------------------------------------------------
    // DELETE SINGLE
    // --------------------------------------------------------

    const notificationId =
      typeof body.notificationId === "string"
        ? body.notificationId.trim()
        : "";

    if (!notificationId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "notificationId est requis.",
        },
        { status: 400 },
      );
    }

    const notification =
      await prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId: user.id,
        },
        select: {
          id: true,
        },
      });

    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Notification introuvable.",
        },
        { status: 404 },
      );
    }

    await prisma.notification.delete({
      where: {
        id: notification.id,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Notification supprimée avec succès.",
    });
  } catch (error) {
    console.error(
      "DELETE /api/notifications error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Impossible de supprimer la notification.",
      },
      { status: 500 },
    );
  }
}