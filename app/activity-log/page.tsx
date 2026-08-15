"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Activity,
  Search,
  Calendar,
  FileText,
  Clock,
} from "lucide-react";

export default function ActivityLogPage() {
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
              Activity Log
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Platform activity monitoring
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-[#101A2C]">
            <Activity
              size={22}
              className="text-cyan-400"
            />
          </div>
        </div>

        {/* Overview */}
        <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">
          <h2 className="text-2xl font-bold">
            Activity Center
          </h2>

          <p className="mt-2 text-cyan-100">
            Monitor every important action across AI TONKEEPER.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-sm text-cyan-100">
                Total Events
              </p>

              <p className="mt-2 text-3xl font-bold">
                0
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-sm text-cyan-100">
                Today
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
              placeholder="Search activity..."
              className="w-full bg-transparent outline-none placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Activity List */}
        <div className="mt-8 grid grid-cols-2 gap-4">

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">
            <Clock
              size={30}
              className="mb-3 text-cyan-400"
            />

            <p className="text-sm text-slate-400">
              Login Events
            </p>

            <p className="mt-2 text-2xl font-bold">
              0
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">
            <Activity
              size={30}
              className="mb-3 text-green-400"
            />

            <p className="text-sm text-slate-400">
              AI Trading Events
            </p>

            <p className="mt-2 text-2xl font-bold">
              0
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">
            <Calendar
              size={30}
              className="mb-3 text-yellow-400"
            />

            <p className="text-sm text-slate-400">
              Today&apos;s Events
            </p>

            <p className="mt-2 text-2xl font-bold">
              0
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">
            <FileText
              size={30}
              className="mb-3 text-purple-400"
            />

            <p className="text-sm text-slate-400">
              Reports
            </p>

            <p className="mt-2 text-2xl font-bold">
              0
            </p>
          </div>

        </div>

        {/* Activity Timeline */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              Recent Activity
            </h2>

            <span className="text-sm text-slate-400">
              Latest Events
            </span>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-800 bg-[#0B1325] p-5 text-center">
            <Activity
              size={42}
              className="mx-auto text-slate-500"
            />

            <p className="mt-4 text-slate-400">
              No activity available.
            </p>
          </div>

        </div>

        {/* Activity Statistics */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Activity Statistics
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between">
              <span className="text-slate-400">
                User Logins
              </span>

              <span className="font-bold text-cyan-400">
                0
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">
                AI Trading Events
              </span>

              <span className="font-bold text-green-400">
                0
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">
                Deposit Events
              </span>

              <span className="font-bold">
                0
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">
                Send Events
              </span>

              <span className="font-bold text-yellow-400">
                0
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">
                Security Alerts
              </span>

              <span className="font-bold text-red-400">
                0
              </span>
            </div>

          </div>
        </div>

        {/* Security Monitoring */}
        <div className="mt-8 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <h2 className="text-2xl font-bold">
            Security Monitoring
          </h2>

          <p className="mt-2 text-cyan-100">
            Monitor security events and platform activity in real time.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">

            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-sm text-cyan-100">
                Threat Alerts
              </p>

              <p className="mt-2 text-2xl font-bold">
                0
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-sm text-cyan-100">
                Safe Events
              </p>

              <p className="mt-2 text-2xl font-bold">
                0
              </p>
            </div>

          </div>
        </div>

        {/* Administrator Actions */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Administrator Actions
          </h2>

          <div className="mt-6 grid gap-4">

            <button className="rounded-2xl bg-cyan-500 py-4 font-semibold transition hover:bg-cyan-600">
              View Full Activity Log
            </button>

            <button className="rounded-2xl border border-slate-700 bg-[#0B1325] py-4 font-semibold">
              Export Activity Report
            </button>

            <button className="rounded-2xl border border-slate-700 bg-[#0B1325] py-4 font-semibold">
              Filter Events
            </button>

            <button className="rounded-2xl border border-red-900 bg-red-950/30 py-4 font-semibold text-red-400">
              Security Events
            </button>

          </div>
        </div>

        {/* Footer */}
        <footer className="mt-10 border-t border-slate-800 pt-6 text-center">

          <p className="text-sm text-slate-500">
            AI TONKEEPER Activity Log
          </p>

          <p className="mt-2 font-semibold text-cyan-400">
            ai-tonkeeper.xyz
          </p>

          <p className="mt-4 text-xs text-slate-600">
            ©️ 2026 AI TONKEEPER. Administrator Access Only.
          </p>

        </footer>

      </div>
    </main>
  );
}