"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

import {
  ArrowLeft,
  SquarePen,
  BadgeCheck,
  Copy,
  Crown,
  Wallet,
  TrendingUp,
  Trophy,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Globe,
  CalendarDays,
  Bell,
  Lock,
  Settings,
  ChevronRight,
  Bot,
  RefreshCw,
  Clock3,
  LogOut,
} from "lucide-react";

type ProfileUser = {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  createdAt: string;
};

type ProfileResponse = {
  success: boolean;
  message?: string;
  user?: ProfileUser;
};

export default function ProfilePage() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * ============================================================
   * LOAD PROFILE
   * ============================================================
   */

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/profile", {
        method: "GET",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data: ProfileResponse =
        await response.json();

      if (!response.ok || !data.success || !data.user) {
        throw new Error(
          data.message || "Unable to load profile."
        );
      }

      setUser(data.user);
    } catch (error) {
      console.error("PROFILE_LOAD_ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * INITIAL LOAD
   * ============================================================
   */

  useEffect(() => {
    loadProfile();
  }, []);

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050B18] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />

          <p className="text-gray-400 mt-4">
            Loading profile...
          </p>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (error || !user) {
    return (
      <main className="min-h-screen bg-[#050B18] text-white flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-3xl bg-[#101A2C] border border-slate-800 p-7 text-center">

          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <ShieldCheck
              size={30}
              className="text-red-400"
            />
          </div>

          <h1 className="text-2xl font-bold mt-5">
            Unable to load profile
          </h1>

          <p className="text-gray-400 mt-2">
            {error || "Please try again."}
          </p>

          <button
            type="button"
            onClick={loadProfile}
            className="block mt-6 w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 font-bold"
          >
            Try Again
          </button>

        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * PROFILE DATA
   * ============================================================
   */

  const userName =
    user.name || "AI User";

  const userEmail =
    user.email || "No email";

  /*
   * ============================================================
   * COPY
   * ============================================================
   */

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      console.log("Unable to copy text");
    }
  };

  /*
   * ============================================================
   * LOGOUT
   * ============================================================
   */

  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/login",
    });
  };

  /*
   * ============================================================
   * REGISTRATION DATE
   * ============================================================
   */

  const registrationDate = new Date(
    user.createdAt
  ).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-[#050B18] text-white">

      <div className="max-w-md mx-auto px-5 py-6 pb-32">

        {/* =========================
            HEADER
        ========================== */}

        <div className="flex items-center justify-between mb-8">

          <Link
            href="/dashboard"
            className="w-12 h-12 rounded-2xl bg-[#101A2C] border border-slate-800 flex items-center justify-center"
          >
            <ArrowLeft size={22} />
          </Link>

          <h1 className="text-2xl font-bold">
            Profile
          </h1>

          <button
            type="button"
            className="w-12 h-12 rounded-2xl bg-[#101A2C] border border-slate-800 flex items-center justify-center"
          >
            <SquarePen size={20} />
          </button>

        </div>


        {/* =========================
            PROFILE CARD
        ========================== */}

        <div className="rounded-3xl bg-[#101A2C] border border-slate-800 p-6">

          <div className="flex items-start gap-4">

            <Image
              src="/logo.png"
              alt="AI TONKEEPER"
              width={80}
              height={80}
              className="w-20 h-20 rounded-full border-2 border-cyan-500 object-cover"
            />

            <div className="flex-1 min-w-0">

              <div className="flex items-center gap-2">

                <h2 className="text-xl font-bold truncate">
                  {userName}
                </h2>

                <BadgeCheck
                  size={20}
                  className="text-cyan-400 shrink-0"
                />

              </div>

              <p className="text-gray-400 mt-1 text-sm truncate">
                {userEmail}
              </p>


              {/* Account ID */}

              <div className="mt-4 flex items-center gap-2">

                <div className="rounded-xl border border-slate-700 bg-[#050B18] px-3 py-2 min-w-0">

                  <span className="font-mono text-cyan-400 text-xs">
                    AI TONKEEPER
                  </span>

                </div>

                <button
                  type="button"
                  onClick={() => copyText(userEmail)}
                  className="w-10 h-10 shrink-0 rounded-xl bg-[#050B18] border border-slate-700 flex items-center justify-center"
                >

                  <Copy
                    size={17}
                    className="text-cyan-400"
                  />

                </button>

              </div>


              {/* Account status */}

              <div className="mt-4 flex items-center gap-2">

                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />

                <span className="text-green-400 font-medium text-sm">
                  Account Active
                </span>

              </div>

            </div>

          </div>


          {/* Premium */}

          <div className="mt-6 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-700 p-5">

            <div className="flex items-center justify-between gap-4">

              <div>

                <div className="flex items-center gap-2">

                  <Crown
                    size={22}
                    className="text-yellow-300"
                  />

                  <span className="font-bold text-lg">
                    Premium Member
                  </span>

                </div>

                <p className="text-blue-100 text-sm mt-2">
                  Enjoy AI TONKEEPER premium features.
                </p>

              </div>

              <div className="text-right shrink-0">

                <p className="text-xs text-blue-100">
                  Member
                </p>

                <p className="font-semibold">
                  2026
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* =========================
            STATISTICS
        ========================== */}

        <div className="grid grid-cols-2 gap-4 mt-6">

          {/* Balance */}

          <div className="rounded-3xl bg-[#101A2C] border border-slate-800 p-5">

            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-4">

              <Wallet
                size={23}
                className="text-cyan-400"
              />

            </div>

            <p className="text-sm text-gray-400">
              Total Balance
            </p>

            <h3 className="text-xl font-bold mt-2">
              0.0000 TON
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              ≈ $0.00 USD
            </p>

          </div>


          {/* AI Profit */}

          <div className="rounded-3xl bg-[#101A2C] border border-slate-800 p-5">

            <div className="w-11 h-11 rounded-2xl bg-green-500/20 flex items-center justify-center mb-4">

              <TrendingUp
                size={23}
                className="text-green-400"
              />

            </div>

            <p className="text-sm text-gray-400">
              AI Profit
            </p>

            <h3 className="text-xl font-bold text-green-400 mt-2">
              +0.00%
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              No completed trades
            </p>

          </div>


          {/* Success Rate */}

          <div className="rounded-3xl bg-[#101A2C] border border-slate-800 p-5">

            <div className="w-11 h-11 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-4">

              <Trophy
                size={23}
                className="text-purple-400"
              />

            </div>

            <p className="text-sm text-gray-400">
              AI Success Rate
            </p>

            <h3 className="text-xl font-bold mt-2">
              0%
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Waiting for first trade
            </p>

          </div>


          {/* Security */}

          <div className="rounded-3xl bg-[#101A2C] border border-slate-800 p-5">

            <div className="w-11 h-11 rounded-2xl bg-orange-500/20 flex items-center justify-center mb-4">

              <ShieldCheck
                size={23}
                className="text-orange-400"
              />

            </div>

            <p className="text-sm text-gray-400">
              Security
            </p>

            <h3 className="text-lg font-bold text-orange-400 mt-2">
              Protected
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Account security active
            </p>

          </div>

        </div>


        {/* =========================
            PERSONAL INFORMATION
        ========================== */}

        <div className="mt-7">

          <h2 className="text-xl font-bold mb-4">
            Personal Information
          </h2>

          <div className="rounded-3xl bg-[#101A2C] border border-slate-800 overflow-hidden">

            {/* Name */}

            <div className="flex items-center px-5 py-5 border-b border-slate-800">

              <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 flex items-center justify-center shrink-0">

                <User
                  size={21}
                  className="text-cyan-400"
                />

              </div>

              <div className="ml-4 min-w-0">

                <p className="text-sm text-gray-400">
                  Full Name
                </p>

                <p className="font-semibold truncate">
                  {userName}
                </p>

              </div>

            </div>


            {/* Email */}

            <div className="flex items-center px-5 py-5 border-b border-slate-800">

              <div className="w-11 h-11 rounded-2xl bg-blue-500/20 flex items-center justify-center shrink-0">

                <Mail
                  size={21}
                  className="text-blue-400"
                />

              </div>

              <div className="ml-4 min-w-0">

                <p className="text-sm text-gray-400">
                  Email Address
                </p>

                <p className="font-semibold truncate">
                  {userEmail}
                </p>

              </div>

            </div>


            {/* Phone */}

            <div className="flex items-center px-5 py-5 border-b border-slate-800">

              <div className="w-11 h-11 rounded-2xl bg-green-500/20 flex items-center justify-center shrink-0">

                <Phone
                  size={21}
                  className="text-green-400"
                />

              </div>

              <div className="ml-4">

                <p className="text-sm text-gray-400">
                  Phone Number
                </p>

                <p className="font-semibold">
                  Not Added
                </p>

              </div>

            </div>


            {/* Country */}

            <div className="flex items-center px-5 py-5 border-b border-slate-800">

              <div className="w-11 h-11 rounded-2xl bg-purple-500/20 flex items-center justify-center shrink-0">

                <Globe
                  size={21}
                  className="text-purple-400"
                />

              </div>

              <div className="ml-4">

                <p className="text-sm text-gray-400">
                  Country
                </p>

                <p className="font-semibold">
                  Not Selected
                </p>

              </div>

            </div>


            {/* Registration */}

            <div className="flex items-center px-5 py-5">

              <div className="w-11 h-11 rounded-2xl bg-orange-500/20 flex items-center justify-center shrink-0">

                <CalendarDays
                  size={21}
                  className="text-orange-400"
                />

              </div>

              <div className="ml-4">

                <p className="text-sm text-gray-400">
                  Registration Date
                </p>

                <p className="font-semibold">
                  {registrationDate}
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* =========================
            ACCOUNT & PREFERENCES
        ========================== */}

        <div className="mt-7">

          <h2 className="text-xl font-bold mb-4">
            Account & Preferences
          </h2>

          <div className="rounded-3xl bg-[#101A2C] border border-slate-800 overflow-hidden">

            {/* Notifications */}

            <Link
              href="/settings"
              className="w-full flex items-center justify-between px-5 py-5 border-b border-slate-800 hover:bg-[#16233D] transition"
            >

              <div className="flex items-center gap-4">

                <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 flex items-center justify-center">

                  <Bell
                    size={21}
                    className="text-cyan-400"
                  />

                </div>

                <div>

                  <p className="font-semibold">
                    Notifications
                  </p>

                  <p className="text-sm text-gray-400">
                    Push & Email Alerts
                  </p>

                </div>

              </div>

              <ChevronRight
                size={20}
                className="text-gray-500"
              />

            </Link>


            {/* Security */}

            <Link
              href="/security"
              className="w-full flex items-center justify-between px-5 py-5 border-b border-slate-800 hover:bg-[#16233D] transition"
            >

              <div className="flex items-center gap-4">

                <div className="w-11 h-11 rounded-2xl bg-green-500/20 flex items-center justify-center">

                  <Lock
                    size={21}
                    className="text-green-400"
                  />

                </div>

                <div>

                  <p className="font-semibold">
                    Security
                  </p>

                  <p className="text-sm text-gray-400">
                    Password, 2FA & Login Security
                  </p>

                </div>

              </div>

              <ChevronRight
                size={20}
                className="text-gray-500"
              />

            </Link>


            {/* AI Trade */}

            <Link
              href="/dashboard"
              className="w-full flex items-center justify-between px-5 py-5 border-b border-slate-800 hover:bg-[#16233D] transition"
            >

              <div className="flex items-center gap-4">

                <div className="w-11 h-11 rounded-2xl bg-purple-500/20 flex items-center justify-center">

                  <Bot
                    size={21}
                    className="text-purple-400"
                  />

                </div>

                <div>

                  <p className="font-semibold">
                    AI Trade Settings
                  </p>

                  <p className="text-sm text-gray-400">
                    Configure AI trading preferences
                  </p>

                </div>

              </div>

              <ChevronRight
                size={20}
                className="text-gray-500"
              />

            </Link>


            {/* App Settings */}

            <Link
              href="/settings"
              className="w-full flex items-center justify-between px-5 py-5 border-b border-slate-800 hover:bg-[#16233D] transition"
            >

              <div className="flex items-center gap-4">

                <div className="w-11 h-11 rounded-2xl bg-orange-500/20 flex items-center justify-center">

                  <Settings
                    size={21}
                    className="text-orange-400"
                  />

                </div>

                <div>

                  <p className="font-semibold">
                    App Settings
                  </p>

                  <p className="text-sm text-gray-400">
                    Language, Theme & Preferences
                  </p>

                </div>

              </div>

              <ChevronRight
                size={20}
                className="text-gray-500"
              />

            </Link>


            {/* Trading History */}

            <Link
              href="/dashboard"
              className="w-full flex items-center justify-between px-5 py-5 hover:bg-[#16233D] transition"
            >

              <div className="flex items-center gap-4">

                <div className="w-11 h-11 rounded-2xl bg-blue-500/20 flex items-center justify-center">

                  <Clock3
                    size={21}
                    className="text-blue-400"
                  />

                </div>

                <div>

                  <p className="font-semibold">
                    Trading History
                  </p>

                  <p className="text-sm text-gray-400">
                    View AI trading activity
                  </p>

                </div>

              </div>

              <ChevronRight
                size={20}
                className="text-gray-500"
              />

            </Link>

          </div>

        </div>


        {/* =========================
            QUICK ACTIONS
        ========================== */}

        <div className="mt-7">

          <h2 className="text-xl font-bold mb-4">
            Quick Actions
          </h2>

          <div className="grid grid-cols-2 gap-4">

            <button
              type="button"
              onClick={loadProfile}
              className="rounded-3xl bg-[#101A2C] border border-slate-800 p-5 hover:border-cyan-500 transition"
            >

              <RefreshCw
                size={28}
                className="text-cyan-400 mx-auto"
              />

              <p className="mt-3 font-semibold text-center">
                Refresh Profile
              </p>

            </button>


            <Link
              href="/dashboard"
              className="rounded-3xl bg-[#101A2C] border border-slate-800 p-5 hover:border-purple-500 transition"
            >

              <Bot
                size={28}
                className="text-purple-400 mx-auto"
              />

              <p className="mt-3 font-semibold text-center">
                AI Trade
              </p>

            </Link>

          </div>

        </div>


        {/* =========================
            LOG OUT
        ========================== */}

        <button
          type="button"
          onClick={handleLogout}
          className="w-full mt-8 rounded-3xl bg-red-500/10 border border-red-500/20 p-5 hover:bg-red-500/20 transition"
        >

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-4">

              <div className="w-11 h-11 rounded-2xl bg-red-500/20 flex items-center justify-center">

                <LogOut
                  size={23}
                  className="text-red-400"
                />

              </div>

              <div className="text-left">

                <p className="font-bold text-red-400">
                  Log Out
                </p>

                <p className="text-sm text-gray-400">
                  Securely sign out of your account
                </p>

              </div>

            </div>

            <ChevronRight
              size={20}
              className="text-gray-500"
            />

          </div>

        </button>

      </div>


      {/* =========================
          BOTTOM NAVIGATION
      ========================== */}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-[#0B1220]/95 backdrop-blur-xl">

        <div className="max-w-md mx-auto grid grid-cols-5 h-20">

          {/* Profile */}

          <Link
            href="/profile"
            className="flex flex-col items-center justify-center text-cyan-400"
          >

            <User size={22} />

            <span className="text-[11px] mt-1 font-semibold">
              Profile
            </span>

          </Link>


          {/* Wallet */}

          <Link
            href="/dashboard"
            className="flex flex-col items-center justify-center text-gray-500"
          >

            <Wallet size={22} />

            <span className="text-[11px] mt-1">
              Wallet
            </span>

          </Link>


          {/* Swap */}

          <Link
            href="/dashboard"
            className="flex flex-col items-center justify-center text-gray-500"
          >

            <RefreshCw size={22} />

            <span className="text-[11px] mt-1">
              Swap
            </span>

          </Link>


          {/* History */}

          <Link
            href="/dashboard"
            className="flex flex-col items-center justify-center text-gray-500"
          >

            <Clock3 size={22} />

            <span className="text-[11px] mt-1">
              History
            </span>

          </Link>


          {/* Settings */}

          <Link
            href="/settings"
            className="flex flex-col items-center justify-center text-gray-500"
          >

            <Settings size={22} />

            <span className="text-[11px] mt-1">
              Settings
            </span>

          </Link>

        </div>

      </nav>

    </main>
  );
}