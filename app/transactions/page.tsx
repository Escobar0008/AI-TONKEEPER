"use client";

import Sidebar from "../components/Sidebar";

const transactions = [
  {
    type: "Deposit",
    amount: "+50 TON",
    status: "Completed",
    date: "27/07/2026",
    color: "text-green-400",
  },
  {
    type: "Withdraw",
    amount: "-10 TON",
    status: "Pending",
    date: "27/07/2026",
    color: "text-yellow-400",
  },
  {
    type: "AI Trading",
    amount: "+2 TON",
    status: "Completed",
    date: "27/07/2026",
    color: "text-cyan-400",
  },
];


export default function TransactionsPage() {

  return (

    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">

      <Sidebar />


      <main className="flex-1 p-6 md:p-8 text-white">


        <h1 className="text-4xl font-bold">
          Transactions
        </h1>


        <p className="text-blue-200 mt-3">
          AI TONKEEPER transaction history.
        </p>




        <div className="mt-8 rounded-3xl bg-slate-900 border border-slate-700 p-6">


          <h2 className="text-2xl font-bold mb-6">
            Recent Activity
          </h2>



          <div className="space-y-4">


            {transactions.map((tx, index) => (

              <div
                key={index}
                className="flex flex-col md:flex-row md:items-center md:justify-between bg-slate-800 rounded-xl p-5"
              >


                <div>

                  <h3 className="text-xl font-bold">
                    {tx.type}
                  </h3>


                  <p className="text-slate-400">
                    {tx.date}
                  </p>


                </div>




                <div className="mt-3 md:mt-0 text-right">


                  <p className={`text-xl font-bold ${tx.color}`}>
                    {tx.amount}
                  </p>


                  <p className="text-slate-300">
                    {tx.status}
                  </p>


                </div>


              </div>


            ))}


          </div>


        </div>



      </main>


    </div>

  );
}