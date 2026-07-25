"use client";

import { TonConnectButton, useTonWallet } from "@tonconnect/ui-react";
import Sidebar from "../components/Sidebar";

export default function WalletPage() {
  const wallet = useTonWallet();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">

      <Sidebar />

      <main className="flex-1 p-8">

        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-5xl font-bold text-white">
              TON Wallet
            </h1>

            <p className="text-blue-200 mt-2">
              Connect your wallet and manage your assets securely.
            </p>
          </div>

          <TonConnectButton />
        </div>

        <div className="grid grid-cols-3 gap-6 mt-10">

          <div className="rounded-2xl bg-slate-900 border border-slate-700 p-6">
            <p className="text-slate-400">
              Balance
            </p>

            <h2 className="text-4xl font-bold text-cyan-400 mt-3">
              {wallet ? "Loading..." : "0 TON"}
            </h2>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-700 p-6">
            <p className="text-slate-400">
              NFTs
            </p>

            <h2 className="text-4xl font-bold text-white mt-3">
              0
            </h2>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-700 p-6">
            <p className="text-slate-400">
              Transactions
            </p>

            <h2 className="text-4xl font-bold text-white mt-3">
              0
            </h2>
          </div>

        </div>

        <div className="mt-10 rounded-2xl bg-slate-900 border border-slate-700 p-8">

          <h2 className="text-2xl font-bold text-white">
            Wallet Status
          </h2>

          {wallet ? (

            <div className="mt-6 space-y-3">

              <p className="text-green-400 font-semibold">
                ✅ Wallet Connected
              </p>

              <p className="text-slate-300 break-all">
                {wallet.account.address}
              </p>

              <p className="text-slate-400">
                Chain : {wallet.account.chain}
              </p>

            </div>

          ) : (

            <div className="mt-6">

              <p className="text-slate-400">
                No wallet connected.
              </p>

            </div>

          )}

        </div>

        <div className="mt-10 rounded-2xl bg-slate-900 border border-slate-700 p-8">

          <h2 className="text-2xl font-bold text-white">
            Recent Activity
          </h2>

          <p className="text-slate-400 mt-5">
            No activity yet.
          </p>

        </div>

      </main>

    </div>
  );
}