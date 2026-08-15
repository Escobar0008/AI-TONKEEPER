"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Crown,
  CreditCard,
  Calendar,
  CheckCircle,
} from "lucide-react";

export default function SubscriptionPage() {
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
              Subscription
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              AI TONKEEPER subscription management
            </p>

          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-[#101A2C]">

            <Crown
              size={22}
              className="text-cyan-400"
            />

          </div>

        </div>

        {/* Overview */}

        <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <h2 className="text-2xl font-bold">
            Subscription Center
          </h2>

          <p className="mt-2 text-cyan-100">
            Manage subscription plans and premium services.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">

            <div className="rounded-2xl bg-white/10 p-4">

              <p className="text-sm text-cyan-100">
                Active Plans
              </p>

              <p className="mt-2 text-3xl font-bold">
                0
              </p>

            </div>

            <div className="rounded-2xl bg-white/10 p-4">

              <p className="text-sm text-cyan-100">
                Premium Users
              </p>

              <p className="mt-2 text-3xl font-bold">
                0
              </p>

            </div>

          </div>

        </div>

        {/* Subscription Plans */}
        <div className="mt-8 grid grid-cols-2 gap-4">

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <Crown
              size={30}
              className="mb-3 text-yellow-400"
            />

            <p className="text-sm text-slate-400">
              Premium Plans
            </p>

            <p className="mt-2 text-2xl font-bold">
              0
            </p>

          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <CreditCard
              size={30}
              className="mb-3 text-cyan-400"
            />

            <p className="text-sm text-slate-400">
              Active Payments
            </p>

            <p className="mt-2 text-2xl font-bold">
              0
            </p>

          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <Calendar
              size={30}
              className="mb-3 text-green-400"
            />

            <p className="text-sm text-slate-400">
              Renewals
            </p>

            <p className="mt-2 text-2xl font-bold">
              0
            </p>

          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <CheckCircle
              size={30}
              className="mb-3 text-purple-400"
            />

            <p className="text-sm text-slate-400">
              Successful Orders
            </p>

            <p className="mt-2 text-2xl font-bold">
              0
            </p>

          </div>

        </div>

        {/* Subscription Plans */}

        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <div className="flex items-center justify-between">

            <h2 className="text-xl font-bold">
              Subscription Plans
            </h2>

            <span className="text-sm text-slate-400">
              Available Plans
            </span>

          </div>

          <div className="mt-6 rounded-2xl border border-slate-800 bg-[#0B1325] p-5 text-center">

            <Crown
              size={42}
              className="mx-auto text-slate-500"
            />

            <p className="mt-4 text-slate-400">
              No subscription plans available yet.
            </p>

          </div>

        </div>

        {/* Subscription Statistics */}

        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Subscription Statistics
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Active Subscriptions
              </span>

              <span className="font-bold text-green-400">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Expired Subscriptions
              </span>

              <span className="font-bold text-red-400">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Monthly Revenue
              </span>

              <span className="font-bold text-cyan-400">
                $0.00
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Annual Revenue
              </span>

              <span className="font-bold text-yellow-400">
                $0.00
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Renewal Rate
              </span>

              <span className="font-bold text-purple-400">
                0%
              </span>

            </div>

          </div>

        </div>

        {/* Premium Overview */}

        <div className="mt-8 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <h2 className="text-2xl font-bold">
            Premium Overview
          </h2>

          <p className="mt-2 text-cyan-100">

            Monitor premium memberships and subscription performance across AI TONKEEPER.

          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">

            <div className="rounded-2xl bg-white/10 p-4">

              <p className="text-sm text-cyan-100">
                Premium Members
              </p>

              <p className="mt-2 text-2xl font-bold">
                0
              </p>

            </div>

            <div className="rounded-2xl bg-white/10 p-4">

              <p className="text-sm text-cyan-100">
                Trial Users
              </p>

              <p className="mt-2 text-2xl font-bold">
                0
              </p>

            </div>

          </div>

        </div>

       {/* Subscription Actions */}

        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Subscription Actions
          </h2>

          <div className="mt-6 grid gap-4">

            <button className="rounded-2xl bg-cyan-500 py-4 font-semibold transition hover:bg-cyan-600">

              Create Subscription Plan

            </button>

            <button className="rounded-2xl border border-slate-700 bg-[#0B1325] py-4 font-semibold">

              Manage Premium Users

            </button>

            <button className="rounded-2xl border border-slate-700 bg-[#0B1325] py-4 font-semibold">

              View Payment History

            </button>

            <button className="rounded-2xl border border-slate-700 bg-[#0B1325] py-4 font-semibold">

              Export Subscription Report

            </button>

            <button className="rounded-2xl border border-red-900 bg-red-950/30 py-4 font-semibold text-red-400">

              Cancel Subscription

            </button>

          </div>

        </div>

        {/* Footer */}

        <footer className="mt-10 border-t border-slate-800 pt-6 text-center">

          <p className="text-sm text-slate-500">
            AI TONKEEPER Subscription Center
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