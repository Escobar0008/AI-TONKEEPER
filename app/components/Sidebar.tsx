"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  ImageIcon,
  ArrowLeftRight,
  Bot,
  LineChart,
  Settings,
  User,
  Menu,
  X,
} from "lucide-react";

const menu = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Wallet", href: "/wallet", icon: Wallet },
  { name: "NFTs", href: "/nfts", icon: ImageIcon },
  { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { name: "AI Assistant", href: "/ai", icon: Bot },
  { name: "Analyse Wallet", href: "/analysis", icon: LineChart },
  { name: "Profil", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Bouton Mobile */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden bg-cyan-500 p-2 rounded-xl"
      >
        <Menu className="text-white" size={24} />
      </button>

      {/* Fond sombre */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static
          top-0 left-0
          z-50
          h-screen
          w-72
          bg-slate-950
          border-r
          border-slate-800
          text-white
          transform
          transition-transform
          duration-300
          ${
            open ? "translate-x-0" : "-translate-x-full"
          }
          md:translate-x-0
        `}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-800">

          <div>

            <h1 className="text-3xl font-bold text-cyan-400">
              AI TONKEEPER
            </h1>

            <p className="text-sm text-slate-400 mt-2">
              Analyse IA + Portefeuille TON
            </p>

          </div>

          <button
            onClick={() => setOpen(false)}
            className="md:hidden"
          >
            <X size={26} />
          </button>

        </div>

        <nav className="p-4 space-y-2">

          {menu.map((item) => {

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                  pathname === item.href
                    ? "bg-cyan-500 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );

          })}

        </nav>

      </aside>
    </>
  );
}