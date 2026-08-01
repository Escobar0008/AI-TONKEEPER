"use client";

import MobileSidebar from "./MobileSidebar";
import { Bell, Search, UserCircle } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur border-b border-slate-800">

      <div className="flex items-center justify-between px-4 md:px-8 h-16">

        <div className="flex items-center gap-4">

          <MobileSidebar />

          <div>
            <h1 className="text-white text-xl font-bold">
              Welcome 👋
            </h1>

            <p className="text-slate-400 text-sm">
              AI TONKEEPER
            </p>
          </div>

        </div>

        <div className="flex items-center gap-4">

          <button className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800">
            <Search size={20} className="text-white" />
          </button>

          <button className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800">
            <Bell size={20} className="text-white" />

            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <button className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-500">
            <UserCircle size={24} className="text-slate-950" />
          </button>

        </div>

      </div>

    </header>
  );
}