"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Server,
  Database,
  Wifi,
  Cpu,
  Search,
} from "lucide-react";

export default function SystemStatusPage() {
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
              System Status
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              AI TONKEEPER infrastructure
            </p>

          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-[#101A2C]">

            <Server
              size={22}
              className="text-cyan-400"
            />

          </div>

        </div>

        {/* System Overview */}

        <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <h2 className="text-2xl font-bold">
            Infrastructure Status
          </h2>

          <p className="mt-2 text-cyan-100">
            Monitor servers, services and platform health in real time.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">

            <div className="rounded-2xl bg-white/10 p-4">

              <p className="text-sm text-cyan-100">
                System Health
              </p>

              <p className="mt-2 text-3xl font-bold">
                100%
              </p>

            </div>

            <div className="rounded-2xl bg-white/10 p-4">

              <p className="text-sm text-cyan-100">
                Active Services
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
              placeholder="Search services..."
              className="w-full bg-transparent outline-none placeholder:text-slate-500"
            />

          </div>

        </div>

        {/* Infrastructure Status */}
        <div className="mt-8 grid grid-cols-2 gap-4">

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <Server
              size={30}
              className="mb-3 text-cyan-400"
            />

            <p className="text-sm text-slate-400">
              Servers
            </p>

            <p className="mt-2 text-2xl font-bold">
              Online
            </p>

          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <Database
              size={30}
              className="mb-3 text-green-400"
            />

            <p className="text-sm text-slate-400">
              Database
            </p>

            <p className="mt-2 text-2xl font-bold">
              Healthy
            </p>

          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <Wifi
              size={30}
              className="mb-3 text-yellow-400"
            />

            <p className="text-sm text-slate-400">
              Network
            </p>

            <p className="mt-2 text-2xl font-bold">
              Stable
            </p>

          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <Cpu
              size={30}
              className="mb-3 text-purple-400"
            />

            <p className="text-sm text-slate-400">
              AI Engine
            </p>

            <p className="mt-2 text-2xl font-bold">
              Running
            </p>

          </div>

        </div>

        {/* Services */}

        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <div className="flex items-center justify-between">

            <h2 className="text-xl font-bold">
              Platform Services
            </h2>

            <span className="text-sm text-slate-400">
              Status
            </span>

          </div>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between">

              <span>Authentication</span>

              <span className="font-semibold text-green-400">
                Online
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span>AI Trading</span>

              <span className="font-semibold text-green-400">
                Online
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span>Wallet Service</span>

              <span className="font-semibold text-green-400">
                Online
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span>Notifications</span>

              <span className="font-semibold text-green-400">
                Online
              </span>

            </div>

          </div>

        </div>

        {/* Performance */}

        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Performance
          </h2>

          <div className="mt-6 space-y-5">

            <div>

              <div className="mb-2 flex items-center justify-between">

                <span className="text-slate-400">
                  CPU Usage
                </span>

                <span className="font-semibold">
                  0%
                </span>

              </div>

              <div className="h-3 rounded-full bg-slate-800">

                <div className="h-3 w-0 rounded-full bg-cyan-400"></div>

              </div>

            </div>

            <div>

              <div className="mb-2 flex items-center justify-between">

                <span className="text-slate-400">
                  Memory Usage
                </span>

                <span className="font-semibold">
                  0%
                </span>

              </div>

              <div className="h-3 rounded-full bg-slate-800">

                <div className="h-3 w-0 rounded-full bg-green-400"></div>

              </div>

            </div>

            <div>

              <div className="mb-2 flex items-center justify-between">

                <span className="text-slate-400">
                  Storage Usage
                </span>

                <span className="font-semibold">
                  0%
                </span>

              </div>

              <div className="h-3 rounded-full bg-slate-800">

                <div className="h-3 w-0 rounded-full bg-yellow-400"></div>

              </div>

            </div>

            <div>

              <div className="mb-2 flex items-center justify-between">

                <span className="text-slate-400">
                  Network Load
                </span>

                <span className="font-semibold">
                  0%
                </span>

              </div>

              <div className="h-3 rounded-full bg-slate-800">

                <div className="h-3 w-0 rounded-full bg-purple-400"></div>

              </div>

            </div>

          </div>

        </div>

        {/* Live Monitoring */}

        <div className="mt-8 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <h2 className="text-2xl font-bold">
            Live Monitoring
          </h2>

          <p className="mt-2 text-cyan-100">

            Real-time monitoring of the AI TONKEEPER infrastructure.

          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">

            <div className="rounded-2xl bg-white/10 p-4">

              <p className="text-sm text-cyan-100">
                Uptime
              </p>

              <p className="mt-2 text-2xl font-bold">
                100%
              </p>

            </div>

            <div className="rounded-2xl bg-white/10 p-4">

              <p className="text-sm text-cyan-100">
                Incidents
              </p>

              <p className="mt-2 text-2xl font-bold">
                0
              </p>

            </div>

          </div>

        </div>

        {/* System Tools */}

        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            System Tools
          </h2>

          <div className="mt-6 grid gap-4">

            <button className="rounded-2xl bg-cyan-500 py-4 font-semibold transition hover:bg-cyan-600">

              Refresh System Status

            </button>

            <button className="rounded-2xl border border-slate-700 bg-[#0B1325] py-4 font-semibold">

              Restart Services

            </button>

            <button className="rounded-2xl border border-slate-700 bg-[#0B1325] py-4 font-semibold">

              Download System Report

            </button>

            <button className="rounded-2xl border border-red-900 bg-red-950/30 py-4 font-semibold text-red-400">

              Emergency Maintenance

            </button>

          </div>

        </div>

        {/* Footer */}

        <footer className="mt-10 border-t border-slate-800 pt-6 text-center">

          <p className="text-sm text-slate-500">
            AI TONKEEPER System Status
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