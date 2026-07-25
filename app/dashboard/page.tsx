import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <Sidebar />

      <main className="flex-1 p-8">
        <h1 className="text-5xl font-bold text-white">
          Welcome 👋
        </h1>

        <p className="text-blue-200 mt-3">
          Your TON portfolio overview
        </p>

        <div className="grid grid-cols-4 gap-6 mt-10">
          <div className="rounded-2xl bg-slate-900 p-6 border border-slate-700">
            <h3 className="text-slate-400">Balance</h3>
            <p className="text-3xl font-bold text-cyan-400 mt-2">
              0 TON
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900 p-6 border border-slate-700">
            <h3 className="text-slate-400">NFTs</h3>
            <p className="text-3xl font-bold text-white mt-2">
              0
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900 p-6 border border-slate-700">
            <h3 className="text-slate-400">Transactions</h3>
            <p className="text-3xl font-bold text-white mt-2">
              0
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900 p-6 border border-slate-700">
            <h3 className="text-slate-400">AI Status</h3>
            <p className="text-3xl font-bold text-green-400 mt-2">
              Ready
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-2xl bg-slate-900 border border-slate-700 p-8">
          <h2 className="text-2xl font-bold text-white">
            Portfolio Graph
          </h2>

          <div className="h-80 mt-6 rounded-xl border border-dashed border-cyan-500 flex items-center justify-center text-cyan-400">
            Graphique du portefeuille (à venir)
          </div>
        </div>

        <div className="mt-10 rounded-2xl bg-slate-900 border border-slate-700 p-8">
          <h2 className="text-2xl font-bold text-white">
            Dernières Transactions
          </h2>

          <p className="text-slate-400 mt-4">
            Aucune transaction pour le moment.
          </p>
        </div>
      </main>
    </div>
  );
}