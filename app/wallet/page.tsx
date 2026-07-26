"use client";
import { useState } from "react";
import { TonConnectButton, useTonWallet } from "@tonconnect/ui-react";
import Sidebar from "../components/Sidebar";

export default function WalletPage() {
  const wallet = useTonWallet();
const [openMenu, setOpenMenu] = useState(false);
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">

      <Sidebar />

      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">

        <div className="flex items-center justify-between">

  <div>
    <h1 className="text-2xl md:text-4xl font-bold text-white">
      AI TONKEEPER
    </h1>

    <p className="text-blue-200 mt-2 text-sm md:text-base">
      Your secure TON wallet with AI assistant.
    </p>
  </div>

  <div className="relative flex items-center gap-3">

  <TonConnectButton />

  <button
    onClick={() => setOpenMenu(!openMenu)}
    className="text-white text-3xl px-2"
  >
    ⋮
  </button>

  {openMenu && (
    <div className="absolute right-0 top-12 w-48 rounded-xl bg-slate-900 border border-slate-700 p-3 z-50">

      <a
href="/wallet"
className="block w-full text-left text-white p-2 hover:bg-slate-800 rounded"
>
Wallet
</a>

<a
href="/nfts"
className="block w-full text-left text-white p-2 hover:bg-slate-800 rounded"
>
NFTs
</a>

<a
href="/ai-assistant"
className="block w-full text-left text-white p-2 hover:bg-slate-800 rounded"
>
AI Assistant
</a>

<a
href="/profile"
className="block w-full text-left text-white p-2 hover:bg-slate-800 rounded"
>
Profile
</a>

<a
href="/settings"
className="block w-full text-left text-white p-2 hover:bg-slate-800 rounded"
>
Settings
</a>

    </div>
  )}

</div>

</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

  {/* Balance */}

<div className="rounded-2xl bg-slate-900 border border-slate-700 p-4">

  <p className="text-slate-400 text-sm">
    Balance
  </p>

  <h2 className="text-2xl md:text-3xl font-bold text-cyan-400 mt-2">
    {wallet ? "0 TON" : "Connect Wallet"}
  </h2>

  <div className="flex gap-3 mt-4">

    <button className="flex-1 bg-cyan-500 text-slate-900 font-bold py-2 rounded-xl">
      Deposit
    </button>

    <button className="flex-1 bg-slate-700 text-white font-bold py-2 rounded-xl">
      Withdraw
    </button>

  </div>

</div>

  {/* Transactions */}

<div className="rounded-2xl bg-slate-900 border border-slate-700 p-4">

  <p className="text-slate-400 text-sm">
    Transactions
  </p>


  <div className="mt-4 space-y-3">


    <div className="flex items-center justify-between bg-slate-800 rounded-xl p-3">

      <div>
        <p className="text-green-400 font-semibold">
          ↓ Deposit
        </p>

        <p className="text-slate-400 text-sm">
          No transactions yet
        </p>
      </div>

      <p className="text-white font-bold">
        0 TON
      </p>

    </div>


    <div className="flex items-center justify-between bg-slate-800 rounded-xl p-3">

      <div>
        <p className="text-red-400 font-semibold">
          ↑ Withdraw
        </p>

        <p className="text-slate-400 text-sm">
          No withdrawals yet
        </p>
      </div>

      <p className="text-white font-bold">
        0 TON
      </p>

    </div>


  </div>

</div>

</div>

        <div className="mt-8 rounded-2xl bg-slate-900 border border-slate-700 p-5">

  <h2 className="text-xl font-bold text-white">
    Wallet Status
  </h2>


  {wallet ? (

    <div className="mt-4 space-y-4">


      <div className="flex items-center gap-3">

        <span className="w-3 h-3 bg-green-400 rounded-full"></span>

        <p className="text-green-400 font-semibold">
          Wallet Connected
        </p>

      </div>


      <div className="bg-slate-800 rounded-xl p-4">

        <p className="text-slate-400 text-sm">
          Wallet Address
        </p>

        <p className="text-white text-sm break-all mt-2">
          {wallet.account.address}
        </p>

      </div>


      <div className="bg-slate-800 rounded-xl p-3">

        <p className="text-slate-400 text-sm">
          Network
        </p>

        <p className="text-white mt-1">
          {wallet.account.chain}
        </p>

      </div>


    </div>


  ) : (


    <p className="text-slate-400 mt-4">
      No wallet connected.
    </p>


  )}


</div>

        <div className="mt-6 rounded-2xl bg-slate-900 border border-slate-700 p-5">

  <h2 className="text-xl md:text-2xl font-bold text-white">
    Recent Activity
  </h2>

  <p className="text-slate-400 mt-3 text-sm">
    No transactions yet.
  </p>

</div>

      </main>

    </div>
  );
}