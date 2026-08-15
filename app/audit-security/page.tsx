"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Shield,
  Search,
  TriangleAlert,
  Lock,
  Fingerprint,
} from "lucide-react";

export default function AuditSecurityPage() {
  return (
    <main className="min-h-screen bg-[#050B18] text-white">

      <div className="mx-auto max-w-md px-5 py-6 pb-28">

        {/* Header */}

        <div className="mb-8 flex items-center justify-between">

          <Link
            href="/admin"
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-[#101A2C]"
          >
            <ArrowLeft size={22} />
          </Link>

          <div className="text-center">

            <h1 className="text-2xl font-bold">
              Audit & Security
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Platform security center
            </p>

          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-[#101A2C]">

            <Shield
              size={22}
              className="text-cyan-400"
            />

          </div>

        </div>

        {/* Security Overview */}

        <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <h2 className="text-2xl font-bold">
            Security Dashboard
          </h2>

          <p className="mt-2 text-cyan-100">
            Monitor security, audit events and administrator activity.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">

            <div className="rounded-2xl bg-white/10 p-4">

              <p className="text-sm text-cyan-100">
                Security Score
              </p>

              <p className="mt-2 text-3xl font-bold">
                100%
              </p>

            </div>

            <div className="rounded-2xl bg-white/10 p-4">

              <p className="text-sm text-cyan-100">
                Active Alerts
              </p>

              <p className="mt-2 text-3xl font-bold">
                0
              </p>

            </div>

          </div>

        </div>

        {/* Search */}

        <div className="mt-8">

          <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-[#101A2C] px-4 py-4">

            <Search
              size={20}
              className="text-slate-400"
            />

            <input
              type="text"
              placeholder="Search audit logs..."
              className="w-full bg-transparent outline-none placeholder:text-slate-500"
            />

          </div>

        </div>

        {/* Security Events */}
        <div className="mt-8 grid grid-cols-2 gap-4">

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <TriangleAlert
              size={30}
              className="mb-3 text-red-400"
            />

            <p className="text-sm text-slate-400">
              Security Alerts
            </p>

            <p className="mt-2 text-2xl font-bold">
              0
            </p>

          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <Lock
              size={30}
              className="mb-3 text-cyan-400"
            />

            <p className="text-sm text-slate-400">
              Login Attempts
            </p>

            <p className="mt-2 text-2xl font-bold">
              0
            </p>

          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <Fingerprint
              size={30}
              className="mb-3 text-green-400"
            />

            <p className="text-sm text-slate-400">
              New Devices
            </p>

            <p className="mt-2 text-2xl font-bold">
              0
            </p>

          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <Shield
              size={30}
              className="mb-3 text-purple-400"
            />

            <p className="text-sm text-slate-400">
              Protected Accounts
            </p>

            <p className="mt-2 text-2xl font-bold">
              0
            </p>

          </div>

        </div>

        {/* Recent Security Events */}

        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <div className="flex items-center justify-between">

            <h2 className="text-xl font-bold">
              Recent Security Events
            </h2>

            <span className="text-sm text-slate-400">
              Latest
            </span>

          </div>

          <div className="mt-6 rounded-2xl border border-slate-800 bg-[#0B1325] p-5 text-center">

            <Shield
              size={42}
              className="mx-auto text-slate-500"
            />

            <p className="mt-4 text-slate-400">
              No security events detected.
            </p>

          </div>

        </div>

        {/* Security Statistics */}

        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Security Statistics
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Failed Login Attempts
              </span>

              <span className="font-bold text-red-400">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Successful Logins
              </span>

              <span className="font-bold text-green-400">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Administrator Actions
              </span>

              <span className="font-bold text-cyan-400">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                KYC Verifications
              </span>

              <span className="font-bold text-purple-400">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                AI Trading Alerts
              </span>

              <span className="font-bold text-yellow-400">
                0
              </span>

            </div>

          </div>

        </div>

        {/* Security Health */}

        <div className="mt-8 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <h2 className="text-2xl font-bold">
            Security Health
          </h2>

          <p className="mt-2 text-cyan-100">

            Real-time overview of platform security and audit status.

          </p>

          <div className="mt-6">

            <div className="h-3 w-full overflow-hidden rounded-full bg-white/20">

              <div className="h-full w-full rounded-full bg-white"></div>

            </div>

            <div className="mt-3 flex items-center justify-between">

              <span className="text-sm text-cyan-100">
                Overall Protection
              </span>

              <span className="font-bold">
                100%
              </span>

            </div>

          </div>

        </div>

        {/* Administrator Security Tools */}

        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Administrator Security Tools
          </h2>

          <div className="mt-6 grid gap-4">

            <button className="rounded-2xl bg-cyan-500 py-4 font-semibold transition hover:bg-cyan-600">

              View Audit Report

            </button>

            <button className="rounded-2xl border border-slate-700 bg-[#0B1325] py-4 font-semibold">

              Export Security Logs

            </button>

            <button className="rounded-2xl border border-slate-700 bg-[#0B1325] py-4 font-semibold">

              Review Administrator Activity

            </button>

            <button className="rounded-2xl border border-red-900 bg-red-950/30 py-4 font-semibold text-red-400">

              Critical Security Alerts

            </button>

          </div>

        </div>

        {/* Footer */}

        <footer className="mt-10 border-t border-slate-800 pt-6 text-center">

          <p className="text-sm text-slate-500">
            AI TONKEEPER Audit & Security
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