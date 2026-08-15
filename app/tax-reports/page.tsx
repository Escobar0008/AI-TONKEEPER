"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Receipt,
  FileSpreadsheet,
  Calendar,
  Landmark,
  Search,
} from "lucide-react";

export default function TaxReportsPage() {
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
              Tax Reports
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Tax reports & financial records
            </p>

          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-[#101A2C]">

            <Receipt
              size={22}
              className="text-cyan-400"
            />

          </div>

        </div>

        {/* Overview */}

        <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <h2 className="text-2xl font-bold">
            Tax Report Center
          </h2>

          <p className="mt-2 text-cyan-100">
            Generate and manage financial and tax reports for AI TONKEEPER.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">

            <div className="rounded-2xl bg-white/10 p-4">

              <p className="text-sm text-cyan-100">
                Reports
              </p>

              <p className="mt-2 text-3xl font-bold">
                0
              </p>

            </div>

            <div className="rounded-2xl bg-white/10 p-4">

              <p className="text-sm text-cyan-100">
                Tax Year
              </p>

              <p className="mt-2 text-3xl font-bold">
                2026
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
              placeholder="Search tax reports..."
              className="w-full bg-transparent outline-none placeholder:text-slate-500"
            />

          </div>

        </div>

        {/* Tax Reports */}
        <div className="mt-8 grid grid-cols-2 gap-4">

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <FileSpreadsheet
              size={30}
              className="mb-3 text-cyan-400"
            />

            <p className="text-sm text-slate-400">
              Tax Reports
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
              Tax Periods
            </p>

            <p className="mt-2 text-2xl font-bold">
              0
            </p>

          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <Landmark
              size={30}
              className="mb-3 text-yellow-400"
            />

            <p className="text-sm text-slate-400">
              Tax Records
            </p>

            <p className="mt-2 text-2xl font-bold">
              0
            </p>

          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <Receipt
              size={30}
              className="mb-3 text-purple-400"
            />

            <p className="text-sm text-slate-400">
              Invoices
            </p>

            <p className="mt-2 text-2xl font-bold">
              0
            </p>

          </div>

        </div>

        {/* Reports List */}

        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <div className="flex items-center justify-between">

            <h2 className="text-xl font-bold">
              Tax Reports
            </h2>

            <span className="text-sm text-slate-400">
              Latest Reports
            </span>

          </div>

          <div className="mt-6 rounded-2xl border border-slate-800 bg-[#0B1325] p-5 text-center">

            <Receipt
              size={42}
              className="mx-auto text-slate-500"
            />

            <p className="mt-4 text-slate-400">
              No tax reports available yet.
            </p>

          </div>

        </div>

        {/* Tax Statistics */}

        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Tax Statistics
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Generated Reports
              </span>

              <span className="font-bold text-cyan-400">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Submitted Reports
              </span>

              <span className="font-bold text-green-400">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Pending Reports
              </span>

              <span className="font-bold text-yellow-400">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Total Tax Amount
              </span>

              <span className="font-bold text-purple-400">
                $0.00
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Last Report Date
              </span>

              <span className="font-bold">
                --/--/----
              </span>

            </div>

          </div>

        </div>

        {/* Financial Overview */}

        <div className="mt-8 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <h2 className="text-2xl font-bold">
            Financial Overview
          </h2>

          <p className="mt-2 text-cyan-100">

            View tax activity and financial reporting across AI TONKEEPER.

          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">

            <div className="rounded-2xl bg-white/10 p-4">

              <p className="text-sm text-cyan-100">
                Total Revenue
              </p>

              <p className="mt-2 text-2xl font-bold">
                $0.00
              </p>

            </div>

            <div className="rounded-2xl bg-white/10 p-4">

              <p className="text-sm text-cyan-100">
                Tax Due
              </p>

              <p className="mt-2 text-2xl font-bold">
                $0.00
              </p>

            </div>

          </div>

        </div>

        {/* Tax Actions */}

        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Tax Actions
          </h2>

          <div className="mt-6 grid gap-4">

            <button className="rounded-2xl bg-cyan-500 py-4 font-semibold transition hover:bg-cyan-600">

              Generate Tax Report

            </button>

            <button className="rounded-2xl border border-slate-700 bg-[#0B1325] py-4 font-semibold">

              Export Financial Report

            </button>

            <button className="rounded-2xl border border-slate-700 bg-[#0B1325] py-4 font-semibold">

              View Tax History

            </button>

            <button className="rounded-2xl border border-slate-700 bg-[#0B1325] py-4 font-semibold">

              Download Report (PDF)

            </button>

            <button className="rounded-2xl border border-red-900 bg-red-950/30 py-4 font-semibold text-red-400">

              Archive Reports

            </button>

          </div>

        </div>

        {/* Footer */}

        <footer className="mt-10 border-t border-slate-800 pt-6 text-center">

          <p className="text-sm text-slate-500">
            AI TONKEEPER Tax Reports
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