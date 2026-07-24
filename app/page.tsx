import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-700 via-blue-800 to-blue-950 text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white text-blue-700 flex items-center justify-center font-bold text-xl">
            AT
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-wide">
              AI TONKEEPER
            </h1>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-lg">
          <a href="#" className="hover:text-blue-200 transition">
            Home
          </a>

          <a href="#" className="hover:text-blue-200 transition">
            About
          </a>

          <a href="#" className="hover:text-blue-200 transition">
            Support
          </a>

        <Link
  href="/signin"
  className="bg-white text-blue-700 px-5 py-2 rounded-xl font-semibold hover:bg-blue-100 transition"
>
  Login
</Link>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 py-20 flex flex-col lg:flex-row items-center justify-between gap-16">

        <div className="flex-1">
          <span className="inline-block bg-blue-500/30 border border-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
            🌍 Global AI Crypto Platform
          </span>

          <h2 className="text-5xl md:text-7xl font-extrabold leading-tight">
            Welcome to
            <br />
            <span className="text-cyan-300">
              AI TONKEEPER
            </span>
          </h2>

          <p className="mt-8 text-xl text-blue-100 max-w-2xl leading-9">
            Manage your crypto assets securely, deposit funds, connect your
            wallet, and use powerful AI tools to analyze your portfolio from
            anywhere in the world.
          </p>

          <div className="flex flex-wrap gap-5 mt-10">

        <Link
  href="/signup"
  className="px-8 py-4 rounded-2xl bg-white text-blue-700 font-bold hover:scale-105 transition"
>
  Get Started
</Link>

            <button className="px-8 py-4 rounded-2xl border border-white text-white font-bold text-lg hover:bg-white hover:text-blue-700 transition">
              Learn More
            </button>

          </div>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="w-[420px] h-[420px] rounded-3xl bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-900 shadow-2xl flex items-center justify-center">

            <div className="text-center">

              <div className="text-8xl mb-6">
                💎
              </div>

              <h3 className="text-3xl font-bold">
                AI TONKEEPER
              </h3>

              <p className="mt-4 text-blue-100 px-8">
                Secure • Intelligent • Global
              </p>

            </div>

          </div>
        </div>

      </section>
      {/* Statistics */}

      <section className="max-w-7xl mx-auto px-8 pb-24">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20">

            <div className="text-5xl mb-4">👥</div>

            <h3 className="text-4xl font-bold">
              10K+
            </h3>

            <p className="mt-3 text-blue-100">
              Active Users Worldwide
            </p>

          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20">

            <div className="text-5xl mb-4">💰</div>

            <h3 className="text-4xl font-bold">
              $2.5M+
            </h3>

            <p className="mt-3 text-blue-100">
              Total Assets Managed
            </p>

          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20">

            <div className="text-5xl mb-4">🛡️</div>

            <h3 className="text-4xl font-bold">
              99.9%
            </h3>

            <p className="mt-3 text-blue-100">
              Secure Transactions
            </p>

          </div>

        </div>

      </section>
      {/* Why Choose AI TONKEEPER */}

<section className="max-w-7xl mx-auto px-8 py-24">

  <div className="text-center mb-16">

    <h2 className="text-5xl font-bold">
      Why Choose AI TONKEEPER?
    </h2>

    <p className="mt-5 text-blue-100 text-xl max-w-3xl mx-auto">
      Everything you need to manage your crypto securely with powerful AI tools.
    </p>

  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

    <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:scale-105 transition">

      <div className="text-5xl mb-5">🔐</div>

      <h3 className="text-2xl font-bold">
        Secure Wallet
      </h3>

      <p className="mt-4 text-blue-100">
        Military-grade encryption keeps your digital assets protected.
      </p>

    </div>

    <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:scale-105 transition">

      <div className="text-5xl mb-5">🤖</div>

      <h3 className="text-2xl font-bold">
        AI Assistant
      </h3>

      <p className="mt-4 text-blue-100">
        Get smart portfolio insights powered by artificial intelligence.
      </p>

    </div>

    <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:scale-105 transition">

      <div className="text-5xl mb-5">🌍</div>

      <h3 className="text-2xl font-bold">
        Global Access
      </h3>

      <p className="mt-4 text-blue-100">
        Access your wallet securely from anywhere in the world.
      </p>

    </div>

    <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:scale-105 transition">

      <div className="text-5xl mb-5">⚡</div>

      <h3 className="text-2xl font-bold">
        Fast Transactions
      </h3>

      <p className="mt-4 text-blue-100">
        Enjoy lightning-fast blockchain transactions with minimal fees.
      </p>

    </div>

  </div>

</section>
   {/* Our Services */}

