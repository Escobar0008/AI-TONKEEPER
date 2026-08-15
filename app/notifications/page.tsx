"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Bell,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Gift,
  RefreshCw,
  Shield,
  Trash2,
  Wallet,
} from "lucide-react";
type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  read: boolean;
  createdAt: string;
};
type NotificationsResponse = {
  success?: boolean;
  notifications?: NotificationItem[];
  unreadCount?: number;
  message?: string;
};
function getNotificationIcon(type: string) {
  switch (type.toUpperCase()) {
    case "DEPOSIT":
      return {
        icon: ArrowDownLeft,
        bg: "bg-green-500/10",
        color: "text-green-400",
      };
    case "WITHDRAW":
    case "WITHDRAWAL":
      return {
        icon: ArrowUpRight,
        bg: "bg-red-500/10",
        color: "text-red-400",
      };
    case "SWAP":
      return {
        icon: RefreshCw,
        bg: "bg-cyan-500/10",
        color: "text-cyan-400",
      };
    case "BUY":
    case "PURCHASE":
      return {
        icon: CreditCard,
        bg: "bg-blue-500/10",
        color: "text-blue-400",
      };
    case "AI":
    case "AI_TRADING":
    case "TRADE":
      return {
        icon: Bot,
        bg: "bg-purple-500/10",
        color: "text-purple-400",
      };
    case "KYC":
      return {
        icon: Shield,
        bg: "bg-orange-500/10",
        color: "text-orange-400",
      };
    case "REFERRAL":
      return {
        icon: Gift,
        bg: "bg-yellow-500/10",
        color: "text-yellow-400",
      };
    case "SECURITY":
      return {
        icon: Shield,
        bg: "bg-orange-500/10",
        color: "text-orange-400",
      };
    case "SYSTEM":
    default:
      return {
        icon: Bell,
        bg: "bg-cyan-500/10",
        color: "text-cyan-400",
      };
  }
}
function formatNotificationDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  /*
   * ============================================================
   * LOAD NOTIFICATIONS
   * ============================================================
   */
  const loadNotifications = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/notifications?limit=100", {
        method: "GET",
        cache: "no-store",
      });
      const data = (await response.json()) as NotificationsResponse;
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load notifications.");
      }
      setNotifications(
        Array.isArray(data.notifications) ? data.notifications : [],
      );
      setUnreadCount(
        typeof data.unreadCount === "number" ? data.unreadCount : 0,
      );
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError(
        err instanceof Error ? err.message : "Unable to load notifications.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);
  /*
   * ============================================================
   * MARK ONE AS READ
   * ============================================================
   */
  const markAsRead = async (notification: NotificationItem) => {
    if (notification.read) {
      return;
    }
    try {
      setProcessingId(notification.id);
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notificationId: notification.id,
          read: true,
        }),
      });
      const data = (await response.json()) as NotificationsResponse;
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update notification.");
      }
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                read: true,
              }
            : item,
        ),
      );
      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      alert(
        err instanceof Error ? err.message : "Unable to update notification.",
      );
    } finally {
      setProcessingId(null);
    }
  };
  /*
   * ============================================================
   * MARK ALL AS READ
   * ============================================================
   */
  const markAllAsRead = async () => {
    if (unreadCount === 0 || markingAll) {
      return;
    }
    try {
      setMarkingAll(true);
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          markAllAsRead: true,
        }),
      });
      const data = (await response.json()) as NotificationsResponse;
      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to mark notifications as read.",
        );
      }
      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          read: true,
        })),
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Unable to mark notifications as read.",
      );
    } finally {
      setMarkingAll(false);
    }
  };
  /*
   * ============================================================
   * DELETE ONE NOTIFICATION
   * ============================================================
   */
  const deleteNotification = async (notification: NotificationItem) => {
    try {
      setProcessingId(notification.id);
      const response = await fetch("/api/notifications", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notificationId: notification.id,
        }),
      });
      const data = (await response.json()) as NotificationsResponse;
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete notification.");
      }
      setNotifications((current) =>
        current.filter((item) => item.id !== notification.id),
      );
      if (!notification.read) {
        setUnreadCount((current) => Math.max(0, current - 1));
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
      alert(
        err instanceof Error ? err.message : "Unable to delete notification.",
      );
    } finally {
      setProcessingId(null);
    }
  };
  /*
   * ============================================================
   * DELETE ALL
   * ============================================================
   */
  const deleteAllNotifications = async () => {
    if (notifications.length === 0) {
      return;
    }
    const confirmed = window.confirm("Delete all notifications?");
    if (!confirmed) {
      return;
    }
    try {
      setProcessingId("ALL");
      const response = await fetch("/api/notifications", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deleteAll: true,
        }),
      });
      const data = (await response.json()) as NotificationsResponse;
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete notifications.");
      }
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to delete all notifications:", err);
      alert(
        err instanceof Error ? err.message : "Unable to delete notifications.",
      );
    } finally {
      setProcessingId(null);
    }
  };
  /*
   * ============================================================
   * SUMMARY
   * ============================================================
   */
  const notificationCount = useMemo(
    () => notifications.length,
    [notifications],
  );
  /*
   * ============================================================
   * RENDER
   * ============================================================
   */
  return (
    <main className="min-h-screen bg-[#050B18] text-white">
      <div className="mx-auto max-w-md px-5 py-6 pb-28">
        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/dashboard">
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-[#101A2C]"
              aria-label="Go back"
            >
              <ArrowLeft size={22} />
            </button>
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="mt-1 text-sm text-slate-400">
              Stay updated with your account
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-[#101A2C]">
            <Bell size={22} className="text-cyan-400" />
          </div>
        </div>
        {/* ================================================== */}
        {/* SUMMARY */}
        {/* ================================================== */}
        <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Notification Center</h2>
              <p className="mt-2 text-cyan-100">
                View all important updates from AI TONKEEPER.
              </p>
            </div>
            <Bell size={44} className="text-white" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-sm text-cyan-100">Unread</p>
              <p className="mt-2 text-3xl font-bold">{unreadCount}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-sm text-cyan-100">Total</p>
              <p className="mt-2 text-3xl font-bold">{notificationCount}</p>
            </div>
          </div>
        </div>
        {/* ================================================== */}
        {/* ERROR */}
        {/* ================================================== */}
        {error && (
          <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}
        {/* ================================================== */}
        {/* LOADING */}
        {/* ================================================== */}
        {loading ? (
          <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-8 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />
            <p className="mt-4 text-sm text-slate-400">
              Loading notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          /* ================================================== */
          /* EMPTY STATE */
          /* ================================================== */
          <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10">
              <Bell size={30} className="text-cyan-400" />
            </div>
            <h2 className="mt-5 text-lg font-bold">No notifications</h2>
            <p className="mt-2 text-sm text-slate-400">
              You&apos;re all caught up. New account activity will appear here.
            </p>
          </div>
        ) : (
          /* ================================================== */
          /* NOTIFICATIONS */
          /* ================================================== */
          <div className="mt-8 space-y-4">
            {notifications.map((notification) => {
              const notificationStyle = getNotificationIcon(notification.type);
              const Icon = notificationStyle.icon;
              const isProcessing = processingId === notification.id;
              const content = (
                <div
                  className={`relative rounded-3xl border p-5 transition ${
                    notification.read
                      ? "border-slate-800 bg-[#101A2C]"
                      : "border-cyan-500/40 bg-[#101A2C]"
                  }`}
                >
                  {!notification.read && (
                    <div className="absolute right-5 top-5 h-2.5 w-2.5 rounded-full bg-cyan-400" />
                  )}
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${notificationStyle.bg}`}
                    >
                      <Icon size={26} className={notificationStyle.color} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3 pr-5">
                        <div>
                          <h3 className="font-bold">{notification.title}</h3>
                          <p className="mt-1 text-sm leading-5 text-slate-400">
                            {notification.message}
                          </p>
                        </div>
                        {notification.read ? (
                          <CheckCircle2
                            size={20}
                            className="shrink-0 text-green-400"
                          />
                        ) : (
                          <Clock3
                            size={20}
                            className="shrink-0 text-cyan-400"
                          />
                        )}
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span className="text-xs text-slate-500">
                          {formatNotificationDate(notification.createdAt)}
                        </span>
                        <div className="flex items-center gap-3">
                          {!notification.read && (
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                void markAsRead(notification);
                              }}
                              className="text-xs font-semibold text-cyan-400 disabled:text-slate-600"
                            >
                              Mark read
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              void deleteNotification(notification);
                            }}
                            className="text-slate-500 transition hover:text-red-400 disabled:text-slate-700"
                            aria-label="Delete notification"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
              if (notification.actionUrl) {
                return (
                  <Link
                    href={notification.actionUrl}
                    key={notification.id}
                    onClick={() => {
                      if (!notification.read) {
                        void markAsRead(notification);
                      }
                    }}
                  >
                    {content}
                  </Link>
                );
              }
              return (
                <button
                  type="button"
                  key={notification.id}
                  className="block w-full text-left"
                  onClick={() => {
                    if (!notification.read) {
                      void markAsRead(notification);
                    }
                  }}
                >
                  {content}
                </button>
              );
            })}
          </div>
        )}
        {/* ================================================== */}
        {/* ACTIONS */}
        {/* ================================================== */}
        {notifications.length > 0 && (
          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0 || markingAll}
              className="w-full rounded-3xl bg-cyan-500 py-5 text-lg font-bold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
            >
              {markingAll
                ? "Marking..."
                : unreadCount > 0
                  ? "Mark All as Read"
                  : "All Notifications Read"}
            </button>
            <button
              type="button"
              onClick={deleteAllNotifications}
              disabled={processingId === "ALL"}
              className="flex w-full items-center justify-center gap-2 rounded-3xl border border-red-500/30 bg-red-500/5 py-4 font-semibold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:text-slate-600"
            >
              <Trash2 size={18} />
              Delete All Notifications
            </button>
          </div>
        )}
        {/* ================================================== */}
        {/* FOOTER */}
        {/* ================================================== */}
        <div className="mt-10 text-center">
          <p className="text-sm text-slate-500">
            AI TONKEEPER Notification Center
          </p>
          <p className="mt-2 font-semibold text-cyan-400">ai-tonkeeper.xyz</p>
          <p className="mt-6 text-xs text-slate-600">
            © 2026 AI TONKEEPER. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
}
