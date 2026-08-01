import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-700 via-blue-800 to-blue-950 text-white">

      {/* ================= NAVBAR ================= */}

      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-blue-900/40 border-b border-white/10">

        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 py-4">

          {/* Logo */}

          <div className="flex items-center gap-3">

            <img
              src="/logo.png"
              alt="AI TONKEEPER"
              className="w-12 h-12 object-contain rounded-xl"
            />

            <div>

              <h1 className="text-2xl font-extrabold tracking-wide">
                AI TONKEEPER
              </h1>

              <p className="text-xs text-cyan-200">
                Secure • Intelligent • Global
              </p>

            </div>

          </div>

          {/* Desktop Menu */}

          <div className="hidden lg:flex items-center gap-8">

            <a href="#" className="hover:text-cyan-300 transition">
              Home
            </a>

            <a href="#features" className="hover:text-cyan-300 transition">
              Features
            </a>

            <a href="#services" className="hover:text-cyan-300 transition">
              Services
            </a>

            <a href="#support" className="hover:text-cyan-300 transition">
              Support
            </a>

            <Link
              href="/signin"
              className="px-5 py-2 rounded-xl border border-cyan-400 hover:bg-cyan-500 hover:text-black transition"
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="px-6 py-3 rounded-xl bg-cyan-400 text-blue-950 font-bold hover:scale-105 transition"
            >
              Get Started
            </Link>

          </div>

        </div>

      </nav>
      {/* ================= HERO SECTION ================= */}

      <section className="max-w-7xl mx-auto px-6 py-24 flex flex-col-reverse lg:flex-row items-center gap-20">

        {/* Left */}

        <div className="flex-1">

          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-cyan-300 bg-cyan-500/10 text-cyan-200 font-medium">

            🌍 Global AI Crypto Platform

          </span>

          <h2 className="mt-8 text-5xl md:text-7xl font-extrabold leading-tight">

            Welcome to

            <br />

            <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">

              AI TONKEEPER

            </span>

          </h2>

          <p className="mt-8 text-xl text-blue-100 leading-9 max-w-2xl">

            Securely manage your crypto assets, buy TON, deposit and withdraw
            funds, connect your wallet and use AI-powered tools to grow your
            digital portfolio from anywhere in the world.

          </p>

          <div className="flex flex-wrap gap-5 mt-12">

            <Link
              href="/signup"
              className="px-8 py-4 rounded-2xl bg-cyan-400 text-blue-950 font-bold hover:scale-105 transition"
            >
              Get Started
            </Link>

            <Link
              href="/signin"
              className="px-8 py-4 rounded-2xl border border-white hover:bg-white hover:text-blue-900 transition font-bold"
            >
              Login
            </Link>

          </div>

        </div>

        {/* Right */}

        <div className="flex-1 flex justify-center">

          <div className="relative w-[420px] h-[420px] rounded-[40px] bg-gradient-to-br from-cyan-400 via-blue-600 to-blue-950 shadow-[0_0_70px_rgba(34,211,238,0.35)] flex items-center justify-center">

            <div className="absolute inset-5 rounded-[32px] border border-white/20"></div>

            <div className="text-center z-10">

              <img
                src="/logo.png"
                alt="AI TONKEEPER"
                className="w-32 h-32 mx-auto object-contain"
              />

              <h3 className="mt-6 text-4xl font-bold">

                AI TONKEEPER

              </h3>

              <p className="mt-4 text-blue-100">

                Secure • Intelligent • Fast

              </p>

              <div className="mt-8 flex justify-center gap-4">

                <span className="px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-300">

                  TON

                </span>

                <span className="px-4 py-2 rounded-full bg-white/10 border border-white/20">

                  AI

                </span>

                <span className="px-4 py-2 rounded-full bg-white/10 border border-white/20">

                  Wallet

                </span>

              </div>

            </div>

          </div>

        </div>

      </section>
      {/* ================= STATISTICS ================= */}

      <section className="max-w-7xl mx-auto px-6 pb-24">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

          <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 p-6 hover:scale-105 transition">

            <div className="text-5xl mb-4">
              👥
            </div>

            <h3 className="text-4xl font-extrabold">
              10K+
            </h3>

            <p className="mt-2 text-blue-100">
              Active Users
            </p>

          </div>

          <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 p-6 hover:scale-105 transition">

            <div className="text-5xl mb-4">
              💰
            </div>

            <h3 className="text-4xl font-extrabold">
              $2.5M+
            </h3>

            <p className="mt-2 text-blue-100">
              Assets Managed
            </p>

          </div>

          <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 p-6 hover:scale-105 transition">

            <div className="text-5xl mb-4">
              🛡️
            </div>

            <h3 className="text-4xl font-extrabold">
              99.9%
            </h3>

            <p className="mt-2 text-blue-100">
              Secure Transactions
            </p>

          </div>

          <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 p-6 hover:scale-105 transition">

            <div className="text-5xl mb-4">
              ⚡
            </div>

            <h3 className="text-4xl font-extrabold">
              24/7
            </h3>

            <p className="mt-2 text-blue-100">
              AI Monitoring
            </p>

          </div>

        </div>

      </section>

      {/* ================= WHY CHOOSE AI TONKEEPER ================= */}

      <section
        id="features"
        className="max-w-7xl mx-auto px-6 py-24"
      >

        <div className="text-center mb-16">

          <span className="inline-block px-5 py-2 rounded-full bg-cyan-500/20 border border-cyan-300 text-cyan-200 font-semibold">

            WHY CHOOSE US

          </span>

          <h2 className="mt-6 text-5xl font-extrabold">

            Why Choose

            <span className="text-cyan-300">
              {" "}AI TONKEEPER
            </span>

            ?

          </h2>

          <p className="mt-6 text-blue-100 max-w-3xl mx-auto text-lg">

            A secure crypto ecosystem powered by artificial intelligence,
            designed to simplify digital asset management.

          </p>

        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Card 1 */}

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">

            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-4xl mb-6">

              🔐

            </div>

            <h3 className="text-2xl font-bold">

              Secure Wallet

            </h3>

            <p className="mt-4 text-blue-100 leading-7">

              Your digital assets are protected with advanced security and a reliable wallet architecture.

            </p>

          </div>

          {/* Card 2 */}

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">

            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-4xl mb-6">

              🤖

            </div>

            <h3 className="text-2xl font-bold">

              AI Assistant

            </h3>

            <p className="mt-4 text-blue-100 leading-7">

              Receive intelligent market analysis, portfolio insights and AI-powered assistance.

            </p>

          </div>

          {/* Card 3 */}

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">

            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-4xl mb-6">

              🌍

            </div>

            <h3 className="text-2xl font-bold">

              Global Access

            </h3>

            <p className="mt-4 text-blue-100 leading-7">

              Access AI TONKEEPER from anywhere and manage your crypto anytime.

            </p>

          </div>

          {/* Card 4 */}

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">

            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-4xl mb-6">

              ⚡

            </div>

            <h3 className="text-2xl font-bold">

              Lightning Speed

            </h3>

            <p className="mt-4 text-blue-100 leading-7">

              Fast deposits, withdrawals and AI-powered services designed for a smooth experience.

            </p>

          </div>

        </div>

      </section>
      {/* ================= OUR SERVICES ================= */}

      <section
        id="services"
        className="max-w-7xl mx-auto px-6 py-24"
      >

        <div className="text-center mb-16">

          <span className="inline-block px-5 py-2 rounded-full bg-cyan-500/20 border border-cyan-300 text-cyan-200 font-semibold">

            OUR SERVICES

          </span>

          <h2 className="mt-6 text-5xl font-extrabold">

            Everything You Need

            <br />

            <span className="text-cyan-300">

              In One Platform

            </span>

          </h2>

          <p className="mt-6 text-blue-100 max-w-3xl mx-auto text-lg leading-8">

            AI TONKEEPER combines wallet management, crypto purchases,
            AI assistance and security tools into one modern platform.

          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Wallet */}

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-8 hover:-translate-y-2 transition-all duration-300">

            <div className="text-5xl mb-6">👛</div>

            <h3 className="text-2xl font-bold">

              Smart Wallet

            </h3>

            <p className="mt-4 text-blue-100 leading-7">

              Store, send and receive TON securely from one intelligent dashboard.

            </p>

          </div>

          {/* Buy */}

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-8 hover:-translate-y-2 transition-all duration-300">

            <div className="text-5xl mb-6">💳</div>

            <h3 className="text-2xl font-bold">

              Buy Crypto

            </h3>

            <p className="mt-4 text-blue-100 leading-7">

              Purchase TON and other supported cryptocurrencies through trusted providers.

            </p>

          </div>

          {/* AI */}

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-8 hover:-translate-y-2 transition-all duration-300">

            <div className="text-5xl mb-6">🤖</div>

            <h3 className="text-2xl font-bold">

              AI Trading

            </h3>

            <p className="mt-4 text-blue-100 leading-7">

              Analyze markets with AI and access future automated trading features.

            </p>

          </div>

          {/* Deposit */}

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-8 hover:-translate-y-2 transition-all duration-300">

            <div className="text-5xl mb-6">⬇️</div>

            <h3 className="text-2xl font-bold">

              Deposit

            </h3>

            <p className="mt-4 text-blue-100 leading-7">

              Deposit TON or BTC directly to your wallet using secure blockchain transfers.

            </p>

          </div>

          {/* Withdraw */}

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-8 hover:-translate-y-2 transition-all duration-300">

            <div className="text-5xl mb-6">⬆️</div>

            <h3 className="text-2xl font-bold">

              Withdraw

            </h3>

            <p className="mt-4 text-blue-100 leading-7">

              Withdraw your assets quickly and securely whenever you choose.

            </p>

          </div>

          {/* Referral */}

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-8 hover:-translate-y-2 transition-all duration-300">

            <div className="text-5xl mb-6">🎁</div>

            <h3 className="text-2xl font-bold">

              Referral Rewards

            </h3>

            <p className="mt-4 text-blue-100 leading-7">

              Invite friends and earn rewards through the AI TONKEEPER referral program.

            </p>

          </div>

        </div>

      </section>
      {/* ================= PREMIUM FEATURES ================= */}

      <section className="max-w-7xl mx-auto px-6 py-24">

        <div className="text-center mb-16">

          <span className="inline-block px-5 py-2 rounded-full bg-cyan-500/20 border border-cyan-300 text-cyan-200 font-semibold">

            PREMIUM FEATURES

          </span>

          <h2 className="mt-6 text-5xl font-extrabold">

            Built For The

            <span className="text-cyan-300">

              Future Of Crypto

            </span>

          </h2>

          <p className="mt-6 text-blue-100 max-w-3xl mx-auto text-lg leading-8">

            AI TONKEEPER combines blockchain technology, artificial intelligence
            and modern security to deliver a premium crypto experience.

          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Feature 1 */}

          <div className="rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-900/40 border border-cyan-400/30 p-8 hover:-translate-y-3 hover:shadow-[0_0_35px_rgba(34,211,238,0.35)] transition-all duration-300">

            <div className="text-6xl mb-6">

              🤖

            </div>

            <h3 className="text-2xl font-bold">

              AI Assistant

            </h3>

            <p className="mt-4 text-blue-100 leading-7">

              Intelligent portfolio monitoring and market analysis powered by AI.

            </p>

          </div>

          {/* Feature 2 */}

          <div className="rounded-3xl bg-gradient-to-br from-blue-500/20 to-blue-900/40 border border-blue-300/30 p-8 hover:-translate-y-3 hover:shadow-[0_0_35px_rgba(59,130,246,0.35)] transition-all duration-300">

            <div className="text-6xl mb-6">

              🔒

            </div>

            <h3 className="text-2xl font-bold">

              Advanced Security

            </h3>

            <p className="mt-4 text-blue-100 leading-7">

              Modern security architecture designed to protect your digital assets.

            </p>

          </div>

          {/* Feature 3 */}

          <div className="rounded-3xl bg-gradient-to-br from-cyan-500/20 to-indigo-900/40 border border-cyan-300/30 p-8 hover:-translate-y-3 hover:shadow-[0_0_35px_rgba(6,182,212,0.35)] transition-all duration-300">

            <div className="text-6xl mb-6">

              ⚡

            </div>

            <h3 className="text-2xl font-bold">

              Lightning Speed

            </h3>

            <p className="mt-4 text-blue-100 leading-7">

              Optimized transactions for a fast and seamless user experience.

            </p>

          </div>

          {/* Feature 4 */}

          <div className="rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-900/40 border border-purple-300/30 p-8 hover:-translate-y-3 hover:shadow-[0_0_35px_rgba(168,85,247,0.35)] transition-all duration-300">

            <div className="text-6xl mb-6">

              🌍

            </div>

            <h3 className="text-2xl font-bold">

              Worldwide Access

            </h3>

            <p className="mt-4 text-blue-100 leading-7">

              Access your wallet securely from anywhere, anytime and on any device.

            </p>

          </div>

        </div>

      </section>
      {/* ================= HOW IT WORKS ================= */}

      <section className="max-w-7xl mx-auto px-6 py-24">

        <div className="text-center mb-16">

          <span className="inline-block px-5 py-2 rounded-full bg-cyan-500/20 border border-cyan-300 text-cyan-200 font-semibold">

            HOW IT WORKS

          </span>

          <h2 className="mt-6 text-5xl font-extrabold">

            Get Started In

            <span className="text-cyan-300">

              Four Easy Steps

            </span>

          </h2>

          <p className="mt-6 text-blue-100 max-w-3xl mx-auto text-lg leading-8">

            AI TONKEEPER is designed to be simple, secure and fast for every user.

          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* STEP 1 */}

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-8 text-center hover:-translate-y-3 transition-all duration-300">

            <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500 flex items-center justify-center text-2xl font-bold text-black">

              1

            </div>

            <h3 className="mt-6 text-2xl font-bold">

              Create Account

            </h3>

            <p className="mt-4 text-blue-100 leading-7">

              Register securely and create your AI TONKEEPER account in just a few moments.

            </p>

          </div>

          {/* STEP 2 */}

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-8 text-center hover:-translate-y-3 transition-all duration-300">

            <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500 flex items-center justify-center text-2xl font-bold text-black">

              2

            </div>

            <h3 className="mt-6 text-2xl font-bold">

              Deposit Crypto

            </h3>

            <p className="mt-4 text-blue-100 leading-7">

              Deposit TON or BTC using your personal wallet addresses safely.

            </p>

          </div>

          {/* STEP 3 */}

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-8 text-center hover:-translate-y-3 transition-all duration-300">

            <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500 flex items-center justify-center text-2xl font-bold text-black">

              3

            </div>

            <h3 className="mt-6 text-2xl font-bold">

              Buy Crypto

            </h3>

            <p className="mt-4 text-blue-100 leading-7">

              Buy TON easily through our trusted purchase provider and return to AI TONKEEPER.

            </p>

          </div>

          {/* STEP 4 */}

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-8 text-center hover:-translate-y-3 transition-all duration-300">

            <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500 flex items-center justify-center text-2xl font-bold text-black">

              4

            </div>

            <h3 className="mt-6 text-2xl font-bold">

              AI Trading

            </h3>

            <p className="mt-4 text-blue-100 leading-7">

              Use AI tools to analyze the market and access future automated trading features.

            </p>

          </div>

        </div>

      </section>
      {/* ================= TESTIMONIALS ================= */}

      <section className="max-w-7xl mx-auto px-6 py-24">

        <div className="text-center mb-16">

          <span className="inline-block px-5 py-2 rounded-full bg-cyan-500/20 border border-cyan-300 text-cyan-200 font-semibold">

            TESTIMONIALS

          </span>

          <h2 className="mt-6 text-5xl font-extrabold">

            Trusted By

            <span className="text-cyan-300">

              Crypto Users

            </span>

          </h2>

          <p className="mt-6 text-blue-100 max-w-3xl mx-auto text-lg leading-8">

            Discover why users choose AI TONKEEPER to manage their digital assets.

          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Review 1 */}

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-8 hover:-translate-y-2 transition-all duration-300">

            <div className="text-yellow-400 text-2xl">

              ⭐⭐⭐⭐⭐

            </div>

            <p className="mt-6 text-blue-100 leading-8">

              "Very clean interface, easy to use and the AI features look very promising."

            </p>

            <div className="mt-8">

              <h3 className="font-bold text-xl">

                Michael R.

              </h3>

              <p className="text-cyan-300">

                Crypto Investor

              </p>

            </div>

          </div>

          {/* Review 2 */}

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-8 hover:-translate-y-2 transition-all duration-300">

            <div className="text-yellow-400 text-2xl">

              ⭐⭐⭐⭐⭐

            </div>

            <p className="mt-6 text-blue-100 leading-8">

              "Buying crypto and managing my wallet in one place makes everything much simpler."

            </p>

            <div className="mt-8">

              <h3 className="font-bold text-xl">

                Sarah K.

              </h3>

              <p className="text-cyan-300">

                Blockchain Enthusiast

              </p>

            </div>

          </div>

          {/* Review 3 */}

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-8 hover:-translate-y-2 transition-all duration-300">

            <div className="text-yellow-400 text-2xl">

              ⭐⭐⭐⭐⭐

            </div>

            <p className="mt-6 text-blue-100 leading-8">

              "The design is premium and I can't wait to use the AI Trading features."

            </p>

            <div className="mt-8">

              <h3 className="font-bold text-xl">

                David T.

              </h3>

              <p className="text-cyan-300">

                Web3 Trader

              </p>

            </div>

          </div>

        </div>

      </section>
      {/* ================= FAQ ================= */}

      <section
        id="support"
        className="max-w-7xl mx-auto px-6 py-24"
      >

        <div className="text-center mb-16">

          <span className="inline-block px-5 py-2 rounded-full bg-cyan-500/20 border border-cyan-300 text-cyan-200 font-semibold">

            FAQ

          </span>

          <h2 className="mt-6 text-5xl font-extrabold">

            Frequently Asked

            <span className="text-cyan-300">

              Questions

            </span>

          </h2>

          <p className="mt-6 text-blue-100 max-w-3xl mx-auto text-lg leading-8">

            Find quick answers to the most common questions about AI TONKEEPER.

          </p>

        </div>

        <div className="max-w-4xl mx-auto space-y-6">

          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-7">

            <h3 className="text-2xl font-bold">

              Is AI TONKEEPER secure?

            </h3>

            <p className="mt-4 text-blue-100 leading-8">

              Yes. AI TONKEEPER is designed with modern security practices to help protect your wallet and your digital assets.

            </p>

          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-7">

            <h3 className="text-2xl font-bold">

              Can I buy TON directly?

            </h3>

            <p className="mt-4 text-blue-100 leading-8">

              Yes. You can purchase TON through our integrated crypto purchase provider and then return to AI TONKEEPER.

            </p>

          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-7">

            <h3 className="text-2xl font-bold">

              Which cryptocurrencies are supported?

            </h3>

            <p className="mt-4 text-blue-100 leading-8">

              AI TONKEEPER currently focuses on TON and Bitcoin, with support for additional cryptocurrencies planned in future updates.

            </p>

          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-7">

            <h3 className="text-2xl font-bold">

              Will AI Trading be available?

            </h3>

            <p className="mt-4 text-blue-100 leading-8">

              Yes. AI Trading is planned as a future feature. It will provide market analysis and advanced trading tools within AI TONKEEPER.

            </p>

          </div>

        </div>

      </section>
      {/* ================= FOOTER ================= */}

      <footer className="border-t border-white/10 mt-20">

        <div className="max-w-7xl mx-auto px-6 py-16">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

            {/* Logo */}

            <div>

              <img
                src="/logo.png"
                alt="AI TONKEEPER"
                className="w-20 h-20 object-contain"
              />

              <h2 className="mt-4 text-3xl font-bold">

                AI TONKEEPER

              </h2>

              <p className="mt-4 text-blue-100 leading-8">

                Secure, intelligent and modern crypto platform powered by Artificial Intelligence.

              </p>

            </div>

            {/* Platform */}

            <div>

              <h3 className="text-xl font-bold mb-5">

                Platform

              </h3>

              <div className="space-y-3">

                <Link href="/signin" className="block hover:text-cyan-300">

                  Login

                </Link>

                <Link href="/signup" className="block hover:text-cyan-300">

                  Register

                </Link>

                <Link href="/dashboard" className="block hover:text-cyan-300">

                  Dashboard

                </Link>

                <Link href="/buy" className="block hover:text-cyan-300">

                  Buy Crypto

                </Link>

              </div>

            </div>

            {/* Services */}

            <div>

              <h3 className="text-xl font-bold mb-5">

                Services

              </h3>

              <div className="space-y-3">

                <Link href="/deposit" className="block hover:text-cyan-300">

                  Deposit

                </Link>

                <Link href="/withdraw" className="block hover:text-cyan-300">

                  Withdraw

                </Link>

                <Link href="/history" className="block hover:text-cyan-300">

                  History

                </Link>

                <Link href="/ai" className="block hover:text-cyan-300">

                  AI Trading

                </Link>

              </div>

            </div>

            {/* Support */}

            <div>

              <h3 className="text-xl font-bold mb-5">

                Support

              </h3>

              <div className="space-y-3">

                <Link href="/settings" className="block hover:text-cyan-300">

                  Settings

                </Link>

                <a href="#" className="block hover:text-cyan-300">

                  Privacy Policy

                </a>

                <a href="#" className="block hover:text-cyan-300">

                  Terms of Service

                </a>

                <a href="#" className="block hover:text-cyan-300">

                  Contact Support

                </a>

              </div>

            </div>

          </div>

          <div className="mt-16 border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">

            <p className="text-blue-200 text-center md:text-left">

              © 2026 AI TONKEEPER. All Rights Reserved.

            </p>

            <div className="flex gap-5 mt-5 md:mt-0 text-2xl">

              <span>🌍</span>

              <span>💬</span>

              <span>📧</span>

              <span>🚀</span>

            </div>

          </div>

        </div>

      </footer>

    </main>

  );

}