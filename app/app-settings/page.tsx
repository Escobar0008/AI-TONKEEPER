"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Languages,
  MoonStar,
  Globe,
  Mail,
  Smartphone,
  Settings,
} from "lucide-react";

const LANGUAGES = [
  {
    value: "English",
    label: "English",
    description: "English language",
    icon: Globe,
    iconClass: "text-cyan-400",
    bgClass: "bg-cyan-500/20",
  },
  {
    value: "Français",
    label: "Français",
    description: "French language",
    icon: Languages,
    iconClass: "text-blue-400",
    bgClass: "bg-blue-500/20",
  },
  {
    value: "Español",
    label: "Español",
    description: "Spanish language",
    icon: Languages,
    iconClass: "text-purple-400",
    bgClass: "bg-purple-500/20",
  },
  {
    value: "Deutsch",
    label: "Deutsch",
    description: "German language",
    icon: Languages,
    iconClass: "text-yellow-400",
    bgClass: "bg-yellow-500/20",
  },
] as const;

type Language =
  (typeof LANGUAGES)[number]["value"];

export default function AppSettingsPage() {
  const router = useRouter();

  const [language, setLanguage] =
    useState<Language>("English");

  const [appearance, setAppearance] =
    useState("Dark Theme");

  const [pushNotifications, setPushNotifications] =
    useState(true);

  const [emailAlerts, setEmailAlerts] =
    useState(true);

  const [loading, setLoading] =
    useState(true);

  const [savingLanguage, setSavingLanguage] =
    useState(false);

  const [savingNotifications, setSavingNotifications] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // ==========================================================
  // LOAD CURRENT SETTINGS
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        setLoading(true);
        setError("");

        const [
          languageResponse,
          notificationsResponse,
        ] = await Promise.all([
          fetch("/api/settings/language", {
            method: "GET",
            cache: "no-store",
          }),

          fetch("/api/settings/notifications", {
            method: "GET",
            cache: "no-store",
          }),
        ]);

        const languageData =
          await languageResponse.json();

        const notificationsData =
          await notificationsResponse.json();

        if (!languageResponse.ok) {
          throw new Error(
            languageData?.message ||
              "Unable to load language settings.",
          );
        }

        if (!notificationsResponse.ok) {
          throw new Error(
            notificationsData?.message ||
              "Unable to load notification settings.",
          );
        }

        if (cancelled) {
          return;
        }

        if (
          languageData?.success &&
          typeof languageData.language ===
            "string" &&
          LANGUAGES.some(
            (item) =>
              item.value === languageData.language,
          )
        ) {
          setLanguage(
            languageData.language as Language,
          );
        }

        if (
          notificationsData?.success &&
          notificationsData.notifications
        ) {
          const notifications =
            notificationsData.notifications;

          if (
            typeof notifications.pushNotifications ===
            "boolean"
          ) {
            setPushNotifications(
              notifications.pushNotifications,
            );
          }

          if (
            typeof notifications.emailAlerts ===
            "boolean"
          ) {
            setEmailAlerts(
              notifications.emailAlerts,
            );
          }
        }
      } catch (err) {
        console.error(
          "SETTINGS_LOAD_ERROR:",
          err,
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load settings.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  // ==========================================================
  // CHANGE LANGUAGE
  // ==========================================================

  async function handleLanguageChange(
    selectedLanguage: Language,
  ) {
    if (
      savingLanguage ||
      selectedLanguage === language
    ) {
      return;
    }

    const previousLanguage = language;

    setLanguage(selectedLanguage);
    setSavingLanguage(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "/api/settings/language",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            language: selectedLanguage,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            "Unable to update language.",
        );
      }

      setLanguage(selectedLanguage);

      setMessage(
        `Language changed to ${selectedLanguage}.`,
      );
    } catch (err) {
      console.error(
        "LANGUAGE_UPDATE_ERROR:",
        err,
      );

      setLanguage(previousLanguage);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update language.",
      );
    } finally {
      setSavingLanguage(false);
    }
  }

  // ==========================================================
  // CHANGE NOTIFICATIONS
  // ==========================================================

  async function handleNotificationChange(
    type:
      | "pushNotifications"
      | "emailAlerts",
    value: boolean,
  ) {
    if (savingNotifications) {
      return;
    }

    const previousPush =
      pushNotifications;

    const previousEmail =
      emailAlerts;

    if (type === "pushNotifications") {
      setPushNotifications(value);
    } else {
      setEmailAlerts(value);
    }

    setSavingNotifications(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "/api/settings/notifications",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            [type]: value,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            "Unable to update notification settings.",
        );
      }

      setMessage(
        "Notification settings updated.",
      );
    } catch (err) {
      console.error(
        "NOTIFICATION_UPDATE_ERROR:",
        err,
      );

      setPushNotifications(previousPush);
      setEmailAlerts(previousEmail);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update notification settings.",
      );
    } finally {
      setSavingNotifications(false);
    }
  }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050B18] text-white pb-32">
        <div className="max-w-md mx-auto px-5 py-6">
          <div className="flex items-center justify-between mb-8">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-12 h-12 rounded-2xl bg-[#101A2C] border border-slate-800 flex items-center justify-center"
            >
              <ArrowLeft size={22} />
            </button>

            <h1 className="text-2xl font-bold">
              App Settings
            </h1>

            <div className="w-12 h-12 rounded-2xl bg-[#101A2C] border border-slate-800 flex items-center justify-center">
              <Settings
                size={21}
                className="text-cyan-400"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-6 text-center">
            <p className="text-slate-400">
              Loading settings...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050B18] text-white pb-32">
      <div className="max-w-md mx-auto px-5 py-6">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex items-center justify-between mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-12 h-12 rounded-2xl bg-[#101A2C] border border-slate-800 flex items-center justify-center hover:bg-[#16233D] transition"
          >
            <ArrowLeft size={22} />
          </button>

          <h1 className="text-2xl font-bold">
            App Settings
          </h1>

          <div className="w-12 h-12 rounded-2xl bg-[#101A2C] border border-slate-800 flex items-center justify-center">
            <Settings
              size={21}
              className="text-cyan-400"
            />
          </div>
        </div>

        {/* =====================================================
            STATUS MESSAGE
        ====================================================== */}

        {message && (
          <div className="mb-6 rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* =====================================================
            LANGUAGE
        ====================================================== */}

        <section>
          <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-4">
            Language
          </h2>

          <div className="rounded-3xl bg-[#101A2C] border border-slate-800 overflow-hidden">

            {LANGUAGES.map(
              ({
                value,
                label,
                description,
                icon: Icon,
                iconClass,
                bgClass,
              }) => (
                <button
                  key={value}
                  type="button"
                  disabled={savingLanguage}
                  onClick={() =>
                    handleLanguageChange(
                      value,
                    )
                  }
                  className={`w-full flex items-center justify-between px-5 py-5 hover:bg-[#16233D] transition disabled:opacity-60 ${
                    value !== "Deutsch"
                      ? "border-b border-slate-800"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl ${bgClass} flex items-center justify-center`}
                    >
                      <Icon
                        size={24}
                        className={iconClass}
                      />
                    </div>

                    <div className="text-left">
                      <p className="font-semibold">
                        {label}
                      </p>

                      <p className="text-sm text-gray-400">
                        {description}
                      </p>
                    </div>
                  </div>

                  {language === value && (
                    <Check
                      size={22}
                      className="text-cyan-400"
                    />
                  )}
                </button>
              ),
            )}

          </div>

          {savingLanguage && (
            <p className="mt-3 text-center text-xs text-cyan-400">
              Saving language...
            </p>
          )}
        </section>

        {/* =====================================================
            APPEARANCE
        ====================================================== */}

        <section className="mt-8">
          <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-4">
            Appearance
          </h2>

          <div className="rounded-3xl bg-[#101A2C] border border-slate-800 overflow-hidden">

            <button
              type="button"
              onClick={() =>
                setAppearance("Dark Theme")
              }
              className="w-full flex items-center justify-between px-5 py-5 hover:bg-[#16233D] transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                  <MoonStar
                    size={24}
                    className="text-purple-400"
                  />
                </div>

                <div className="text-left">
                  <p className="font-semibold">
                    Dark Theme
                  </p>

                  <p className="text-sm text-gray-400">
                    AI TONKEEPER dark interface
                  </p>
                </div>
              </div>

              {appearance === "Dark Theme" && (
                <Check
                  size={22}
                  className="text-cyan-400"
                />
              )}
            </button>

          </div>
        </section>

        {/* =====================================================
            NOTIFICATIONS
        ====================================================== */}

        <section className="mt-8">
          <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-4">
            Notifications
          </h2>

          <div className="rounded-3xl bg-[#101A2C] border border-slate-800 overflow-hidden">

            {/* PUSH */}

            <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
                  <Smartphone
                    size={24}
                    className="text-cyan-400"
                  />
                </div>

                <div>
                  <p className="font-semibold">
                    Push Notifications
                  </p>

                  <p className="text-sm text-gray-400">
                    Receive wallet alerts
                  </p>
                </div>
              </div>

              <button
                type="button"
                aria-label="Toggle push notifications"
                disabled={
                  savingNotifications
                }
                onClick={() =>
                  handleNotificationChange(
                    "pushNotifications",
                    !pushNotifications,
                  )
                }
                className={`relative w-12 h-7 rounded-full transition disabled:opacity-60 ${
                  pushNotifications
                    ? "bg-cyan-500"
                    : "bg-slate-700"
                }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white transition ${
                    pushNotifications
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* EMAIL */}

            <div className="flex items-center justify-between px-5 py-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
                  <Mail
                    size={24}
                    className="text-green-400"
                  />
                </div>

                <div>
                  <p className="font-semibold">
                    Email Alerts
                  </p>

                  <p className="text-sm text-gray-400">
                    Security and account alerts
                  </p>
                </div>
              </div>

              <button
                type="button"
                aria-label="Toggle email alerts"
                disabled={
                  savingNotifications
                }
                onClick={() =>
                  handleNotificationChange(
                    "emailAlerts",
                    !emailAlerts,
                  )
                }
                className={`relative w-12 h-7 rounded-full transition disabled:opacity-60 ${
                  emailAlerts
                    ? "bg-cyan-500"
                    : "bg-slate-700"
                }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white transition ${
                    emailAlerts
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>

          </div>

          {savingNotifications && (
            <p className="mt-3 text-center text-xs text-cyan-400">
              Saving notification settings...
            </p>
          )}
        </section>

        {/* =====================================================
            CURRENT SETTINGS
        ====================================================== */}

        <section className="mt-8">
          <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-5">

            <div className="flex items-center gap-3">
              <Settings
                size={22}
                className="text-cyan-400"
              />

              <p className="font-semibold">
                Current Settings
              </p>
            </div>

            <div className="mt-4 space-y-3 text-sm">

              <div className="flex justify-between gap-4">
                <span className="text-gray-400">
                  Language
                </span>

                <span className="text-cyan-400 font-medium">
                  {language}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-400">
                  Appearance
                </span>

                <span className="text-cyan-400 font-medium">
                  {appearance}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-400">
                  Push Alerts
                </span>

                <span
                  className={
                    pushNotifications
                      ? "text-green-400"
                      : "text-gray-500"
                  }
                >
                  {pushNotifications
                    ? "Enabled"
                    : "Disabled"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-400">
                  Email Alerts
                </span>

                <span
                  className={
                    emailAlerts
                      ? "text-green-400"
                      : "text-gray-500"
                  }
                >
                  {emailAlerts
                    ? "Enabled"
                    : "Disabled"}
                </span>
              </div>

            </div>
          </div>
        </section>

        {/* =====================================================
            BACK TO SETTINGS
        ====================================================== */}

        <button
          type="button"
          onClick={() => router.push("/settings")}
          className="w-full mt-8 rounded-2xl border border-slate-800 bg-[#101A2C] py-4 font-semibold hover:bg-[#16233D] transition"
        >
          Back to Settings
        </button>

      </div>
    </main>
  );
}