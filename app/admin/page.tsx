"use client";
import Link from "next/link";
import {
  Shield,
  ArrowLeft,
  FileCheck,
  Send,
  ArrowLeftRight,
  Wallet,
  Users,
  Bot,
  Activity,
  Settings,
  ChevronRight,
} from "lucide-react";
const adminModules = [
  {
    title: "KYC Management",
    description: "Review and manage user KYC applications.",
    href: "/admin/kyc",
    icon: FileCheck,
    color: "text-cyan-400",
    bg: "bg-cyan-500/20",
    button: "bg-cyan-500 hover:bg-cyan-400 text-black",
    status: "ACTIVE",
  },
  {
    title: "Admin Send",
    description: "Manage and process administrator send operations.",
    href: "/admin/send",
    icon: Send,
    color: "text-green-400",
    bg: "bg-green-500/20",
    button: "bg-green-500 hover:bg-green-400 text-black",
    status: "ACTIVE",
  },
  {
    title: "Admin Swap",
    description: "Manage platform swap requests.",
    href: "/admin/swap",
    icon: ArrowLeftRight,
    color: "text-purple-400",
    bg: "bg-purple-500/20",
    button: "bg-purple-600 hover:bg-purple-500 text-white",
    status: "ACTIVE",
  },
];
const plannedModules = [
  {
    title: "Users",
    description: "User management and account administration.",
    icon: Users,
  },
  {
    title: "Withdrawals",
    description: "Withdrawal request management.",
    icon: Wallet,
  },
  {
    title: "AI Trading",
    description: "Administrator monitoring of AI Trading.",
    icon: Bot,
  },
  {
    title: "System Logs",
    description: "Platform activity and security logs.",
    icon: Activity,
  },
  {
    title: "Platform Settings",
    description: "Global AI TONKEEPER configuration.",
    icon: Settings,
  },
];
export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#050B18] text-white">
      <div className="mx-auto max-w-md px-5 py-6 pb-12">
        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-[#101A2C] transition hover:border-cyan-500"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-gray-400">AI TONKEEPER Control Center</p>
          </div>
          <Shield className="text-cyan-400" size={25} />
        </div>
        {/* ADMIN STATUS */}
        <div className="mb-6 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">
          <div className="mb-3 flex items-center gap-3">
            <Shield size={34} />
            <div>
              <h2 className="text-xl font-bold">Administrator</h2>
              <p className="text-sm text-cyan-100">Full platform management</p>
            </div>
          </div>
          <p className="text-sm leading-6 text-cyan-50">
            Central control panel for AI TONKEEPER administration, KYC, wallet
            operations, swaps and platform management.
          </p>
          <div className="mt-4 inline-flex rounded-full bg-black/20 px-4 py-2 text-xs font-bold text-green-300">
            ● ADMIN ACCESS ACTIVE
          </div>
        </div>
        {/* ACTIVE ADMIN MODULES */}
        <section className="mb-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold">Admin Modules</h2>
            <p className="mt-1 text-sm text-gray-400">
              Available administrator tools
            </p>
          </div>
          <div className="space-y-4">
            {adminModules.map((module) => {
              const Icon = module.icon;
              return (
                <Link
                  key={module.title}
                  href={module.href}
                  className="block rounded-3xl border border-slate-800 bg-[#101A2C] p-5 transition hover:border-cyan-500"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${module.bg}`}
                    >
                      <Icon size={25} className={module.color} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold">{module.title}</h3>
                        <span className="text-[10px] font-bold text-green-400">
                          {module.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-400">
                        {module.description}
                      </p>
                    </div>
                    <ChevronRight size={21} className="text-gray-500" />
                  </div>
                  <div
                    className={`mt-4 rounded-2xl px-4 py-3 text-center text-sm font-bold ${module.button}`}
                  >
                    Open {module.title}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
        {/* USER MANAGEMENT */}
        <section className="mb-6 rounded-3xl border border-cyan-500/30 bg-[#101A2C] p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20">
              <Users size={25} className="text-cyan-400" />
            </div>

            <div>
              <h2 className="text-xl font-bold">User Management</h2>

              <p className="text-sm text-gray-400">
                View and manage AI TONKEEPER users.
              </p>
            </div>
          </div>

          <Link
            href="/admin/users"
            className="flex w-full items-center justify-between rounded-2xl bg-cyan-500 px-5 py-4 font-bold text-black transition hover:bg-cyan-400"
          >
            <span>Open User Management</span>
            <ChevronRight size={21} />
          </Link>
        </section>
        {/* OTHER ADMIN SYSTEMS */}
        <section className="mb-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold">Platform Management</h2>
            <p className="mt-1 text-sm text-gray-400">
              Administration modules to be connected
            </p>
          </div>
          <div className="space-y-3">
            {plannedModules.map((module) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.title}
                  className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-[#101A2C] p-4"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B1220]">
                    <Icon size={22} className="text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{module.title}</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      {module.description}
                    </p>
                  </div>
                  <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-[10px] font-bold text-yellow-400">
                    TO CONNECT
                  </span>
                </div>
              );
            })}
          </div>
        </section>
        {/* SECURITY */}
        <section className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">
          <div className="flex items-center gap-3">
            <Shield size={23} className="text-cyan-400" />
            <div>
              <h2 className="font-bold">Administrator Security</h2>
              <p className="text-xs text-gray-500">Administrator access only</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#0B1220] p-4">
            <span className="text-sm text-gray-400">Access protection</span>
            <span className="font-bold text-green-400">ACTIVE</span>
          </div>
        </section>
        {/* FOOTER */}
        <footer className="mt-8 border-t border-slate-800 pt-6 text-center">
          <p className="text-sm text-slate-500">AI TONKEEPER Admin Panel</p>
          <p className="mt-2 font-semibold text-cyan-400">ai-tonkeeper.xyz</p>
          <p className="mt-4 text-xs text-slate-600">
            © 2026 AI TONKEEPER. Administrator Access Only.
          </p>
        </footer>
      </div>
    </main>
  );
}
