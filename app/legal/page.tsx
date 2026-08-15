"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Scale,
  FileText,
  Shield,
  ScrollText,
} from "lucide-react";

export default function LegalPage() {
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
              Legal
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Legal & compliance center
            </p>

          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-[#101A2C]">

            <Scale
              size={22}
              className="text-cyan-400"
            />

          </div>

        </div>

        {/* Overview */}

        <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <h2 className="text-2xl font-bold">
            Legal Information
          </h2>

          <p className="mt-2 text-cyan-100">
            Manage legal documents and compliance information for AI TONKEEPER.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">

            <div className="rounded-2xl bg-white/10 p-4">

              <p className="text-sm text-cyan-100">
                Documents
              </p>

              <p className="mt-2 text-3xl font-bold">
                0
              </p>

            </div>

            <div className="rounded-2xl bg-white/10 p-4">

              <p className="text-sm text-cyan-100">
                Policies
              </p>

              <p className="mt-2 text-3xl font-bold">
                0
              </p>

            </div>

          </div>

        </div>

        {/* Legal Documents */}
        <div className="mt-8 grid grid-cols-2 gap-4">

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <FileText
              size={30}
              className="mb-3 text-cyan-400"
            />

            <p className="text-sm text-slate-400">
              Terms of Service
            </p>

            <p className="mt-2 text-lg font-bold">
              Available
            </p>

          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <Shield
              size={30}
              className="mb-3 text-green-400"
            />

            <p className="text-sm text-slate-400">
              Privacy Policy
            </p>

            <p className="mt-2 text-lg font-bold">
              Available
            </p>

          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <ScrollText
              size={30}
              className="mb-3 text-yellow-400"
            />

            <p className="text-sm text-slate-400">
              Compliance
            </p>

            <p className="mt-2 text-lg font-bold">
              Active
            </p>

          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <Scale
              size={30}
              className="mb-3 text-purple-400"
            />

            <p className="text-sm text-slate-400">
              Regulations
            </p>

            <p className="mt-2 text-lg font-bold">
              Updated
            </p>

          </div>

        </div>

        {/* Legal Documents */}

        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <div className="flex items-center justify-between">

            <h2 className="text-xl font-bold">
              Legal Documents
            </h2>

            <span className="text-sm text-slate-400">
              Latest Version
            </span>

          </div>

          <div className="mt-6 rounded-2xl border border-slate-800 bg-[#0B1325] p-5 text-center">

            <FileText
              size={42}
              className="mx-auto text-slate-500"
            />

            <p className="mt-4 text-slate-400">
              No legal documents published yet.
            </p>

          </div>

        </div>

        {/* Compliance Status */}

        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Compliance Status
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Terms of Service
              </span>

              <span className="font-bold text-green-400">
                Active
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Privacy Policy
              </span>

              <span className="font-bold text-green-400">
                Active
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                AML Policy
              </span>

              <span className="font-bold text-yellow-400">
                Pending
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                KYC Policy
              </span>

              <span className="font-bold text-green-400">
                Active
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Last Update
              </span>

              <span className="font-bold">
                --/--/----
              </span>

            </div>

          </div>

        </div>

        {/* Legal Information */}

        <div className="mt-8 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <h2 className="text-2xl font-bold">
            Legal Information
          </h2>

          <p className="mt-2 text-cyan-100">

            Keep legal documents, compliance policies and platform regulations up to date.

          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">

            <div className="rounded-2xl bg-white/10 p-4">

              <p className="text-sm text-cyan-100">
                Active Policies
              </p>

              <p className="mt-2 text-2xl font-bold">
                0
              </p>

            </div>

            <div className="rounded-2xl bg-white/10 p-4">

              <p className="text-sm text-cyan-100">
                Legal Notices
              </p>

              <p className="mt-2 text-2xl font-bold">
                0
              </p>

            </div>

          </div>

        </div>

        {/* Legal Actions */}

        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Legal Actions
          </h2>

          <div className="mt-6 grid gap-4">

            <button className="rounded-2xl bg-cyan-500 py-4 font-semibold transition hover:bg-cyan-600">

              Edit Terms of Service

            </button>

            <button className="rounded-2xl border border-slate-700 bg-[#0B1325] py-4 font-semibold">

              Update Privacy Policy

            </button>

            <button className="rounded-2xl border border-slate-700 bg-[#0B1325] py-4 font-semibold">

              Manage Compliance

            </button>

            <button className="rounded-2xl border border-slate-700 bg-[#0B1325] py-4 font-semibold">

              Publish Legal Notice

            </button>

            <button className="rounded-2xl border border-red-900 bg-red-950/30 py-4 font-semibold text-red-400">

              Archive Legal Documents

            </button>

          </div>

        </div>

        {/* Footer */}

        <footer className="mt-10 border-t border-slate-800 pt-6 text-center">

          <p className="text-sm text-slate-500">
            AI TONKEEPER Legal Center
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