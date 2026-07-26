"use client";

import Sidebar from "../components/Sidebar";

export default function AIAssistantPage() {

  return (

    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">

      <Sidebar />


      <main className="flex-1 p-4 md:p-8">


        <h1 className="text-3xl md:text-5xl font-bold text-white">
          AI Assistant
        </h1>


        <p className="text-blue-200 mt-3">
          Your intelligent TON wallet assistant.
        </p>



        <div className="mt-8 rounded-2xl bg-slate-900 border border-slate-700 p-6">


          <h2 className="text-xl md:text-2xl font-bold text-white">
            AI TONKEEPER Assistant
          </h2>


          <p className="text-slate-400 mt-3">
            Ask AI about your wallet, transactions, security and TON ecosystem.
          </p>



          <div className="mt-6">


            <textarea
              placeholder="Ask AI something..."
              className="w-full h-32 rounded-xl bg-slate-800 border border-slate-700 p-4 text-white outline-none"
            />


            <button
              className="mt-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-6 py-3 text-white font-bold"
            >
              Send Message
            </button>


          </div>


        </div>



        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">


          <div className="rounded-2xl bg-slate-900 border border-slate-700 p-5">

            <h3 className="text-white font-bold">
              Wallet Analysis
            </h3>

            <p className="text-slate-400 mt-2 text-sm">
              AI will analyze your TON wallet activity.
            </p>

          </div>



          <div className="rounded-2xl bg-slate-900 border border-slate-700 p-5">

            <h3 className="text-white font-bold">
              Security
            </h3>

            <p className="text-slate-400 mt-2 text-sm">
              AI security recommendations.
            </p>

          </div>



          <div className="rounded-2xl bg-slate-900 border border-slate-700 p-5">

            <h3 className="text-white font-bold">
              Trading Assistant
            </h3>

            <p className="text-slate-400 mt-2 text-sm">
              Future AI trading support.
            </p>

          </div>


        </div>


      </main>

    </div>

  );
}