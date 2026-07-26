export default function DepositPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6 md:p-8">

      <h1 className="text-3xl md:text-4xl font-bold text-white">
        Deposit TON
      </h1>

      <p className="text-blue-200 mt-3">
        Add TON to your AI TONKEEPER wallet.
      </p>


      <div className="mt-8 rounded-2xl bg-slate-900 border border-slate-700 p-6">

        <h2 className="text-2xl font-bold text-white">
          Deposit Address
        </h2>


        <div className="mt-5 bg-slate-800 rounded-xl p-4">

          <p className="text-slate-400 text-sm">
            Your TON address
          </p>

          <p className="text-cyan-400 mt-2 break-all">
            Connect wallet to generate address
          </p>

        </div>


        <button className="mt-6 bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-6 py-3 rounded-xl">
          Copy Address
        </button>


      </div>

    </main>
  );
}