"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Shield, Users } from "lucide-react";

type AdminUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUsers() {
      try {
        const response = await fetch("/api/admin/users", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load users.");
        }

        setUsers(data.users ?? []);
      } catch (error) {
        console.error("ADMIN USERS ERROR:", error);

        setError(
          error instanceof Error ? error.message : "Unable to load users.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  return (
    <main className="min-h-screen bg-[#050B18] text-white">
      <div className="mx-auto max-w-md px-5 py-6 pb-12">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/admin"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-[#101A2C] hover:border-cyan-500"
          >
            <ArrowLeft size={20} />
          </Link>

          <div className="text-center">
            <h1 className="text-2xl font-bold">Users</h1>

            <p className="text-sm text-gray-400">User Management</p>
          </div>

          <Users size={25} className="text-cyan-400" />
        </div>

        <div className="mb-5 rounded-3xl border border-cyan-500/30 bg-[#101A2C] p-5">
          <div className="flex items-center gap-3">
            <Shield size={25} className="text-cyan-400" />

            <div>
              <h2 className="font-bold">Administrator Access</h2>

              <p className="text-xs text-gray-500">
                Protected Admin User Management
              </p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-6 text-center text-gray-400">
            Loading users...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-5 text-center text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-bold truncate">
                      {user.name || "Unnamed User"}
                    </h3>

                    <p className="mt-1 text-sm text-gray-400 break-all">
                      {user.email || "No email"}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold ${
                      user.role === "ADMIN"
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "bg-slate-700 text-gray-300"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>

                <div className="mt-4 border-t border-slate-800 pt-3">
                  <p className="text-[10px] text-gray-500">USER ID</p>

                  <p className="mt-1 break-all text-xs text-gray-400">
                    {user.id}
                  </p>
                </div>

                <p className="mt-3 text-xs text-gray-500">
                  Created: {new Date(user.createdAt).toLocaleString()}
                </p>
              </div>
            ))}

            {users.length === 0 && (
              <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-6 text-center text-gray-400">
                No users found.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
