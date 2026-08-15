"use client";

import Image from "next/image";
import Link from "next/link";

import {
  Globe,
  Shield,
  Bot,
  TrendingUp,
  Zap,
  Users,
  BadgeCheck,
  Earth,
  ArrowRight,
} from "lucide-react";

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-[#050B18] text-white">

      <div className="mx-auto max-w-md px-6 py-8">

        {/* Language */}

        <div className="flex justify-end">

          <button className="flex items-center gap-2 rounded-xl border border-slate-700 bg-[#101A2C] px-4 py-2 hover:border-cyan-500 transition">

            <Globe
              size={18}
              className="text-cyan-400"
            />

            <span className="font-medium">
              EN
            </span>

          </button>

        </div>

        {/* Logo */}

        <div className="mt-10 flex flex-col items-center">

          <Image
            src="/logo.png"
            alt="AI TONKEEPER"
            width={110}
            height={110}
            priority
          />

          <h1 className="mt-5 text-5xl font-extrabold tracking-wide">

            <span className="text-cyan-400">
              AI
            </span>{" "}

            TONKEEPER

          </h1>

          <p className="mt-2 text-slate-400 tracking-[0.25em] text-sm">

            SMART WALLET • AI POWERED

          </p>

        </div>

        {/* Hero */}

        <div className="mt-12 text-center">

          <h2 className="text-5xl font-extrabold leading-tight">

            The Smartest Way

            <br />

            to{" "}

            <span className="text-cyan-400">

              Grow Your Crypto

            </span>

          </h2>

          <p className="mt-6 text-slate-400 text-lg leading-8">

            AI TONKEEPER is a secure TON wallet with an
            intelligent AI trading assistant working for
            you 24/7.

          </p>

        </div>
        {/* Hero Illustration */}

        <div className="relative mt-12 flex justify-center">

          {/* TON */}

          <div className="absolute left-0 top-24">

            <Image
              src="/coins/ton.png"
              alt="TON"
              width={80}
              height={80}
            />

          </div>

          {/* Bitcoin */}

          <div className="absolute right-0 top-12">

            <Image
              src="/coins/btc.png"
              alt="Bitcoin"
              width={72}
              height={72}
            />

          </div>

          {/* Ethereum */}

          <div className="absolute right-4 bottom-10">

            <Image
              src="/coins/eth.png"
              alt="Ethereum"
              width={72}
              height={72}
            />

          </div>

          {/* AI Trading Card */}

          <div className="w-64 rounded-3xl border border-cyan-500 bg-gradient-to-b from-[#112243] to-[#081425] p-6 shadow-2xl shadow-cyan-500/20">

            <p className="text-center text-xl font-bold">

              AI TRADING

            </p>

            <p className="mt-1 text-center font-bold text-green-400">

              ACTIVE

            </p>

            <div className="mt-8 flex justify-center">

              <TrendingUp
                size={90}
                className="text-cyan-400"
              />

            </div>

            <div className="mt-8 flex justify-center">

              <BadgeCheck
                size={36}
                className="text-green-400"
              />

            </div>

          </div>

        </div>
        {/* Features */}

        <div className="mt-12 grid grid-cols-2 gap-4">

          <div className="rounded-3xl bg-[#101A2C] border border-slate-800 p-5 text-center">

            <Shield
              size={34}
              className="mx-auto text-cyan-400"
            />

            <h3 className="mt-4 font-bold">
              Secure Wallet
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Bank-level security to protect your assets.
            </p>

          </div>

          <div className="rounded-3xl bg-[#101A2C] border border-slate-800 p-5 text-center">

            <Bot
              size={34}
              className="mx-auto text-green-400"
            />

            <h3 className="mt-4 font-bold">
              AI Trading
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              AI trades automatically for you 24 hours a day.
            </p>

          </div>

          <div className="rounded-3xl bg-[#101A2C] border border-slate-800 p-5 text-center">

            <TrendingUp
              size={34}
              className="mx-auto text-purple-400"
            />

            <h3 className="mt-4 font-bold">
              Maximize Profit
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Advanced AI strategies designed to grow your portfolio.
            </p>

          </div>

          <div className="rounded-3xl bg-[#101A2C] border border-slate-800 p-5 text-center">

            <Zap
              size={34}
              className="mx-auto text-yellow-400"
            />

            <h3 className="mt-4 font-bold">
              Fast & Easy
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Send, receive and swap crypto in just a few taps.
            </p>

          </div>

        </div>
        {/* Community */}

        <div className="mt-12 rounded-3xl bg-[#101A2C] border border-slate-800 p-6">

          <h2 className="text-center text-2xl font-bold">
            Trusted Worldwide
          </h2>

          <p className="mt-3 text-center text-slate-400">
            Join thousands of users growing their crypto
            portfolio with AI TONKEEPER.
          </p>

          <div className="grid grid-cols-3 gap-4 mt-8">

            <div className="text-center">

              <Users
                size={30}
                className="mx-auto text-cyan-400"
              />

              <h3 className="mt-3 text-2xl font-bold">
                50K+
              </h3>

              <p className="text-sm text-slate-400">
                Active Users
              </p>

            </div>

            <div className="text-center">

              <Shield
                size={30}
                className="mx-auto text-green-400"
              />

              <h3 className="mt-3 text-2xl font-bold">
                99.9%
              </h3>

              <p className="text-sm text-slate-400">
                Security
              </p>

            </div>

            <div className="text-center">

              <Earth
                size={30}
                className="mx-auto text-blue-400"
              />

              <h3 className="mt-3 text-2xl font-bold">
                150+
              </h3>

              <p className="text-sm text-slate-400">
                Countries
              </p>

            </div>

          </div>

        </div>

        {/* Buttons */}

        <div className="mt-12 space-y-4">

          <Link href="/register">

            <button className="w-full h-14 rounded-2xl bg-cyan-500 hover:bg-cyan-400 transition flex items-center justify-center gap-2 text-lg font-bold text-black">

              Get Started

              <ArrowRight size={22} />

            </button>

          </Link>

          <Link href="/login">

            <button className="w-full h-14 rounded-2xl border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 transition text-lg font-semibold">

              Log In

            </button>

          </Link>

        </div>

        {/* Footer */}

        <div className="mt-10 text-center">

          <p className="text-slate-500 text-sm">
            By continuing, you agree to the Terms of Service
            and Privacy Policy of AI TONKEEPER.
          </p>

          <p className="mt-6 text-slate-600 text-xs">
            © 2026 AI TONKEEPER. All rights reserved.
          </p>

        </div>

      </div>

    </main>

  );
}