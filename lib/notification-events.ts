import { NotificationType } from "@prisma/client";
import { createNotification } from "@/lib/notifications";

/**
 * ============================================================
 * NOTIFICATION EVENTS
 * ============================================================
 *
 * Centralise les notifications automatiques de AI TONKEEPER.
 *
 * Les APIs métier pourront appeler ces fonctions après
 * une opération réussie.
 * ============================================================
 */

/**
 * ============================================================
 * SYSTEM
 * ============================================================
 */

export async function notifySystem(
  userId: string,
  title: string,
  message: string,
  actionUrl?: string | null,
) {
  return createNotification({
    userId,
    type: NotificationType.SYSTEM,
    title,
    message,
    actionUrl,
  });
}

/**
 * ============================================================
 * SECURITY
 * ============================================================
 */

export async function notifySecurity(
  userId: string,
  title: string,
  message: string,
  actionUrl?: string | null,
) {
  return createNotification({
    userId,
    type: NotificationType.SECURITY,
    title,
    message,
    actionUrl,
  });
}

/**
 * ============================================================
 * KYC
 * ============================================================
 */

export async function notifyKYC(
  userId: string,
  title: string,
  message: string,
  actionUrl?: string | null,
) {
  return createNotification({
    userId,
    type: NotificationType.KYC,
    title,
    message,
    actionUrl,
  });
}

/**
 * ============================================================
 * DEPOSIT
 * ============================================================
 */

export async function notifyDeposit(
  userId: string,
  title: string,
  message: string,
  actionUrl: string = "/deposit",
) {
  return createNotification({
    userId,
    type: NotificationType.DEPOSIT,
    title,
    message,
    actionUrl,
  });
}

/**
 * ============================================================
 * WITHDRAWAL
 * ============================================================
 */

export async function notifyWithdrawal(
  userId: string,
  title: string,
  message: string,
  actionUrl: string = "/withdraw",
) {
  return createNotification({
    userId,
    type: NotificationType.WITHDRAWAL,
    title,
    message,
    actionUrl,
  });
}

/**
 * ============================================================
 * SWAP
 * ============================================================
 */

export async function notifySwap(
  userId: string,
  title: string,
  message: string,
  actionUrl: string = "/swap",
) {
  return createNotification({
    userId,
    type: NotificationType.SWAP,
    title,
    message,
    actionUrl,
  });
}

/**
 * ============================================================
 * AI TRADE
 * ============================================================
 */

export async function notifyAITrade(
  userId: string,
  title: string,
  message: string,
  actionUrl: string = "/ai-trade",
) {
  return createNotification({
    userId,
    type: NotificationType.AI_TRADE,
    title,
    message,
    actionUrl,
  });
}

/**
 * ============================================================
 * REFERRAL
 * ============================================================
 */

export async function notifyReferral(
  userId: string,
  title: string,
  message: string,
  actionUrl: string = "/referral",
) {
  return createNotification({
    userId,
    type: NotificationType.REFERRAL,
    title,
    message,
    actionUrl,
  });
}
