"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import {
  ArrowUp,
  ArrowDown,
  RefreshCw,
  CreditCard,
  Bot,
  Bell,
  Clock3,
  Eye,
  Shield,
} from "lucide-react";

type DashboardUser = {
  id?: string | number;
  name?: string | null;
  role?: string | null;
};

type Balance = {
  coin: string;
  balance: string | number;
};

type Transaction = {
  id: string | number;
  type: string;
  coin: string;
  amount: string | number;
  createdAt: string;
};

type CryptoPrice = {
  success?: boolean;
  price?: string | number;
  [key: string]: unknown;
};

type Prices = Record<string, CryptoPrice>;

type DashboardResponse = {
  success?: boolean;
  user?: DashboardUser;
  balances?: Balance[];
  transactions?: Transaction[];
};

type NotificationsResponse = {
  success?: boolean;
  unreadCount?: number;
};

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<DashboardUser | null>(null);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<Prices>({});
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const tonBalance = Number(
    balances.find((balance) => balance.coin === "TON")?.balance ?? 0,
  );

  const totalBalanceUSD = balances.reduce((total, balance) => {
    const amount = Number(balance.balance ?? 0);
    const price = Number(prices[balance.coin]?.price ?? 0);

    return total + amount * price;
  }, 0);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        const response = await fetch("/api/dashboard");

        if (!response.ok) {
          throw new Error(`Dashboard HTTP ${response.status}`);
        }

        const data = (await response.json()) as DashboardResponse;

        if (!mounted) return;

        if (data.success) {
          setUser(data.user ?? null);
          setBalances(data.balances ?? []);
          setTransactions(data.transactions ?? []);
        }
      } catch (error) {
        console.error("DASHBOARD ERROR:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    async function loadNotifications() {
      try {
        const response = await fetch("/api/notifications?limit=1", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Notifications HTTP ${response.status}`);
        }

        const data = (await response.json()) as NotificationsResponse;

        if (!mounted) return;

        if (data.success) {
          setUnreadNotifications(Number(data.unreadCount ?? 0));
        }
      } catch (error) {
        console.error("NOTIFICATIONS ERROR:", error);
      }
    }

    async function loadPrices() {
      const coins = ["BTC", "ETH", "TON", "SOL", "BNB", "XRP"];

      const results = await Promise.allSettled(
        coins.map(async (coin) => {
          const response = await fetch(`/api/crypto?coin=${coin}`);

          if (!response.ok) {
            throw new Error(`${coin}: HTTP ${response.status}`);
          }

          const data = (await response.json()) as CryptoPrice;

          return {
            coin,
            data,
          };
        }),
      );

      if (!mounted) return;

      const priceMap: Prices = {};

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          const { coin, data } = result.value;

          if (data.success) {
            priceMap[coin] = data;
          }
        } else {
          console.warn("Crypto price unavailable:", result.reason);
        }
      });

      setPrices((previous) => ({
        ...previous,
        ...priceMap,
      }));
    }

    loadDashboard();
    loadNotifications();

    const initialPriceTimer = window.setTimeout(() => {
      loadPrices().catch((error) => {
        console.error("PRICE ERROR:", error);
      });
    }, 0);

    const priceInterval = window.setInterval(() => {
      loadPrices().catch((error) => {
        console.error("PRICE ERROR:", error);
      });
    }, 30000);

    const notificationInterval = window.setInterval(() => {
      loadNotifications().catch((error) => {
        console.error("NOTIFICATION REFRESH ERROR:", error);
      });
    }, 30000);

    return () => {
      mounted = false;

      window.clearTimeout(initialPriceTimer);

      window.clearInterval(priceInterval);

      window.clearInterval(notificationInterval);
    };
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050B18] flex items-center justify-center text-white">
        <p className="text-xl font-semibold">Loading Dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050B18] text-white pb-24">
      <div className="max-w-md mx-auto px-4 pt-5">
        {/* Header */}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="AI TONKEEPER" width={52} height={52} />

            <div>
              <h1 className="text-xl font-bold">
                {user?.name || "AI TONKEEPER"}
              </h1>

              <p className="text-sm text-purple-400 font-semibold">PREMIUM</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="w-11 h-11 rounded-full bg-[#101A2C] border border-slate-800 flex items-center justify-center"
            >
              <Clock3 size={20} />
            </button>

            {/* ADMIN DASHBOARD */}
            {user?.role === "ADMIN" && (
              <button
                type="button"
                onClick={() => router.push("/admin")}
                aria-label="Admin Dashboard"
                className="w-11 h-11 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/30 transition"
              >
                <Shield size={20} />
              </button>
            )}

            {/* Notifications */}

            <button
              type="button"
              onClick={() => router.push("/notifications")}
              aria-label="Notifications"
              className="w-11 h-11 rounded-full bg-[#101A2C] border border-slate-800 flex items-center justify-center relative hover:border-cyan-500 transition"
            >
              <Bell size={20} />

              {unreadNotifications > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500" />
              )}
            </button>
          </div>
        </div>

        {/* Balance Card */}

        <div className="mt-5 rounded-3xl bg-[#101A2C] border border-slate-800 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-gray-400 text-sm">Total Balance</p>

                <Eye size={16} className="text-gray-500" />
              </div>

              <h2 className="mt-2 text-3xl font-bold">
                {tonBalance.toFixed(4)} TON
              </h2>

              <p className="mt-2 text-gray-400">
                ≈ $
                {totalBalanceUSD.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                USD
              </p>

              <div className="flex items-center gap-3 mt-5">
                <div className="bg-[#0B1220] border border-slate-700 rounded-xl px-4 py-2">
                  <p className="text-[10px] text-gray-500 uppercase">
                    AI Wallet ID
                  </p>

                  <p className="text-sm font-semibold text-white">
                    {user?.id ?? "Loading..."}
                  </p>
                </div>

                <div className="bg-green-500/20 text-green-400 rounded-xl px-4 py-2 text-sm font-semibold">
                  ● Active
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="AI TONKEEPER"
                width={180}
                height={180}
                className="drop-shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}

        <div className="grid grid-cols-5 gap-3 mt-5">
          <button
            type="button"
            onClick={() => router.push("/send")}
            className="bg-[#101A2C] border border-slate-800 rounded-2xl py-4 flex flex-col items-center hover:border-cyan-500 transition"
          >
            <ArrowUp className="text-cyan-400" size={26} />

            <span className="text-xs mt-2">Send</span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/deposit")}
            className="bg-[#101A2C] border border-slate-800 rounded-2xl py-4 flex flex-col items-center hover:border-cyan-500 transition"
          >
            <ArrowDown className="text-cyan-400" size={26} />

            <span className="text-xs mt-2">Deposit</span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/swap")}
            className="bg-[#101A2C] border border-slate-800 rounded-2xl py-4 flex flex-col items-center hover:border-purple-500 transition"
          >
            <RefreshCw className="text-purple-400" size={26} />

            <span className="text-xs mt-2">Swap</span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/buy")}
            className="bg-[#101A2C] border border-slate-800 rounded-2xl py-4 flex flex-col items-center hover:border-blue-500 transition"
          >
            <CreditCard className="text-blue-400" size={26} />

            <span className="text-xs mt-2">Buy</span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/ai-trade")}
            className="bg-[#101A2C] border border-slate-800 rounded-2xl py-4 flex flex-col items-center hover:border-violet-500 transition"
          >
            <Bot className="text-violet-400" size={26} />

            <span className="text-xs mt-2">AI Trade</span>
          </button>
        </div>

        {/* AI Assistant */}

        <div className="mt-6 rounded-3xl bg-gradient-to-r from-cyan-600 to-blue-700 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                <Bot size={30} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">AI Assistant</h2>

                  <span className="text-[10px] bg-white/20 px-2 py-1 rounded-full">
                    BETA
                  </span>
                </div>

                <p className="text-sm text-blue-100 mt-1">
                  Autonomous AI trading engine
                </p>

                <p className="text-xs text-blue-200 mt-1">
                  AI continuously analyzes the crypto market, opens and closes
                  trades automatically based on your selected strategy.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/assistant")}
            className="w-full mt-5 bg-white text-blue-700 font-semibold rounded-2xl py-3"
          >
            Open AI Assistant
          </button>
        </div>

        {/* Assets */}

        <div className="mt-6 bg-[#101A2C] rounded-3xl border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold">Assets</h2>

            <button type="button" className="text-cyan-400 text-sm">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {[
              {
                coin: "TON",
                name: "Toncoin",
                image: "/coins/ton.png",
              },
              {
                coin: "USDT",
                name: "Tether",
                image: "/coins/usdt.png",
              },
              {
                coin: "BTC",
                name: "Bitcoin",
                image: "/coins/btc.png",
              },
              {
                coin: "ETH",
                name: "Ethereum",
                image: "/coins/eth.png",
              },
              {
                coin: "BNB",
                name: "BNB",
                image: "/coins/bnb.png",
              },
            ].map((asset) => {
              const assetBalance = Number(
                balances.find((balance) => balance.coin === asset.coin)
                  ?.balance ?? 0,
              );

              const assetPrice = Number(prices[asset.coin]?.price ?? 0);

              const assetValue = assetBalance * assetPrice;

              return (
                <div
                  key={asset.coin}
                  className="flex items-center justify-between bg-[#0B1220] rounded-2xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={asset.image}
                      alt={asset.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />

                    <div>
                      <p className="font-semibold">{asset.name}</p>

                      <p className="text-xs text-gray-400">{asset.coin}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      {assetBalance} {asset.coin}
                    </p>

                    <p className="text-green-400 text-sm">
                      $
                      {assetPrice.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Value: $
                      {assetValue.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions */}

        <div className="mt-6 bg-[#101A2C] rounded-3xl border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold">Recent Transactions</h2>

            <button
              type="button"
              onClick={() => router.push("/history")}
              className="text-cyan-400 text-sm"
            >
              View All
            </button>
          </div>

          <div className="space-y-4">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No transactions yet.
              </div>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between bg-[#0B1220] rounded-2xl p-4"
                >
                  <div>
                    <p className="font-semibold">{tx.type}</p>

                    <p className="text-xs text-gray-400">
                      {tx.coin} • {new Date(tx.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <p
                    className={`font-semibold ${
                      tx.type === "DEPOSIT" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {tx.type === "DEPOSIT" ? "+" : "-"}
                    {tx.amount} {tx.coin}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Portfolio Performance */}

        <div className="mt-6 bg-[#101A2C] rounded-3xl border border-slate-800 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Portfolio Performance</h2>

            <span className="text-green-400 font-semibold">+12.84%</span>
          </div>

          <div className="mt-5 h-40 rounded-2xl bg-[#0B1220] border border-slate-700 flex items-center justify-center">
            <p className="text-cyan-400 text-sm">Performance Chart</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="bg-[#0B1220] rounded-2xl p-3 text-center">
              <p className="text-xs text-gray-400">Today</p>

              <p className="text-green-400 font-bold mt-2">+2.35%</p>
            </div>

            <div className="bg-[#0B1220] rounded-2xl p-3 text-center">
              <p className="text-xs text-gray-400">7 Days</p>

              <p className="text-green-400 font-bold mt-2">+8.91%</p>
            </div>

            <div className="bg-[#0B1220] rounded-2xl p-3 text-center">
              <p className="text-xs text-gray-400">30 Days</p>

              <p className="text-green-400 font-bold mt-2">+12.84%</p>
            </div>
          </div>
        </div>

        {/* Market News */}

        <div className="mt-6 bg-[#101A2C] rounded-3xl border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold">Market News</h2>

            <button type="button" className="text-cyan-400 text-sm">
              View All
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-[#0B1220] rounded-2xl p-4 border border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">TON Network</h3>

                <span className="text-green-400 text-xs">Bullish</span>
              </div>

              <p className="text-sm text-gray-400 mt-2">
                TON adoption continues to grow as new projects join the
                ecosystem.
              </p>
            </div>

            <div className="bg-[#0B1220] rounded-2xl p-4 border border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">AI Trading</h3>

                <span className="text-cyan-400 text-xs">Live</span>
              </div>

              <p className="text-sm text-gray-400 mt-2">
                AI is scanning the crypto market for the best trading
                opportunities.
              </p>
            </div>

            <div className="bg-[#0B1220] rounded-2xl p-4 border border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Bitcoin</h3>

                <span className="text-yellow-400 text-xs">BTC</span>
              </div>

              <p className="text-sm text-gray-400 mt-2">
                Bitcoin remains the leading cryptocurrency by market
                capitalization.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}

        <div className="fixed bottom-0 left-0 right-0 bg-[#0B1220]/95 backdrop-blur-md border-t border-slate-800">
          <div className="max-w-md mx-auto grid grid-cols-5 h-20">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="flex flex-col items-center justify-center text-cyan-400"
            >
              <CreditCard size={22} />

              <span className="text-[11px] mt-1">Wallet</span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/swap")}
              className="flex flex-col items-center justify-center text-gray-400"
            >
              <RefreshCw size={22} />

              <span className="text-[11px] mt-1">Swap</span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/ai-trade")}
              className="flex flex-col items-center justify-center text-gray-400"
            >
              <Bot size={22} />

              <span className="text-[11px] mt-1">AI Trade</span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/history")}
              className="flex flex-col items-center justify-center text-gray-400"
            >
              <Clock3 size={22} />

              <span className="text-[11px] mt-1">History</span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/settings")}
              className="flex flex-col items-center justify-center text-gray-400"
            >
              <Bell size={22} />

              <span className="text-[11px] mt-1">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
