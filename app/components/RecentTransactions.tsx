"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Bot,
} from "lucide-react";

const transactions = [
  {
    id: 1,
    title: "TON Deposit",
    amount: "+0 TON",
    status: "Completed",
    icon: ArrowDownLeft,
    color: "text-green-400",
  },
  {
    id: 2,
    title: "AI Trading",
    amount: "+0 TON",
    status: "Running",
    icon: Bot,
    color: "text-cyan-400",
  },
  {
    id: 3,
    title: "Withdrawal",
    amount: "-0 TON",
    status: "Pending",
    icon: ArrowUpRight,
    color: "text-orange-400",
  },
];

export default function RecentTransactions() {
  return (
    <div className="mt-8 rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">

      <div className="flex items-center justify-between">

        <h2 className="text-2xl font-bold text-white">
          Recent Transactions
        </h2>

        <button className="text-cyan-400 hover:text-cyan-300">
          View All
        </button>

      </div>

      <div className="mt-6 space-y-4">

        {transactions.map((tx) => {

          const Icon = tx.icon;

          return (

            <div
              key={tx.id}
              className="flex items-center justify-between bg-slate-800 rounded-2xl p-4"
            >

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center">

                  <Icon className={tx.color} size={24} />

                </div>

                <div>

                  <h3 className="text-white font-semibold">
                    {tx.title}
                  </h3>

                  <p className="text-slate-400 text-sm">
                    {tx.status}
                  </p>

                </div>

              </div>

              <div className={`font-bold ${tx.color}`}>
                {tx.amount}
              </div>

            </div>

          );
        })}

      </div>

    </div>
  );
}