<section className="max-w-7xl mx-auto px-8 py-24">

  <div className="text-center mb-16">

    <span className="inline-block px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-300 text-cyan-200 text-sm font-semibold">
      OUR SERVICES
    </span>

    <h2 className="mt-6 text-5xl font-extrabold">
      Everything You Need
      <br />
      <span className="text-cyan-300">
        In One Platform
      </span>
    </h2>

    <p className="mt-6 text-blue-100 max-w-3xl mx-auto text-lg">
      AI TONKEEPER provides secure wallet management,
      AI-powered tools, KYC verification and referral rewards
      to simplify your crypto experience.
    </p>

  </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

  <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:scale-105 transition duration-300">
    <div className="text-5xl mb-5">💼</div>
    <h3 className="text-2xl font-bold mb-4">
      Wallet Management
    </h3>
    <p className="text-blue-100 leading-7">
      Securely manage your TON wallet, deposits, withdrawals and balances from one dashboard.
    </p>
  </div>

  <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:scale-105 transition duration-300">
    <div className="text-5xl mb-5">🤖</div>
    <h3 className="text-2xl font-bold mb-4">
      AI Assistant
    </h3>
    <p className="text-blue-100 leading-7">
      Get intelligent insights, portfolio analysis and smart recommendations powered by AI.
    </p>
  </div>

  <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:scale-105 transition duration-300">
    <div className="text-5xl mb-5">🛡️</div>
    <h3 className="text-2xl font-bold mb-4">
      KYC Verification
    </h3>
    <p className="text-blue-100 leading-7">
      Complete identity verification quickly and securely to unlock premium features.
    </p>
  </div>

  <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:scale-105 transition duration-300">
    <div className="text-5xl mb-5">👥</div>
    <h3 className="text-2xl font-bold mb-4">
      Referral Program
    </h3>
    <p className="text-blue-100 leading-7">
      Invite friends, grow your network and earn referral rewards automatically.
    </p>
  </div>

</div>
   </section>
    {/* Features */}
<section className="max-w-7xl mx-auto px-8 py-24">

  <div className="text-center mb-16">
    <h2 className="text-5xl font-bold">
      Powerful Features
    </h2>

    <p className="text-blue-200 mt-5 text-xl">
      Everything you need to manage your crypto securely with AI.
    </p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:scale-105 transition">
      <div className="text-5xl mb-5">👛</div>
      <h3 className="text-2xl font-bold">Wallet</h3>
      <p className="mt-4 text-blue-100">
        Connect and manage your TON wallet securely.
      </p>
    </div>

    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:scale-105 transition">
      <div className="text-5xl mb-5">🤖</div>
      <h3 className="text-2xl font-bold">AI Assistant</h3>
      <p className="mt-4 text-blue-100">
        Intelligent crypto insights powered by AI.
      </p>
    </div>

    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:scale-105 transition">
      <div className="text-5xl mb-5">🔐</div>
      <h3 className="text-2xl font-bold">KYC Security</h3>
      <p className="mt-4 text-blue-100">
        Verify your identity safely and quickly.
      </p>
    </div>
<div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl hover:scale-105 hover:-translate-y-3 hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] transition-all duration-500 cursor-pointer">
      <div className="text-5xl mb-5">🎁</div>
      <h3 className="text-2xl font-bold">Referral Rewards</h3>
      <p className="mt-4 text-blue-100">
        Earn bonuses by inviting new users.
      </p>
    </div>

  </div>
</section>
   {/* How It Works */}
<section className="max-w-7xl mx-auto px-8 py-24">

  <div className="text-center mb-16">
    <h2 className="text-5xl font-bold">
      How It Works
    </h2>

    <p className="text-blue-200 mt-5 text-xl">
      Start using AI TONKEEPER in just four simple steps.
    </p>
  </div>

  <div className="grid md:grid-cols-4 gap-8">

    <div className="bg-white/10 rounded-3xl p-8 text-center border border-white/20">
      <div className="text-5xl mb-4">1️⃣</div>
      <h3 className="text-2xl font-bold">Create Account</h3>
      <p className="text-blue-100 mt-4">
        Register securely in a few seconds.
      </p>
    </div>

    <div className="bg-white/10 rounded-3xl p-8 text-center border border-white/20">
      <div className="text-5xl mb-4">2️⃣</div>
      <h3 className="text-2xl font-bold">Connect Wallet</h3>
      <p className="text-blue-100 mt-4">
        Link your TON wallet safely.
      </p>
    </div>

    <div className="bg-white/10 rounded-3xl p-8 text-center border border-white/20">
      <div className="text-5xl mb-4">3️⃣</div>
      <h3 className="text-2xl font-bold">Verify KYC</h3>
      <p className="text-blue-100 mt-4">
        Complete verification for full access.
      </p>
    </div>

    <div className="bg-white/10 rounded-3xl p-8 text-center border border-white/20">
      <div className="text-5xl mb-4">4️⃣</div>
      <h3 className="text-2xl font-bold">Start Trading</h3>
      <p className="text-blue-100 mt-4">
        Enjoy secure crypto management with AI.
      </p>
    </div>

  </div>

</section>
    {/* Footer */}
<footer className="border-t border-white/10 mt-24">

  <div className="max-w-7xl mx-auto px-8 py-12 flex flex-col md:flex-row justify-between items-center">

    <div>
      <h2 className="text-2xl font-bold">
        AI TONKEEPER
      </h2>

      <p className="text-blue-200 mt-2">
        Secure • Intelligent • Global
      </p>
    </div>

    <div className="flex gap-8 mt-8 md:mt-0">
      <a href="#" className="hover:text-cyan-300">Home</a>
      <a href="#" className="hover:text-cyan-300">About</a>
      <a href="#" className="hover:text-cyan-300">Support</a>
      <a href="#" className="hover:text-cyan-300">Privacy</a>
    </div>

  </div>

  <div className="text-center text-blue-300 pb-8">
    © 2026 AI TONKEEPER. All Rights Reserved.
  </div>

</footer>
      </main>
  );
}