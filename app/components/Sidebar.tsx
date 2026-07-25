"use client";

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

  return (
    <aside className="w-72 min-h-screen bg-slate-950 border-r border-slate-800 text-white">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-3xl font-bold text-cyan-400">
          AI TONKEEPER
        </h1>

        <p className="text-sm text-slate-400 mt-2">
          Analyse IA + Portefeuille TON
        </p>
      </div>

      <nav className="p-4 space-y-2">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
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
  );
}