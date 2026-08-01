import Sidebar from "../components/Sidebar";

export default function AITradingPage() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">

      <Sidebar />

      <main className="flex-1 p-8 text-white">


        <h1 className="text-4xl font-bold">
          🤖 AI Trading Engine
        </h1>

        <p className="text-blue-200 mt-2">
          Intelligent crypto trading powered by AI TONKEEPER
        </p>



        {/* Main Wallet */}

        <div className="mt-8 rounded-3xl bg-slate-900 border border-cyan-500/30 p-6">

          <h2 className="text-2xl font-bold">
            Main Wallet
          </h2>

          <p className="text-slate-400 mt-3">
            Your Tonkeeper wallet is the transaction center of AI TONKEEPER.
          </p>


          <div className="mt-5 bg-slate-800 rounded-xl p-5">

            <p className="text-slate-400">
              Wallet Status
            </p>

            <p className="text-green-400 font-bold mt-2">
              ● Ready
            </p>

          </div>

        </div>




        {/* AI Information Cards */}

        <div className="grid md:grid-cols-3 gap-6 mt-8">


          <div className="rounded-3xl bg-slate-900 border border-green-500/30 p-6">

            <h3 className="text-xl font-bold">
              AI Status
            </h3>

            <p className="text-green-400 text-2xl mt-4">
              Active
            </p>

          </div>



          <div className="rounded-3xl bg-slate-900 border border-blue-500/30 p-6">

            <h3 className="text-xl font-bold">
              Strategy
            </h3>

            <p className="text-cyan-400 text-2xl mt-4">
              Conservative
            </p>

          </div>



          <div className="rounded-3xl bg-slate-900 border border-purple-500/30 p-6">

            <h3 className="text-xl font-bold">
              Network
            </h3>

            <p className="text-white text-2xl mt-4">
              TON
            </p>

          </div>


        </div>





        {/* Market Analysis */}

        <div className="mt-8 rounded-3xl bg-slate-900 border border-slate-700 p-6">


          <h2 className="text-2xl font-bold">
            AI Market Analysis
          </h2>


          <div className="h-60 mt-6 rounded-xl border border-dashed border-cyan-500 flex items-center justify-center">

            <p className="text-cyan-400">
              AI analysis system coming soon...
            </p>

          </div>


        </div>





        {/* Trading Control */}

        <div className="mt-8 rounded-3xl bg-slate-900 border border-slate-700 p-6">


          <h2 className="text-2xl font-bold">
            Trading Control
          </h2>


          <div className="grid md:grid-cols-3 gap-5 mt-6">


            <button className="bg-green-500 text-black font-bold py-4 rounded-xl">
              Start AI Trading
            </button>


            <button className="bg-yellow-400 text-black font-bold py-4 rounded-xl">
              Pause AI
            </button>


            <button className="bg-red-500 text-white font-bold py-4 rounded-xl">
              Stop Trading
            </button>


          </div>


        </div>





        {/* Positions */}

        <div className="mt-8 rounded-3xl bg-slate-900 border border-slate-700 p-6">


          <h2 className="text-2xl font-bold">
            Open Positions
          </h2>


          <p className="text-slate-400 mt-4">
            No active positions.
          </p>


        </div>





        {/* History */}

        <div className="mt-8 rounded-3xl bg-slate-900 border border-slate-700 p-6">


          <h2 className="text-2xl font-bold">
            AI Trade History
          </h2>


          <p className="text-slate-400 mt-4">
            No AI trades executed yet.
          </p>


        </div>



      </main>

    </div>
  );
}