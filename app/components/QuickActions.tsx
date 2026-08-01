"use client";

import Link from "next/link";
import {
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Bot,
} from "lucide-react";

const actions = [
  {
    title: "Buy TON",
    href: "/buy-ton",
    icon: CreditCard,
    color: "from-cyan-500 to-blue-600",
  },
  {
    title: "Deposit",
    href: "/deposit",
    icon: ArrowDownLeft,
    color: "from-green-500 to-emerald-600",
  },
  {
    title: "Withdraw",
    href: "/withdraw",
    icon: ArrowUpRight,
    color: "from-orange-500 to-red-500",
  },
  {
    title: "AI Trading",
    href: "/ai-trading",
    icon: Bot,
    color: "from-purple-500 to-indigo-600",
  },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-8">

      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <Link
            key={action.title}
            href={action.href}
            className={`rounded-3xl bg-gradient-to-r ${action.color} p-6 text-white shadow-xl hover:scale-105 transition duration-300`}
          >
            <Icon size={34} />

            <h3 className="mt-5 text-xl font-bold">
              {action.title}
            </h3>

            <p className="mt-2 text-sm text-white/80">
              Open
            </p>

          </Link>
        );
      })}

    </div>
  );
}