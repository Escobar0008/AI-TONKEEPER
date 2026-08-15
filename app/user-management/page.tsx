"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Users,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  UserPlus,
} from "lucide-react";

export default function UserManagementPage() {
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
              User Management
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Manage AI TONKEEPER users
            </p>

          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-[#101A2C]">

            <Users
              size={22}
              className="text-cyan-400"
            />

          </div>

        </div>

        {/* Overview */}

        <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <h2 className="text-2xl font-bold">

            User Administration

          </h2>

          <p className="mt-2 text-cyan-100">

            Manage every AI TONKEEPER account from one place.

          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">

            <div className="rounded-2xl bg-white/10 p-4">

              <p className="text-sm text-cyan-100">
                Total Users
              </p>

              <p className="mt-2 text-3xl font-bold">
                0
              </p>

            </div>

            <div className="rounded-2xl bg-white/10 p-4">

              <p className="text-sm text-cyan-100">
                Active Users
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
              placeholder="Search user..."
              className="w-full bg-transparent outline-none placeholder:text-slate-500"
            />

          </div>

        </div>

        {/* User Statistics */}

        <div className="mt-8 grid grid-cols-2 gap-4">

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <UserCheck
              size={30}
              className="mb-3 text-green-400"
            />

            <p className="text-sm text-slate-400">
              Verified Accounts
            </p>

            <p className="mt-2 text-2xl font-bold">
              0
            </p>

          </div>


          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <UserPlus
              size={30}
              className="mb-3 text-cyan-400"
            />

            <p className="text-sm text-slate-400">
              New Users
            </p>

            <p className="mt-2 text-2xl font-bold">
              0
            </p>

          </div>


          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <ShieldCheck
              size={30}
              className="mb-3 text-purple-400"
            />

            <p className="text-sm text-slate-400">
              KYC Completed
            </p>

            <p className="mt-2 text-2xl font-bold">
              0
            </p>

          </div>


          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <UserX
              size={30}
              className="mb-3 text-red-400"
            />

            <p className="text-sm text-slate-400">
              Suspended
            </p>

            <p className="mt-2 text-2xl font-bold">
              0
            </p>

          </div>

        </div>


        {/* Users List */}

        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <div className="flex items-center justify-between">

            <h2 className="text-xl font-bold">
              Users
            </h2>

            <span className="text-sm text-slate-400">
              0 accounts
            </span>

          </div>


          <div className="mt-6 rounded-2xl border border-slate-800 bg-[#0B1325] p-5 text-center">

            <Users
              size={40}
              className="mx-auto text-slate-500"
            />

            <p className="mt-3 text-slate-400">
              No users available yet
            </p>

          </div>

        </div>
        {/* User Details */}

        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            User Details
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Total Balance
              </span>

              <span className="font-bold text-green-400">
                $0.00
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                AI Trading Enabled
              </span>

              <span className="font-bold text-cyan-400">
                0 Users
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Referral Members
              </span>

              <span className="font-bold">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Locked Accounts
              </span>

              <span className="font-bold text-red-400">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Login Today
              </span>

              <span className="font-bold text-yellow-400">
                0
              </span>

            </div>

          </div>

        </div>

        {/* Security Dashboard */}

        <div className="mt-8 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <h2 className="text-2xl font-bold">
            Security Dashboard
          </h2>

          <p className="mt-2 text-cyan-100">

            Monitor user security, verification status and platform protection.

          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">

            <div className="rounded-2xl bg-white/10 p-4">

              <p className="text-sm text-cyan-100">
                Secure Accounts
              </p>

              <p className="mt-2 text-2xl font-bold">
                0
              </p>

            </div>

            <div className="rounded-2xl bg-white/10 p-4">

              <p className="text-sm text-cyan-100">
                Risk Alerts
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

              View All Users

            </button>


            <button className="rounded-2xl border border-slate-700 bg-[#0B1325] py-4 font-semibold">

              Manage Verification

            </button>


            <button className="rounded-2xl border border-slate-700 bg-[#0B1325] py-4 font-semibold">

              Review Security Alerts

            </button>


            <button className="rounded-2xl border border-red-900 bg-red-950/30 py-4 font-semibold text-red-400">

              Suspended Accounts

            </button>

          </div>

        </div>


        {/* Footer */}

        <footer className="mt-10 border-t border-slate-800 pt-6 text-center">

          <p className="text-sm text-slate-500">
            AI TONKEEPER User Management
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
