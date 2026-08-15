"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Search,
  Filter,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  CreditCard,
  Bot,
  Clock3,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from "lucide-react";

type Transaction = {
  id: string;
  coin: string;
  type: string;
  amount: number;
  fee: number;
  status: string;
  createdAt: string;
};

type Summary = {
  total: number;
  deposits: number;
  withdrawals: number;
  swaps: number;
  buys: number;
  aiTrades: number;
};

type FilterType =
  | "ALL"
  | "DEPOSIT"
  | "WITHDRAW"
  | "SWAP"
  | "BUY"
  | "AI_TRADE";

const FILTERS: {
  value: FilterType;
  label: string;
}[] = [
  { value: "ALL", label: "All" },
  { value: "DEPOSIT", label: "Deposit" },
  { value: "WITHDRAW", label: "Withdraw" },
  { value: "SWAP", label: "Swap" },
  { value: "BUY", label: "Buy" },
  { value: "AI_TRADE", label: "AI Trade" },
];

function formatDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAmount(amount: number) {
  if (!Number.isFinite(amount)) {
    return "0";
  }

  return amount.toLocaleString("en-US", {
    maximumFractionDigits: 8,
  });
}

function getTransactionTitle(transaction: Transaction) {
  switch (transaction.type) {
    case "DEPOSIT":
      return `Deposit ${transaction.coin}`;

    case "WITHDRAW":
      return `Withdraw ${transaction.coin}`;

    case "SWAP":
      return `Swap ${transaction.coin}`;

    case "BUY":
      return `Buy ${transaction.coin}`;

    case "AI_TRADE":
      return `AI Trading ${transaction.coin}`;

    default:
      return `${transaction.type} ${transaction.coin}`;
  }
}

function getTransactionIcon(type: string) {
  switch (type) {
    case "DEPOSIT":
      return ArrowDownLeft;

    case "WITHDRAW":
      return ArrowUpRight;

    case "SWAP":
      return RefreshCw;

    case "BUY":
      return CreditCard;

    case "AI_TRADE":
      return Bot;

    default:
      return Wallet;
  }
}

function getIconContainerClass(type: string) {
  switch (type) {
    case "DEPOSIT":
      return "bg-green-500/10 text-green-400";

    case "WITHDRAW":
      return "bg-red-500/10 text-red-400";

    case "SWAP":
      return "bg-cyan-500/10 text-cyan-400";

    case "BUY":
      return "bg-blue-500/10 text-blue-400";

    case "AI_TRADE":
      return "bg-purple-500/10 text-purple-400";

    default:
      return "bg-slate-500/10 text-slate-400";
  }
}

function getAmountClass(type: string) {
  if (type === "DEPOSIT" || type === "BUY") {
    return "text-green-400";
  }

  if (type === "WITHDRAW") {
    return "text-red-400";
  }

  return "text-white";
}

