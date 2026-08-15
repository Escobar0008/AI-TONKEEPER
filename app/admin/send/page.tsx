"use client";

import { useEffect, useState } from "react";

type SendRequest = {
  id: string;
  coin: string;
  amount: number;
  fee: number;
  address: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

export default function AdminSendPage() {
  const [requests, setRequests] = useState<SendRequest[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [processing, setProcessing] = useState("");

  async function loadRequests() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/send", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to load Send requests.");
      }

      setRequests(data.requests || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load Send requests.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function handleAction(sendId: string, action: "APPROVE" | "REJECT") {
    try {
      setProcessing(sendId);
      setError("");

      const response = await fetch("/api/admin/send", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sendId,
          action,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to process Send request.");
      }

      await loadRequests();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to process Send request.",
      );
    } finally {
      setProcessing("");
    }
  }

  return (
    <main className="min-h-screen bg-[#050B18] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Send</h1>

            <p className="text-slate-400 mt-1">Manage user Send requests</p>
          </div>

          <button
            type="button"
            onClick={loadRequests}
            className="rounded-xl bg-[#101A2C] border border-slate-800 px-4 py-3 hover:border-cyan-500"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl bg-[#101A2C] border border-slate-800 p-6 text-slate-400">
            Loading Send requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-2xl bg-[#101A2C] border border-slate-800 p-8 text-center">
            <p className="text-lg font-semibold">No Send requests</p>

            <p className="text-slate-400 mt-2">
              There are currently no Send requests.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-[#101A2C] border border-slate-800 p-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold">
                        {item.amount} {item.coin}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.status === "PENDING"
                            ? "bg-yellow-500/10 text-yellow-400"
                            : item.status === "APPROVED"
                              ? "bg-cyan-500/10 text-cyan-400"
                              : item.status === "REJECTED"
                                ? "bg-red-500/10 text-red-400"
                                : item.status === "SENT"
                                  ? "bg-green-500/10 text-green-400"
                                  : "bg-slate-500/10 text-slate-400"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <p className="text-sm text-slate-400">
                      User:{" "}
                      <span className="text-white">
                        {item.user.name || item.user.email}
                      </span>
                    </p>

                    <p className="text-sm text-slate-400">
                      Email:{" "}
                      <span className="text-white">{item.user.email}</span>
                    </p>

                    <p className="text-sm text-slate-400">
                      Fee:{" "}
                      <span className="text-white">
                        {item.fee} {item.coin}
                      </span>
                    </p>

                    <p className="text-sm text-slate-400 break-all">
                      Recipient:{" "}
                      <span className="text-white">{item.address}</span>
                    </p>

                    <p className="text-xs text-slate-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {item.status === "PENDING" && (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        disabled={processing === item.id}
                        onClick={() => handleAction(item.id, "REJECT")}
                        className="rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-3 font-semibold text-red-400 hover:bg-red-500/20 disabled:opacity-40"
                      >
                        Reject
                      </button>

                      <button
                        type="button"
                        disabled={processing === item.id}
                        onClick={() => handleAction(item.id, "APPROVE")}
                        className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 font-semibold hover:opacity-90 disabled:opacity-40"
                      >
                        {processing === item.id ? "Processing..." : "Approve"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
