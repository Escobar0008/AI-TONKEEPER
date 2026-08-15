"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Headphones,
  Globe,
  Mail,
  Shield,
  UserRound,
  ChevronRight,
  MessageCircle,
  HelpCircle,
  FileText,
} from "lucide-react";

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[#050B18] text-white">

      <div className="max-w-md mx-auto px-5 py-6 pb-28">

        {/* Header */}

        <div className="flex items-center justify-between mb-8">

          <Link href="/dashboard">

            <button className="w-12 h-12 rounded-2xl bg-[#101A2C] border border-slate-800 flex items-center justify-center">

              <ArrowLeft size={22} />

            </button>

          </Link>

          <div className="text-center">

            <h1 className="text-2xl font-bold">
              Support Center
            </h1>

            <p className="text-sm text-slate-400 mt-1">
              Contact AI TONKEEPER Support
            </p>

          </div>

          <div className="w-12 h-12 rounded-2xl bg-[#101A2C] border border-slate-800 flex items-center justify-center">

            <Headphones
              size={22}
              className="text-cyan-400"
            />

          </div>

        </div>

        {/* Support Card */}

        <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-bold">
                AI TONKEEPER Support
              </h2>

              <p className="mt-2 text-cyan-100">
                Need help? Contact our team anytime.
              </p>

            </div>

            <Headphones
              size={42}
              className="text-white"
            />

          </div>

          <div className="mt-6 rounded-2xl bg-white/10 p-4 space-y-3">

            <div className="flex items-center gap-3">

              <Globe
                size={20}
                className="text-white"
              />

              <span>
                https://ai-tonkeeper.xyz
              </span>

            </div>

            <div className="flex items-center gap-3">

              <Mail
                size={20}
                className="text-white"
              />

              <span>
                support@ai-tonkeeper.xyz
              </span>

            </div>

            <div className="flex items-center gap-3">

              <UserRound
                size={20}
                className="text-white"
              />

              <span>
                admin@ai-tonkeeper.xyz
              </span>

            </div>

            <div className="flex items-center gap-3">

              <Shield
                size={20}
                className="text-white"
              />

              <span>
                security@ai-tonkeeper.xyz
              </span>

            </div>

            <div className="flex items-center gap-3">

              <FileText
                size={20}
                className="text-white"
              />

              <span>
                kyc@ai-tonkeeper.xyz
              </span>

            </div>

          </div>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-green-500/20 px-4 py-2">

            <div className="w-2 h-2 rounded-full bg-green-400"></div>

            <span className="font-semibold text-green-100">
              Support Online
            </span>

          </div>

        </div>

        {/* Contact Options */}
        <div className="mt-8 space-y-4">

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center">

                  <MessageCircle
                    size={28}
                    className="text-cyan-400"
                  />

                </div>

                <div>

                  <h3 className="font-bold text-lg">
                    Live Chat
                  </h3>

                  <p className="text-slate-400 text-sm">
                    Chat directly with our support team.
                  </p>

                </div>

              </div>

              <ChevronRight className="text-slate-500" />

            </div>

          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">

                  <Mail
                    size={28}
                    className="text-blue-400"
                  />

                </div>

                <div>

                  <h3 className="font-bold text-lg">
                    Email Support
                  </h3>

                  <p className="text-slate-400 text-sm">
                    support@ai-tonkeeper.xyz
                  </p>

                </div>

              </div>

              <ChevronRight className="text-slate-500" />

            </div>

          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center">

                  <UserRound
                    size={28}
                    className="text-green-400"
                  />

                </div>

                <div>

                  <h3 className="font-bold text-lg">
                    Contact Admin
                  </h3>

                  <p className="text-slate-400 text-sm">
                    admin@ai-tonkeeper.xyz
                  </p>

                </div>

              </div>

              <ChevronRight className="text-slate-500" />

            </div>

          </div>

        </div>

        {/* Help Categories */}
        <div className="mt-8">

          <h2 className="mb-4 text-xl font-bold">
            Help Categories
          </h2>

          <div className="space-y-4">

            <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-4">

                  <HelpCircle
                    size={28}
                    className="text-yellow-400"
                  />

                  <div>

                    <h3 className="font-bold">
                      Frequently Asked Questions
                    </h3>

                    <p className="text-sm text-slate-400 mt-1">
                      Find answers to the most common questions.
                    </p>

                  </div>

                </div>

                <ChevronRight className="text-slate-500" />

              </div>

            </div>

            <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-4">

                  <Shield
                    size={28}
                    className="text-green-400"
                  />

                  <div>

                    <h3 className="font-bold">
                      Security Center
                    </h3>

                    <p className="text-sm text-slate-400 mt-1">
                      Report suspicious activity or secure your account.
                    </p>

                  </div>

                </div>

                <ChevronRight className="text-slate-500" />

              </div>

            </div>

            <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-4">

                  <FileText
                    size={28}
                    className="text-cyan-400"
                  />

                  <div>

                    <h3 className="font-bold">
                      KYC Verification
                    </h3>

                    <p className="text-sm text-slate-400 mt-1">
                      Contact: kyc@ai-tonkeeper.xyz
                    </p>

                  </div>

                </div>

                <ChevronRight className="text-slate-500" />

              </div>

            </div>

            <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-4">

                  <Shield
                    size={28}
                    className="text-red-400"
                  />

                  <div>

                    <h3 className="font-bold">
                      Security Team
                    </h3>

                    <p className="text-sm text-slate-400 mt-1">
                      security@ai-tonkeeper.xyz
                    </p>

                  </div>

                </div>

                <ChevronRight className="text-slate-500" />

              </div>

            </div>

          </div>

        </div>

        {/* Send Support Request */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Send Support Request
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Describe your issue and our team will contact you as soon as possible.
          </p>

          <textarea
            placeholder="Write your message..."
            rows={6}
            className="mt-5 w-full rounded-2xl border border-slate-700 bg-[#050B18] p-4 outline-none focus:border-cyan-500 resize-none"
          ></textarea>

          <button className="mt-5 w-full rounded-2xl bg-cyan-500 py-4 font-bold text-black hover:bg-cyan-400 transition">

            Send Request

          </button>

        </div>

        {/* Support Hours */}

        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Support Hours
          </h2>

          <div className="mt-5 space-y-4">

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Monday - Friday
              </span>

              <span className="font-semibold">
                24 Hours
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Saturday
              </span>

              <span className="font-semibold">
                24 Hours
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Sunday
              </span>

              <span className="font-semibold">
                24 Hours
              </span>

            </div>

          </div>

        </div>

        {/* Footer */}

        <div className="mt-10 text-center">

          <p className="text-sm text-slate-500">
            Website
          </p>

          <p className="mt-2 font-semibold text-cyan-400">
            https://ai-tonkeeper.xyz
          </p>

          <p className="mt-6 text-xs text-slate-600">
            © 2026 AI TONKEEPER. All rights reserved.
          </p>

        </div>

      </div>

    </main>

  );
}