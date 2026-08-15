"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Smartphone,
  Laptop,
  ShieldCheck,
  Clock,
  Search,
} from "lucide-react";

export default function DeviceManagementPage() {
  return (
    <main className="min-h-screen bg-[#050B18] text-white">

      <div className="mx-auto w-full max-w-md px-5 py-6 pb-28">

        {/* Header */}

        <div className="mb-8 flex items-center justify-between">

          <Link href="/dashboard">

            <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-[#101A2C]">

              <ArrowLeft size={22} />

            </button>

          </Link>

          <div className="flex-1 px-3 text-center">

            <h1 className="text-2xl font-bold">
              Device Management
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Manage trusted devices
            </p>

          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-[#101A2C]">

            <ShieldCheck
              size={22}
              className="text-cyan-400"
            />

          </div>

        </div>

        {/* Hero */}

        <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <div className="flex items-center justify-between gap-4">

            <div className="min-w-0 flex-1">

              <h2 className="text-2xl font-bold">
                Device Management
              </h2>

              <p className="mt-2 text-sm text-cyan-100">
                Protect your account by managing trusted devices and login activity.
              </p>

            </div>

            <Smartphone
              size={46}
              className="shrink-0 text-white"
            />

          </div>

          <div className="mt-6 rounded-2xl bg-white/10 p-5">

            <p className="text-sm text-cyan-100">
              Trusted Devices
            </p>

            <p className="mt-2 text-4xl font-bold">
              1
            </p>

          </div>

        </div>

        {/* Search */}

        <div className="mt-8">

          <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-[#101A2C] px-4 py-4">

            <Search
              size={22}
              className="shrink-0 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search devices..."
              className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
            />

          </div>

        </div>

        {/* Devices List */}
        <div className="mt-8 space-y-4">

          {/* Current Device */}

          <div className="rounded-3xl border border-cyan-500 bg-[#101A2C] p-5">

            <div className="flex items-start justify-between gap-4">

              <div className="flex items-start gap-4">

                <Smartphone
                  size={30}
                  className="shrink-0 text-cyan-400"
                />

                <div>

                  <h3 className="text-lg font-bold">
                    Current Device
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    iPhone • iOS
                  </p>

                  <p className="mt-2 text-xs text-green-400">
                    Active now
                  </p>

                </div>

              </div>

              <span className="rounded-xl bg-cyan-500/20 px-3 py-1 text-sm font-semibold text-cyan-400">

                Current

              </span>

            </div>

          </div>

          {/* Trusted Laptop */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-start gap-4">

              <Laptop
                size={30}
                className="shrink-0 text-blue-400"
              />

              <div className="min-w-0 flex-1">

                <h3 className="text-lg font-bold">
                  Trusted Laptop
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Windows PC
                </p>

                <div className="mt-3 flex items-center gap-2">

                  <Clock
                    size={16}
                    className="text-slate-500"
                  />

                  <span className="text-xs text-slate-500">
                    Last active: Just now
                  </span>

                </div>

              </div>

            </div>

          </div>

          {/* Security Status */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-start gap-4">

              <ShieldCheck
                size={30}
                className="shrink-0 text-green-400"
              />

              <div className="min-w-0 flex-1">

                <h3 className="text-lg font-bold">
                  Security Status
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  All trusted devices are verified and protected.
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* Device Statistics */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Device Statistics
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Trusted Devices
              </span>

              <span className="font-bold">
                1
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Active Sessions
              </span>

              <span className="font-bold text-green-400">
                1
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Security Level
              </span>

              <span className="font-bold text-cyan-400">
                High
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Last Login
              </span>

              <span className="font-bold">
                Just now
              </span>

            </div>

          </div>

        </div>

        {/* Device Protection */}

        <div className="mt-8 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <div className="flex items-center justify-between gap-4">

            <div className="min-w-0 flex-1">

              <h2 className="text-xl font-bold">
                Device Protection
              </h2>

              <p className="mt-2 text-sm text-cyan-100">
                New devices require verification before they can access your AI TONKEEPER account.
              </p>

            </div>

            <ShieldCheck
              size={40}
              className="shrink-0 text-white"
            />

          </div>

          <div className="mt-6">

            <div className="h-3 w-full overflow-hidden rounded-full bg-white/20">

              <div className="h-full w-full rounded-full bg-white"></div>

            </div>

            <div className="mt-3 flex items-center justify-between text-sm">

              <span>
                Protection
              </span>

              <span className="font-bold">
                100%
              </span>

            </div>

          </div>

        </div>

        {/* Login History */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Login History
          </h2>

          <div className="mt-6 space-y-4">

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
                Failed Attempts
              </span>

              <span className="font-bold text-red-400">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Last Verified Device
              </span>

              <span className="font-bold text-cyan-400">
                Current Device
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Last Verification
              </span>

              <span className="font-bold">
                Just now
              </span>

            </div>

            <button className="mt-4 w-full rounded-2xl border border-red-500 bg-red-500/10 py-3 font-semibold text-red-400 transition hover:bg-red-500/20">

              Sign Out From Other Devices

            </button>

          </div>

        </div>

        {/* Footer */}

        <footer className="mt-10 border-t border-slate-800 pt-6 text-center">

          <p className="text-sm text-slate-500">
            AI TONKEEPER Device Management
          </p>

          <p className="mt-2 font-semibold text-cyan-400">
            ai-tonkeeper.xyz
          </p>

          <p className="mt-4 text-xs text-slate-600">
            © 2026 AI TONKEEPER. All rights reserved.
          </p>

        </footer>

      </div>

    </main>

  );
}