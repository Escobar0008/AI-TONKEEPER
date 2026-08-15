"use client";

import { useEffect, useState } from "react";

type SwapRequest = {
  id: string;
  fromCoin: string;
  toCoin: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  fee: number;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

export default function AdminSwapPage() {
  const [requests, setRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState("");

  async function loadRequests() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/swap", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to load Swap requests.");
      }

      setRequests(data.requests || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load Swap requests.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function handleAction(swapId: string, action: "APPROVE" | "REJECT") {
    try {
      setProcessing(swapId);
      setError("");

      const response = await fetch("/api/admin/swap", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          swapId,
          action,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to process Swap request.");
      }

      await loadRequests();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to process Swap request.",
      );
    } finally {
      setProcessing("");
    }
  }

  function formatAmount(value: number) {
    return Number(value).toLocaleString("en-US", {
      maximumFractionDigits: 12,
    });
  }

  function formatRate(value: number) {
    return Number(value).toLocaleString("en-US", {
      maximumFractionDigits: 12,
    });
  }

  function getStatusClass(status: string) {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-400";

      case "APPROVED":
        return "bg-cyan-500/10 text-cyan-400";

      case "PROCESSING":
        return "bg-blue-500/10 text-blue-400";

      case "COMPLETED":
        return "bg-green-500/10 text-green-400";

      case "REJECTED":
        return "bg-red-500/10 text-red-400";

      default:
        return "bg-slate-500/10 text-slate-400";
    }
  }

  return (
    <main className="min-h-screen bg-[#050B18] text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Swap</h1>

            <p className="text-slate-400 mt-1">Manage user Swap requests</p>
          </div>

          <button
            type="button"
            onClick={loadRequests}
            disabled={loading}
            className="rounded-xl bg-[#101A2C] border border-slate-800 px-5 py-3 font-semibold hover:border-cyan-500 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Error */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Loading */}

        {loading ? (
          <div className="rounded-2xl bg-[#101A2C] border border-slate-800 p-6 text-slate-400">
            Loading Swap requests...
          </div>
        ) : requests.length === 0 ? (
          /* Empty */

          <div className="rounded-2xl bg-[#101A2C] border border-slate-800 p-8 text-center">
            <p className="text-lg font-semibold">No Swap requests</p>

            <p className="text-slate-400 mt-2">
              There are currently no Swap requests.
            </p>
          </div>
        ) : (
          /* Requests */

          <div className="space-y-4">
            {requests.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-[#101A2C] border border-slate-800 p-5"
              >
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                  {/* Swap Information */}

                  <div className="space-y-3 min-w-0">
                    {/* Pair + Status */}

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xl font-bold">
                        {item.fromCoin} → {item.toCoin}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                          item.status,
                        )}`}
                      >
                        {item.status}
                      </span>
                    </div>

                    {/* User */}

                    <p className="text-sm text-slate-400">
                      User:{" "}
                      <span className="text-white">
                        {item.user.name || item.user.email}
                      </span>
                    </p>

                    {/* Email */}

                    <p className="text-sm text-slate-400">
                      Email:{" "}
                      <span className="text-white">{item.user.email}</span>
                    </p>

                    {/* From */}

                    <p className="text-sm text-slate-400">
                      From:{" "}
                      <span className="text-white font-semibold">
                        {formatAmount(item.fromAmount)} {item.fromCoin}
                      </span>
                    </p>

                    {/* To */}

                    <p className="text-sm text-slate-400">
                      To:{" "}
                      <span className="text-white font-semibold">
                        {formatAmount(item.toAmount)} {item.toCoin}
                      </span>
                    </p>

                    {/* Rate */}

                    <p className="text-sm text-slate-400">
                      Rate:{" "}
                      <span className="text-white">
                        1 {item.fromCoin} ≈ {formatRate(item.rate)}{" "}
                        {item.toCoin}
                      </span>
                    </p>

                    {/* Fee */}

                    <p className="text-sm text-slate-400">
                      Fee:{" "}
                      <span className="text-white">
                        {formatAmount(item.fee)} {item.fromCoin}
                      </span>
                    </p>

                    {/* Date */}

                    <p className="text-xs text-slate-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>

                    {/* ID */}

                    <p className="text-xs text-slate-600 break-all">
                      Request ID: {item.id}
                    </p>
                  </div>

                  {/* Actions */}

                  {item.status === "PENDING" && (
                    <div className="flex flex-col sm:flex-row xl:flex-col gap-3 shrink-0">
                      <button
                        type="button"
                        disabled={processing === item.id}
                        onClick={() => handleAction(item.id, "REJECT")}
                        className="rounded-xl border border-red-500/40 bg-red-500/10 px-6 py-3 font-semibold text-red-400 hover:bg-red-500/20 disabled:opacity-40"
                      >
                        Reject
                      </button>

                      <button
                        type="button"
                        disabled={processing === item.id}
                        onClick={() => handleAction(item.id, "APPROVE")}
                        className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-semibold hover:opacity-90 disabled:opacity-40"
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
