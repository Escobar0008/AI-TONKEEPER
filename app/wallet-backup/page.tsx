"use client";

import Link from "next/link";

import {
  ArrowLeft,
  ShieldCheck,
  Database,
  KeyRound,
  Search,
  Cloud,
} from "lucide-react";

export default function WalletBackupPage() {
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
              Wallet Backup
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Secure your AI TONKEEPER wallet
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
                Wallet Backup
              </h2>

              <p className="mt-2 text-sm text-cyan-100">
                Protect your wallet by securely backing up your recovery information.
              </p>

            </div>

            <Database
              size={46}
              className="shrink-0 text-white"
            />

          </div>

          <div className="mt-6 rounded-2xl bg-white/10 p-5">

            <p className="text-sm text-cyan-100">
              Backup Status
            </p>

            <p className="mt-2 text-4xl font-bold">
              Not Backed Up
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
              placeholder="Search backup options..."
              className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
            />

          </div>

        </div>

        {/* Backup Options */}
        <div className="mt-8 space-y-4">

          {/* Recovery Phrase */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-start gap-4">

              <KeyRound
                size={30}
                className="shrink-0 text-yellow-400"
              />

              <div className="min-w-0 flex-1">

                <h3 className="text-lg font-bold">
                  Recovery Phrase
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  Save your recovery phrase in a secure offline location.
                  Never share it with anyone.
                </p>

              </div>

            </div>

          </div>

          {/* Cloud Backup */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-start gap-4">

              <Cloud
                size={30}
                className="shrink-0 text-cyan-400"
              />

              <div className="min-w-0 flex-1">

                <h3 className="text-lg font-bold">
                  Secure Backup
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  Encrypt your wallet backup before storing it to ensure maximum security.
                </p>

              </div>

            </div>

          </div>

          {/* Backup Protection */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-start justify-between gap-4">

              <div className="flex min-w-0 flex-1 items-start gap-4">

                <ShieldCheck
                  size={30}
                  className="shrink-0 text-green-400"
                />

                <div className="min-w-0 flex-1">

                  <h3 className="text-lg font-bold">
                    Backup Protection
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    Verify your backup to ensure your wallet can always be recovered.
                  </p>

                </div>

              </div>

              <button className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600">

                Verify

              </button>

            </div>

          </div>

        </div>

        {/* Backup Statistics */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Backup Statistics
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Backup Status
              </span>

              <span className="font-bold text-red-400">
                Not Completed
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Recovery Phrase
              </span>

              <span className="font-bold text-cyan-400">
                Hidden
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Last Backup
              </span>

              <span className="font-bold">
                Never
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Verification
              </span>

              <span className="font-bold text-yellow-400">
                Pending
              </span>

            </div>

          </div>

        </div>

        {/* Security Reminder */}

        <div className="mt-8 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <div className="flex items-center justify-between gap-4">

            <div className="min-w-0 flex-1">

              <h2 className="text-xl font-bold">
                Security Reminder
              </h2>

              <p className="mt-2 text-sm text-cyan-100">
                Never share your recovery phrase with anyone. AI TONKEEPER will never ask for it.
              </p>

            </div>

            <ShieldCheck
              size={40}
              className="shrink-0 text-white"
            />

          </div>

          <div className="mt-6">

            <div className="h-3 w-full overflow-hidden rounded-full bg-white/20">

              <div className="h-1/2 w-0 rounded-full bg-white"></div>

            </div>

            <div className="mt-3 flex items-center justify-between text-sm">

              <span>
                Backup Progress
              </span>

              <span className="font-bold">
                0%
              </span>

            </div>

          </div>

        </div>

        {/* Backup History */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Backup History
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Total Backups
              </span>

              <span className="font-bold">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Successful Verifications
              </span>

              <span className="font-bold text-green-400">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Failed Verifications
              </span>

              <span className="font-bold text-red-400">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Last Recovery Test
              </span>

              <span className="font-bold">
                Never
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Wallet Status
              </span>

              <span className="font-bold text-cyan-400">
                Protected
              </span>

            </div>

          </div>

        </div>

        {/* Footer */}

        <footer className="mt-10 border-t border-slate-800 pt-6 text-center">

          <p className="text-sm text-slate-500">
            AI TONKEEPER Wallet Backup
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