"use client";

export default function PortfolioChart() {
  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold text-white">
            Portfolio Performance
          </h2>

          <p className="text-slate-400 mt-1">
            Last 30 Days
          </p>

        </div>

        <div className="text-right">

          <p className="text-green-400 text-xl font-bold">
            +0.00%
          </p>

          <p className="text-slate-500 text-sm">
            Profit
          </p>

        </div>

      </div>

      <div className="mt-8 h-72 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-800 border border-cyan-500/20 flex items-center justify-center">

        <div className="text-center">

          <div className="text-6xl">
            📈
          </div>

          <h3 className="text-cyan-400 font-bold text-xl mt-4">
            Portfolio Chart
          </h3>

          <p className="text-slate-500 mt-2">
            Live TON performance graph
          </p>

        </div>

      </div>

    </div>
  );
}