"use client";

import Link from "next/link";
import {
  Shield,
  Users,
  Wallet,
  Bot,
  TrendingUp,
  Activity,
  Settings,
  Database,
  Bell,
  ArrowLeft,
  FileCheck,
  ChevronRight,
} from "lucide-react";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#050B18] text-white">
      <div className="mx-auto max-w-md px-5 py-6 pb-10">

        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-[#101A2C] transition hover:border-cyan-500"
          >
            <ArrowLeft size={20} />
          </Link>

          <div className="text-center">
            <h1 className="text-2xl font-bold">
              Admin Dashboard
            </h1>

            <p className="text-sm text-gray-400">
              AI TONKEEPER Control Center
            </p>
          </div>

          <div className="w-10" />
        </div>

        {/* ADMIN CARD */}
        <div className="mb-6 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">
          <div className="mb-3 flex items-center gap-3">
            <Shield size={34} />

            <div>
              <h2 className="text-xl font-bold">
                Administrator
              </h2>

              <p className="text-sm text-cyan-100">
                Full platform management
              </p>
            </div>
          </div>

          <p className="text-sm text-cyan-50">
            Monitor users, wallets, KYC verification, AI Trading,
            transactions and the complete AI TONKEEPER ecosystem.
          </p>
        </div>

        {/* STATISTICS */}
        <div className="mb-6 grid grid-cols-2 gap-4">

          <div className="rounded-2xl border border-slate-800 bg-[#101A2C] p-4">
            <Users
              className="mb-2 text-cyan-400"
              size={28}
            />

            <p className="text-sm text-gray-400">
              Users
            </p>

            <h3 className="text-2xl font-bold">
              —
            </h3>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#101A2C] p-4">
            <Wallet
              className="mb-2 text-green-400"
              size={28}
            />

            <p className="text-sm text-gray-400">
              Wallets
            </p>

            <h3 className="text-2xl font-bold">
              —
            </h3>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#101A2C] p-4">
            <Bot
              className="mb-2 text-purple-400"
              size={28}
            />

            <p className="text-sm text-gray-400">
              AI Bots
            </p>

            <h3 className="text-2xl font-bold">
              —
            </h3>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#101A2C] p-4">
            <TrendingUp
              className="mb-2 text-yellow-400"
              size={28}
            />

            <p className="text-sm text-gray-400">
              AI Trades
            </p>

            <h3 className="text-2xl font-bold">
              —
            </h3>
          </div>

        </div>

        {/* KYC MANAGEMENT */}
        <div className="mb-6 rounded-3xl border border-cyan-500/30 bg-[#101A2C] p-5">

          <div className="mb-4 flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20">
              <FileCheck
                size={25}
                className="text-cyan-400"
              />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                KYC Management
              </h2>

              <p className="text-sm text-gray-400">
                Review user identity verification
              </p>
            </div>

          </div>

          <p className="mb-5 text-sm leading-6 text-slate-400">
            View submitted KYC information and identity documents,
            review verification requests and approve or reject
            user applications.
          </p>

          <Link
            href="/admin/kyc"
            className="flex w-full items-center justify-between rounded-2xl bg-cyan-500 px-5 py-4 font-bold text-black transition hover:bg-cyan-400"
          >
            <span>
              Open KYC Verification
            </span>

            <ChevronRight size={21} />
          </Link>

        </div>

        {/* SYSTEM MANAGEMENT */}
        <div className="mb-6 rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

          <h2 className="mb-5 text-xl font-bold">
            System Management
          </h2>

          <div className="space-y-4">

            {/* System */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity
                  className="text-cyan-400"
                  size={22}
                />

                <span>
                  System Status
                </span>
              </div>

              <span className="font-semibold text-green-400">
                Online
              </span>
            </div>

            {/* Database */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database
                  className="text-blue-400"
                  size={22}
                />

                <span>
                  Database
                </span>
              </div>

              <span className="font-semibold text-green-400">
                Connected
              </span>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell
                  className="text-yellow-400"
                  size={22}
                />

                <span>
                  Notifications
                </span>
              </div>

              <span className="font-semibold text-cyan-400">
                Active
              </span>
            </div>

            {/* Maintenance */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings
                  className="text-purple-400"
                  size={22}
                />

                <span>
                  Maintenance
                </span>
              </div>

              <span className="font-semibold text-red-400">
                Disabled
              </span>
            </div>

          </div>

        </div>

        {/* QUICK ACTIONS */}
        <div className="mb-6 rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

          <h2 className="mb-5 text-xl font-bold">
            Quick Actions
          </h2>

          <div className="grid grid-cols-2 gap-4">

            <Link
              href="/admin/users"
              className="rounded-2xl bg-cyan-500 py-3 text-center font-semibold text-black transition hover:bg-cyan-400"
            >
              User Management
            </Link>

            <Link
              href="/admin/ai-trading"
              className="rounded-2xl bg-blue-600 py-3 text-center font-semibold transition hover:bg-blue-500"
            >
              AI Trading
            </Link>

            <Link
              href="/admin/logs"
              className="rounded-2xl bg-purple-600 py-3 text-center font-semibold transition hover:bg-purple-500"
            >
              System Logs
            </Link>

            <Link
              href="/admin/settings"
              className="rounded-2xl bg-green-600 py-3 text-center font-semibold transition hover:bg-green-500"
            >
              Platform Settings
            </Link>

          </div>

        </div>

        {/* FOOTER */}
        <footer className="mt-10 border-t border-slate-800 pt-6 text-center">

          <p className="text-sm text-slate-500">
            AI TONKEEPER Admin Panel
          </p>

          <p className="mt-2 font-semibold text-cyan-400">
            ai-tonkeeper.xyz
          </p>

          <p className="mt-4 text-xs text-slate-600">
            © 2026 AI TONKEEPER. Administrator Access Only.
          </p>

        </footer>

      </div>
    </main>
  );
}