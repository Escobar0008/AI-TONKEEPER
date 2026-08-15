import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

type CreateNotificationParams = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string | null;
};

/**
 * ============================================================
 * CREATE NOTIFICATION
 * ============================================================
 *
 * Helper central pour créer une notification utilisateur.
 *
 * Exemple :
 *
 * await createNotification({
 *   userId,
 *   type: NotificationType.DEPOSIT,
 *   title: "Deposit received",
 *   message: "Your deposit has been received.",
 * });
 *
 * ============================================================
 */

export async function createNotification({
  userId,
  type,
  title,
  message,
  actionUrl = null,
}: CreateNotificationParams) {
  if (!userId) {
    throw new Error("createNotification: userId is required.");
  }

  if (!title.trim()) {
    throw new Error("createNotification: title is required.");
  }

  if (!message.trim()) {
    throw new Error("createNotification: message is required.");
  }

  return prisma.notification.create({
    data: {
      userId,
      type,
      title: title.trim(),
      message: message.trim(),
      actionUrl: actionUrl?.trim() || null,
    },
  });
}

/**
 * ============================================================
 * MARK NOTIFICATION AS READ
 * ============================================================
 */

export async function markNotificationAsRead(
  notificationId: string,
  userId: string,
) {
  if (!notificationId) {
    throw new Error("markNotificationAsRead: notificationId is required.");
  }

  if (!userId) {
    throw new Error("markNotificationAsRead: userId is required.");
  }

  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!notification) {
    return null;
  }

  return prisma.notification.update({
    where: {
      id: notification.id,
    },
    data: {
      read: true,
    },
  });
}

/**
 * ============================================================
 * MARK ALL NOTIFICATIONS AS READ
 * ============================================================
 */

export async function markAllNotificationsAsRead(userId: string) {
  if (!userId) {
    throw new Error("markAllNotificationsAsRead: userId is required.");
  }

  return prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: {
      read: true,
    },
  });
}

/**
 * ============================================================
 * GET USER NOTIFICATIONS
 * ============================================================
 */

export async function getUserNotifications(
  userId: string,
  options?: {
    unreadOnly?: boolean;
    limit?: number;
  },
) {
  if (!userId) {
    throw new Error("getUserNotifications: userId is required.");
  }

  const unreadOnly = options?.unreadOnly ?? false;

  const requestedLimit = options?.limit ?? 20;

  const limit =
    Number.isFinite(requestedLimit) && requestedLimit > 0
      ? Math.min(Math.floor(requestedLimit), 100)
      : 20;

  return prisma.notification.findMany({
    where: {
      userId,
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
}

/**
 * ============================================================
 * GET UNREAD NOTIFICATION COUNT
 * ============================================================
 */

export async function getUnreadNotificationCount(userId: string) {
  if (!userId) {
    throw new Error("getUnreadNotificationCount: userId is required.");
  }

  return prisma.notification.count({
    where: {
      userId,
      read: false,
    },
  });
}

/**
 * ============================================================
 * DELETE NOTIFICATION
 * ============================================================
 */

export async function deleteNotification(
  notificationId: string,
  userId: string,
) {
  if (!notificationId) {
    throw new Error("deleteNotification: notificationId is required.");
  }

  if (!userId) {
    throw new Error("deleteNotification: userId is required.");
  }

  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!notification) {
    return null;
  }

  return prisma.notification.delete({
    where: {
      id: notification.id,
    },
  });
}

/**
 * ============================================================
 * DELETE ALL USER NOTIFICATIONS
 * ============================================================
 */

export async function deleteAllNotifications(userId: string) {
  if (!userId) {
    throw new Error("deleteAllNotifications: userId is required.");
  }

  return prisma.notification.deleteMany({
    where: {
      userId,
    },
  });
}