function getStatusConfig(status: string) {
  switch (status) {
    case "COMPLETED":
      return {
        label: "Completed",
        className: "bg-green-500/10 text-green-400",
        icon: CheckCircle2,
      };

    case "PENDING":
      return {
        label: "Pending",
        className: "bg-yellow-500/10 text-yellow-400",
        icon: Clock3,
      };

    case "PROCESSING":
      return {
        label: "Processing",
        className: "bg-blue-500/10 text-blue-400",
        icon: RefreshCw,
      };

    case "FAILED":
      return {
        label: "Failed",
        className: "bg-red-500/10 text-red-400",
        icon: XCircle,
      };

    default:
      return {
        label: status,
        className: "bg-slate-500/10 text-slate-400",
        icon: Clock3,
      };
  }
}

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary>({
    total: 0,
    deposits: 0,
    withdrawals: 0,
    swaps: 0,
    buys: 0,
    aiTrades: 0,
  });

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] =
    useState<FilterType>("ALL");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadHistory() {
    try {
      setError("");

      const response = await fetch("/api/history", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Unable to retrieve transaction history.",
        );
      }

      setTransactions(
        Array.isArray(data.transactions)
          ? data.transactions
          : [],
      );

      if (data.summary) {
        setSummary({
          total: Number(data.summary.total) || 0,
          deposits: Number(data.summary.deposits) || 0,
          withdrawals: Number(data.summary.withdrawals) || 0,
          swaps: Number(data.summary.swaps) || 0,
          buys: Number(data.summary.buys) || 0,
          aiTrades: Number(data.summary.aiTrades) || 0,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to retrieve transaction history.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  function handleRefresh() {
    setRefreshing(true);
    loadHistory();
  }

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesFilter =
        activeFilter === "ALL" ||
        transaction.type === activeFilter;

      if (!matchesFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableText = [
        transaction.id,
        transaction.coin,
        transaction.type,
        transaction.status,
        String(transaction.amount),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [transactions, search, activeFilter]);

  return (
    <main className="min-h-screen bg-[#050B18] text-white">
      <div className="max-w-md mx-auto px-5 py-6 pb-28">

        {/* Header */}

        <div className="flex items-center justify-between mb-8">

          <button
            type="button"
            className="w-12 h-12 rounded-2xl bg-[#101A2C] border border-slate-800 flex items-center justify-center" onClick={() => window.history.back()}>
    <ArrowLeft size={22} />
  </button>

          <div className="text-center">

            <h1 className="text-2xl font-bold">
              Transaction History
            </h1>

            <p className="text-sm text-slate-400 mt-1">
              View all wallet activities
            </p>

          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-12 h-12 rounded-2xl bg-[#101A2C] border border-slate-800 flex items-center justify-center"
          >
            <Filter
              size={20}
              className={refreshing ? "animate-spin" : ""}
            />
          </button>

        </div>

        {/* Search */}

        <div className="relative mb-6">

          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search transaction..."
            className="w-full rounded-2xl border border-slate-800 bg-[#101A2C] py-4 pl-12 pr-4 outline-none focus:border-cyan-500"
          />

        </div>

        {/* Error */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Summary */}

        <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-slate-400 text-sm">
                Total Transactions
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {loading ? "..." : summary.total}
              </h2>

            </div>

            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center">

              <Wallet
                size={32}
                className="text-cyan-400"
              />

            </div>

          </div>

          <div className="mt-5 h-2 rounded-full bg-[#050B18] overflow-hidden">

            <div
              className="h-full rounded-full bg-cyan-500 transition-all"
              style={{
                width:
                  summary.total > 0
                    ? "100%"
                    : "0%",
              }}
            />

          </div>

          <p className="mt-3 text-sm text-slate-400">
            {summary.total > 0
              ? `${summary.total} transaction${
                  summary.total === 1 ? "" : "s"
                } recorded in your wallet.`
              : "Your transaction history will appear here after your first operation."}
          </p>

        </div>

        {/* Quick Filters */}

        <div className="flex gap-3 overflow-x-auto py-5 scrollbar-hide">

          {FILTERS.map((filter) => {
            const active =
              activeFilter === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() =>
                  setActiveFilter(filter.value)
                }
                className={
                  active
                    ? "whitespace-nowrap rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-black"
                    : "whitespace-nowrap rounded-2xl border border-slate-700 bg-[#101A2C] px-5 py-3"
                }
              >
                {filter.label}
              </button>
            );
          })}

        </div>

        {/* Recent Transactions */}

        <div className="mt-2">

          <div className="flex items-center justify-between mb-4">

            <h2 className="text-xl font-bold">
              Recent Transactions
            </h2>

            <span className="text-cyan-400 text-sm">
              {filteredTransactions.length}
            </span>

          </div>

          {/* Loading */}

          {loading && (
            <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-6 text-center text-slate-400">
              <RefreshCw
                size={28}
                className="mx-auto mb-3 animate-spin text-cyan-400"
              />

              Loading transaction history...
            </div>
          )}

          {/* Empty */}

          {!loading &&
            filteredTransactions.length === 0 && (
              <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-8 text-center">

                <Wallet
                  size={42}
                  className="mx-auto mb-4 text-slate-600"
                />

                <h3 className="font-bold text-lg">
                  No transactions found
                </h3>

                <p className="text-sm text-slate-400 mt-2">
                  {search || activeFilter !== "ALL"
                    ? "Try another search or filter."
                    : "Your real wallet transactions will appear here."}
                </p>

              </div>
            )}

          {/* Transactions */}

          {!loading &&
            filteredTransactions.map((transaction) => {
              const Icon = getTransactionIcon(
                transaction.type,
              );

              const status =
                getStatusConfig(transaction.status);

              const StatusIcon = status.icon;

              const amountClass =
                getAmountClass(transaction.type);

              const isNegative =
                transaction.type === "WITHDRAW";

              return (
                <div
                  key={transaction.id}
                  className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5 mb-4"
                >

                  <div className="flex items-center justify-between gap-4">

                    <div className="flex items-center gap-4 min-w-0">

                      <div
                        className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center ${getIconContainerClass(
                          transaction.type,
                        )}`}
                      >
                        <Icon size={26} />
                      </div>

                      <div className="min-w-0">

                        <h3 className="font-bold truncate">
                          {getTransactionTitle(
                            transaction,
                          )}
                        </h3>

                        <p className="text-sm text-slate-400 mt-1">
                          {formatDate(
                            transaction.createdAt,
                          )}
                        </p>

                      </div>

                    </div>

                    <div className="text-right shrink-0">

                      <p
                        className={`font-bold ${amountClass}`}
                      >
                        {isNegative ? "-" : "+"}
                        {formatAmount(
                          transaction.amount,
                        )}{" "}
                        {transaction.coin}
                      </p>

                      <div
                        className={`mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 ${status.className}`}
                      >

                        <StatusIcon
                          size={14}
                          className={
                            transaction.status ===
                            "PROCESSING"
                              ? "animate-spin"
                              : ""
                          }
                        />

                        <span className="text-xs">
                          {status.label}
                        </span>

                      </div>

                    </div>

                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">

                    <span>
                      ID: {transaction.id}
                    </span>

                    <ChevronRight size={15} />

                  </div>

                </div>
              );
            })}

        </div>

        {/* History Summary */}

        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold mb-5">
            History Summary
          </h2>

          <div className="space-y-4">

            <div className="flex items-center justify-between">
              <span className="text-slate-400">
                Deposits
              </span>

              <span className="font-semibold">
                {summary.deposits}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">
                Withdrawals
              </span>

              <span className="font-semibold">
                {summary.withdrawals}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">
                Swaps
              </span>

              <span className="font-semibold">
                {summary.swaps}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">
                Buy Orders
              </span>

              <span className="font-semibold">
                {summary.buys}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">
                AI Trades
              </span>

              <span className="font-semibold">
                {summary.aiTrades}
              </span>
            </div>

          </div>

        </div>

        {/* Refresh */}

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="mt-8 w-full rounded-3xl bg-cyan-500 py-5 font-bold text-black hover:bg-cyan-400 transition disabled:opacity-50"
        >

          <span className="inline-flex items-center justify-center gap-2">

            <RefreshCw
              size={20}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh History"}

          </span>

        </button>

      </div>
    </main>
  );
}
