"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Settings,
  User,
  Globe,
  Bell,
} from "lucide-react";

export default function SettingsPage() {

  return (

    <main className="min-h-screen bg-[#050B18] text-white">

      <div className="max-w-md mx-auto px-5 py-6 pb-32">

        {/* ================= HEADER ================= */}

        <div className="flex items-center gap-4 mb-8">

          <Link
            href="/dashboard"
            className="w-12 h-12 rounded-full bg-[#101A2C] border border-slate-800 flex items-center justify-center"
          >

            <ArrowLeft size={22} />

          </Link>

          <div>

            <h1 className="text-3xl font-bold">

              Settings

            </h1>

            <p className="text-slate-400">

              AI TONKEEPER Preferences

            </p>

          </div>

        </div>

        {/* ================= PROFILE ================= */}

        <section className="bg-[#101A2C] border border-slate-800 rounded-[30px] p-6">

          <div className="flex items-center gap-4">

            <div className="w-16 h-16 rounded-full bg-cyan-500 flex items-center justify-center">

              <User size={30} className="text-black" />

            </div>

            <div>

              <h2 className="text-2xl font-bold">

                My Profile

              </h2>

              <p className="text-slate-400">

                Manage your account

              </p>

            </div>

          </div>

        </section>

        {/* ================= GENERAL ================= */}

        <section className="mt-8 bg-[#101A2C] border border-slate-800 rounded-[30px] p-6">

          <h2 className="text-2xl font-bold mb-5">

            General

          </h2>

          <div className="space-y-4">

            <button className="w-full bg-[#17233B] rounded-2xl p-5 flex justify-between items-center">

              <div className="flex items-center gap-3">

                <Globe />

                <span>Language</span>

              </div>

              <span className="text-cyan-400">

                English

              </span>

            </button>

            <button className="w-full bg-[#17233B] rounded-2xl p-5 flex justify-between items-center">

              <div className="flex items-center gap-3">

                <Bell />

                <span>Notifications</span>

              </div>

              <span className="text-green-400">

                ON

              </span>

            </button>

          </div>

        </section>
        {/* ================= SECURITY ================= */}

        <section className="mt-8 bg-[#101A2C] border border-slate-800 rounded-[30px] p-6">

          <h2 className="text-2xl font-bold mb-5">

            Security

          </h2>

          <div className="space-y-4">

            <button className="w-full bg-[#17233B] rounded-2xl p-5 flex justify-between items-center">

              <span>🔐 Change Password</span>

              <span className="text-cyan-400">→</span>

            </button>

            <button className="w-full bg-[#17233B] rounded-2xl p-5 flex justify-between items-center">

              <span>🛡 Two-Factor Authentication</span>

              <span className="text-green-400">OFF</span>

            </button>

            <button className="w-full bg-[#17233B] rounded-2xl p-5 flex justify-between items-center">

              <span>📱 Connected Devices</span>

              <span className="text-cyan-400">1 Device</span>

            </button>

          </div>

        </section>

        {/* ================= AI TRADING ================= */}

        <section className="mt-8 bg-[#101A2C] border border-slate-800 rounded-[30px] p-6">

          <h2 className="text-2xl font-bold mb-5">

            AI Trading

          </h2>

          <div className="space-y-4">

            <button className="w-full bg-[#17233B] rounded-2xl p-5 flex justify-between items-center">

              <span>🤖 AI Status</span>

              <span className="text-green-400">

                Online

              </span>

            </button>

            <button className="w-full bg-[#17233B] rounded-2xl p-5 flex justify-between items-center">

              <span>⚙ Trading Strategy</span>

              <span className="text-cyan-400">

                Default

              </span>

            </button>

            <button className="w-full bg-[#17233B] rounded-2xl p-5 flex justify-between items-center">

              <span>📈 Auto Trading</span>

              <span className="text-red-400">

                Disabled

              </span>

            </button>

          </div>

        </section>

        {/* ================= KYC ================= */}

        <section className="mt-8 bg-[#101A2C] border border-slate-800 rounded-[30px] p-6">

          <h2 className="text-2xl font-bold mb-5">

            Identity Verification

          </h2>

          <button className="w-full bg-[#17233B] rounded-2xl p-5 flex justify-between items-center">

            <span>🪪 KYC Verification</span>

            <span className="text-yellow-400">

              Pending

            </span>

          </button>

        </section>

        {/* ================= BUY CRYPTO ================= */}

        <section className="mt-8 bg-[#101A2C] border border-slate-800 rounded-[30px] p-6">

          <h2 className="text-2xl font-bold mb-5">

            Buy Crypto

          </h2>

          <button className="w-full bg-[#17233B] rounded-2xl p-5 flex justify-between items-center">

            <span>💳 Onramper Provider</span>

            <span className="text-green-400">

              Connected

            </span>

          </button>

        </section>
        {/* ================= ABOUT ================= */}

        <section className="mt-8 bg-[#101A2C] border border-slate-800 rounded-[30px] p-6">

          <h2 className="text-2xl font-bold mb-5">

            About AI TONKEEPER

          </h2>

          <div className="space-y-4">

            <button className="w-full bg-[#17233B] rounded-2xl p-5 flex justify-between items-center">

              <span>ℹ️ Version</span>

              <span className="text-cyan-400">

                v1.0.0

              </span>

            </button>

            <button className="w-full bg-[#17233B] rounded-2xl p-5 flex justify-between items-center">

              <span>📄 Terms of Service</span>

              <span className="text-cyan-400">

                View

              </span>

            </button>

            <button className="w-full bg-[#17233B] rounded-2xl p-5 flex justify-between items-center">

              <span>🔒 Privacy Policy</span>

              <span className="text-cyan-400">

                View

              </span>

            </button>

            <button className="w-full bg-[#17233B] rounded-2xl p-5 flex justify-between items-center">

              <span>💬 Contact Support</span>

              <span className="text-cyan-400">

                Open

              </span>

            </button>

          </div>

        </section>

        {/* ================= LOGOUT ================= */}

        <section className="mt-8">

          <button
            className="w-full rounded-2xl bg-red-600 hover:bg-red-500 transition py-4 font-bold text-white"
          >

            Logout

          </button>

        </section>

      </div>

    </main>

  );

}