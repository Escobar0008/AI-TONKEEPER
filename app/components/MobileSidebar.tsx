"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function MobileSidebar() {
  const [open, setOpen] = useState(false);

  const menu = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Wallet", href: "/wallet" },
    { name: "Buy TON", href: "/buy-ton" },
    { name: "Deposit", href: "/deposit" },
    { name: "Withdraw", href: "/withdraw" },
    { name: "Transactions", href: "/transactions" },
    { name: "AI Trading", href: "/ai-trading" },
    { name: "Analyse Wallet", href: "/analysis" },
    { name: "NFTs", href: "/nfts" },
    { name: "Referral", href: "/referral" },
    { name: "KYC", href: "/kyc" },
    { name: "Support", href: "/support" },
    { name: "Settings", href: "/settings" },
    { name: "Profile", href: "/profile" },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden p-2 rounded-lg bg-slate-900 text-white"
      >
        <Menu size={26} />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setOpen(false)}
          />

          <aside className="fixed left-0 top-0 h-full w-72 bg-slate-950 text-white z-50 shadow-2xl">

            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-2xl font-bold text-cyan-400">
                AI TONKEEPER
              </h2>

              <button onClick={() => setOpen(false)}>
                <X size={28} />
              </button>
            </div>

            <nav className="p-4 space-y-2">

              {menu.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 hover:bg-slate-800"
                >
                  {item.name}
                </Link>
              ))}

            </nav>

          </aside>
        </>
      )}
    </>
  );
}