"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Bot,
  Settings,
  TrendingUp,
  Activity,
  Play,
  Pause,
  Square,
  ShieldCheck,
  Wallet,
  RefreshCw,
  Brain,
} from "lucide-react";
import TradingChart from "@/components/trading/TradingChart";
/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/
type TradingStatus = "ACTIVE" | "PAUSED" | "STOPPED";
type Trade = {
  id: string;
  coin: string;
  pair: string;
  side: "BUY" | "SELL";
  amount: number;
  entryPrice: number;
  currentPrice: number;
  profit: number;
  status: "OPEN" | "CLOSED" | "PENDING";
  createdAt: string;
};
type AITrading = {
  status: TradingStatus;
  confidence: number;
  totalProfit: number;
  todayProfit: number;
  winRate: number;
  openTrades: number;
  trades: Trade[];
  lastAnalysis: string | null;
  updatedAt: string;
};
type AITradingResponse = {
  success?: boolean;
  message?: string;
  aiTrading?: Partial<AITrading> | null;
  analysis?: AIAnalysis;
};
type AIAnalysis = {
  success: boolean;
  prices?: Record<string, number>;
  signal?: "BUY" | "SELL" | "WAIT";
  confidence?: number;
  analysis?: string;
  timestamp?: string;
};
type BybitBalance = {
  coin: string;
  walletBalance: string;
  availableToWithdraw?: string;
  usdValue?: string;
  equity?: string;
};
type BybitPrice = {
  symbol: string;
  success: boolean;
  message?: string;
  price: number;
  change24h?: number;
  high24h?: number;
  low24h?: number;
  volume24h?: number;
  turnover24h?: number;
};
type BybitOrder = {
  orderId: string;
  symbol: string;
  side: string;
  orderType: string;
  price: string;
  qty: string;
  avgPrice?: string;
  orderStatus: string;
  createdTime?: string;
  updatedTime?: string;
};
type BybitPosition = {
  symbol: string;
  side: string;
  size: string;
  avgPrice: string;
  markPrice?: string;
  positionValue?: string;
  unrealisedPnl?: string;
  leverage?: string;
  positionStatus?: string;
};
type BybitAccountResponse = {
  success: boolean;
  source?: string;
  message?: string;
  account?: {
    totalEquity: string;
    totalWalletBalance: string;
    totalAvailableBalance: string;
  };
  balances?: BybitBalance[];
  prices?: BybitPrice[];
  orders?: BybitOrder[];
  positions?: BybitPosition[];
  history?: BybitOrder[];
  errors?: {
    balance?: string | null;
    orders?: string | null;
    positions?: string | null;
    history?: string | null;
  };
  updatedAt?: string;
};
/*
|--------------------------------------------------------------------------
| DEFAULT STATE
|--------------------------------------------------------------------------
*/
const DEFAULT_AI_TRADING: AITrading = {
  status: "STOPPED",
  confidence: 0,
  totalProfit: 0,
  todayProfit: 0,
  winRate: 0,
  openTrades: 0,
  trades: [],
  lastAnalysis: null,
  updatedAt: "",
};
/*
|--------------------------------------------------------------------------
| SUPPORTED BYBIT TRADING COINS
|--------------------------------------------------------------------------
|
| TON is intentionally NOT removed from TONKEEPER.
|
| However, because the current Bybit integration cannot trade TONUSDT,
| the AI trading engine should only execute Bybit trades on supported
| symbols.
|
| TON can remain visible/monitored without being sent as a Bybit order.
|--------------------------------------------------------------------------
*/
const BYBIT_TRADING_COINS = [
  "BTC",
  "ETH",
  "BNB",
  "USDT",
] as const;
/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/
function toNumber(value: unknown, fallback = 0): number {
  const number = Number(value);
  return Number.isFinite(number)
    ? number
    : fallback;
}
function normalizeTrade(value: unknown, index: number): Trade {
  const raw =
    value &&
    typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const coin =
    typeof raw.coin === "string"
      ? raw.coin
      : "UNKNOWN";
  const pair =
    typeof raw.pair === "string"
      ? raw.pair
      : `${coin}USDT`;
  const side =
    raw.side === "SELL"
      ? "SELL"
      : "BUY";
  const status =
    raw.status === "OPEN" ||
    raw.status === "CLOSED"
      ? raw.status
      : "PENDING";
  return {
    id:
      typeof raw.id === "string"
        ? raw.id
        : `trade-${index}`,
    coin,
    pair,
    side,
    amount: toNumber(raw.amount),
    entryPrice: toNumber(
      raw.entryPrice
    ),
    currentPrice: toNumber(
      raw.currentPrice
    ),
    profit: toNumber(
      raw.profit
    ),
    status,
    createdAt:
      typeof raw.createdAt === "string"
        ? raw.createdAt
        : "",
  };
}
/*
|--------------------------------------------------------------------------
| NORMALIZE AI TRADING RESPONSE
|--------------------------------------------------------------------------
|
| This is the important fix.
|
| The API may return:
|
| {
|   aiTrading: {
|      status: "ACTIVE"
|   }
| }
|
| without `trades`.
|
| The UI must NEVER assume trades exists.
|--------------------------------------------------------------------------
*/
function normalizeAITrading(
  value: unknown
): AITrading {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return DEFAULT_AI_TRADING;
  }
  const raw =
    value as Record<string, unknown>;
  const rawTrades = Array.isArray(
    raw.trades
  )
    ? raw.trades
    : [];
  const trades = rawTrades.map(
    (trade, index) =>
      normalizeTrade(
        trade,
        index
      )
  );
  const status =
    raw.status === "ACTIVE" ||
    raw.status === "PAUSED" ||
    raw.status === "STOPPED"
      ? raw.status
      : DEFAULT_AI_TRADING.status;
  return {
    status,
    confidence: toNumber(
      raw.confidence,
      DEFAULT_AI_TRADING.confidence
    ),
    totalProfit: toNumber(
      raw.totalProfit,
      DEFAULT_AI_TRADING.totalProfit
    ),
    todayProfit: toNumber(
      raw.todayProfit,
      DEFAULT_AI_TRADING.todayProfit
    ),
    winRate: toNumber(
      raw.winRate,
      DEFAULT_AI_TRADING.winRate
    ),
    openTrades: toNumber(
      raw.openTrades,
      trades.filter(
        (trade) =>
          trade.status === "OPEN"
      ).length
    ),
    trades,
    lastAnalysis:
      typeof raw.lastAnalysis === "string"
        ? raw.lastAnalysis
        : null,
    updatedAt:
      typeof raw.updatedAt === "string"
        ? raw.updatedAt
        : "",
  };
}
/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/
export default function AITradePage() {
  const [aiTrading, setAITrading] =
    useState<AITrading>(
      DEFAULT_AI_TRADING
    );
  const [bybit, setBybit] =
    useState<BybitAccountResponse | null>(
      null
    );
  const [analysis, setAnalysis] =
    useState<AIAnalysis | null>(
      null
    );
  const [loading, setLoading] =
    useState(false);
  const [analysisLoading, setAnalysisLoading] =
    useState(false);
  const [bybitLoading, setBybitLoading] =
    useState(false);
  const [message, setMessage] =
    useState("");
  /*
  |--------------------------------------------------------------------------
  | LOAD AI TRADING
  |--------------------------------------------------------------------------
  */
  const loadAITrading =
    useCallback(async () => {
      try {
        const response =
          await fetch(
            "/api/ai-trade",
            {
              method: "GET",
              cache: "no-store",
            }
          );
        if (!response.ok) {
          throw new Error(
            `AI Trading API returned ${response.status}`
          );
        }
        const data =
          (await response.json()) as AITradingResponse;
        if (data.success) {
          setAITrading(
            normalizeAITrading(
              data.aiTrading
            )
          );
        }
      } catch (error) {
        console.error(
          "AI TRADING LOAD ERROR:",
          error
        );
        /*
        |--------------------------------------------------------------
        | Keep current valid state instead of breaking the UI.
        |--------------------------------------------------------------
        */
        setAITrading(
          (previous) =>
            normalizeAITrading(
              previous
            )
        );
      }
    }, []);
  /*
  |--------------------------------------------------------------------------
  | LOAD BYBIT ACCOUNT
  |--------------------------------------------------------------------------
  */
  const loadBybitAccount =
    useCallback(async () => {
      try {
        setBybitLoading(true);
        const response =
          await fetch(
            "/api/bybit/account",
            {
              method: "GET",
              cache: "no-store",
            }
          );
        if (!response.ok) {
          throw new Error(
            `Bybit API returned ${response.status}`
          );
        }
        const data =
          (await response.json()) as BybitAccountResponse;
        setBybit({
          ...data,
          balances:
            data.balances ?? [],
          prices:
            data.prices ?? [],
          orders:
            data.orders ?? [],
          positions:
            data.positions ?? [],
          history:
            data.history ?? [],
        });
      } catch (error) {
        console.error(
          "BYBIT ACCOUNT LOAD ERROR:",
          error
        );
        setBybit({
          success: false,
          message:
            "Unable to load Bybit account.",
          balances: [],
          prices: [],
          orders: [],
          positions: [],
          history: [],
        });
      } finally {
        setBybitLoading(false);
      }
    }, []);
  /*
  |--------------------------------------------------------------------------
  | AI MARKET ANALYSIS
  |--------------------------------------------------------------------------
  */
  const runAnalysis =
    useCallback(async () => {
      try {
        setAnalysisLoading(true);
        setMessage("");
        const response =
          await fetch(
            "/api/ai-trade",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              cache: "no-store",
              body: JSON.stringify({
                action: "ANALYZE",
              }),
            }
          );
        const data =
          (await response.json()) as AITradingResponse;
        if (
          !response.ok ||
          !data.success
        ) {
          setMessage(
            data.message ||
              "Unable to analyze the market."
          );
          return;
        }
        if (data.analysis) {
          setAnalysis(
            data.analysis
          );
          setAITrading(
            (previous) => ({
              ...normalizeAITrading(
                previous
              ),
              confidence:
                toNumber(
                  data.analysis
                    ?.confidence,
                  previous.confidence
                ),
              lastAnalysis:
                data.analysis
                  ?.analysis ??
                previous.lastAnalysis,
              updatedAt:
                data.analysis
                  ?.timestamp ??
                previous.updatedAt,
            })
          );
        }
        setMessage(
          "Market analysis completed successfully."
        );
      } catch (error) {
        console.error(
          "AI MARKET ANALYSIS ERROR:",
          error
        );
        setMessage(
          "Unable to connect to AI Trading analysis."
        );
      } finally {
        setAnalysisLoading(false);
      }
    }, []);
  /*
  |--------------------------------------------------------------------------
  | AI ACTION
  |--------------------------------------------------------------------------
  */
  const sendAction =
    useCallback(
      async (
        action:
          | "START"
          | "PAUSE"
          | "STOP"
      ) => {
        try {
          setLoading(true);
          setMessage("");
          const response =
            await fetch(
              "/api/ai-trade",
              {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                cache: "no-store",
                body: JSON.stringify({
                  action,
                }),
              }
            );
          const data =
            (await response.json()) as AITradingResponse;
          if (
            !response.ok ||
            !data.success
          ) {
            setMessage(
              data.message ||
                "AI Trading action failed."
            );
            return;
          }
          if (data.aiTrading) {
            setAITrading(
              normalizeAITrading(
                data.aiTrading
              )
            );
          } else {
            /*
            |----------------------------------------------------------
            | Even if the API doesn't return aiTrading, reload it.
            |----------------------------------------------------------
            */
            await loadAITrading();
          }
          setMessage(
            data.message ||
              "Action completed successfully."
          );
          /*
          |--------------------------------------------------------------
          | START -> first analysis
          |--------------------------------------------------------------
          */
          if (action === "START") {
            await runAnalysis();
          }
          if (action === "STOP") {
            setAnalysis(null);
          }
        } catch (error) {
          console.error(
            "AI TRADING ACTION ERROR:",
            error
          );
          setMessage(
            "Unable to connect to AI Trading API."
          );
        } finally {
          setLoading(false);
        }
      },
      [
        loadAITrading,
        runAnalysis,
      ]
    );
  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!mounted) {
        return;
      }
      await Promise.allSettled([
        loadAITrading(),
        loadBybitAccount(),
      ]);
    };
    void load();
    const interval =
      window.setInterval(
        () => {
          void load();
        },
        10000
      );
    return () => {
      mounted = false;
      window.clearInterval(
        interval
      );
    };
  }, [
    loadAITrading,
    loadBybitAccount,
  ]);
  /*
  |--------------------------------------------------------------------------
  | AUTOMATIC MARKET ANALYSIS
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    if (
      aiTrading.status !== "ACTIVE"
    ) {
      return;
    }
    const interval =
      window.setInterval(
        () => {
          void runAnalysis();
        },
        30000
      );
    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    aiTrading.status,
    runAnalysis,
  ]);
  /*
  |--------------------------------------------------------------------------
  | SAFE VALUES
  |--------------------------------------------------------------------------
  */
  const trades =
    Array.isArray(
      aiTrading.trades
    )
      ? aiTrading.trades
      : [];
  const statusLabel =
    aiTrading.status === "ACTIVE"
      ? "● ACTIVE"
      : aiTrading.status === "PAUSED"
      ? "● PAUSED"
      : "● STOPPED";
  const statusColor =
    aiTrading.status === "ACTIVE"
      ? "text-green-400 bg-green-500/20"
      : aiTrading.status === "PAUSED"
      ? "text-yellow-400 bg-yellow-500/20"
      : "text-red-400 bg-red-500/20";
  const totalEquity =
    Number(
      bybit?.account
        ?.totalEquity ?? 0
    );
  const availableBalance =
    Number(
      bybit?.account
        ?.totalAvailableBalance ?? 0
    );
  const positiveBalances =
    (
      bybit?.balances ?? []
    ).filter(
      (balance) =>
        Number(
          balance.walletBalance
        ) > 0
    );
  const openPositions =
    (
      bybit?.positions ?? []
    ).filter(
      (position) =>
        Number(position.size) > 0
    );
  const openOrders =
    bybit?.orders ?? [];
  const prices =
    bybit?.prices ?? [];
  const confidence =
    Math.min(
      Math.max(
        Number(
          analysis?.confidence ??
            aiTrading.confidence ??
            0
        ) || 0,
        0
      ),
      100
    );
  const signal =
    analysis?.signal ?? "WAIT";
  const signalColor =
    signal === "BUY"
      ? "bg-green-500/20 text-green-300 border-green-500/30"
      : signal === "SELL"
      ? "bg-red-500/20 text-red-300 border-red-500/30"
      : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */
  return (
    <main className="min-h-screen bg-[#050B18] text-white">
      <div className="max-w-md mx-auto px-5 py-6 pb-10">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() =>
              window.history.back()
            }
            className="w-11 h-11 rounded-full bg-[#101A2C] border border-slate-800 flex items-center justify-center hover:bg-[#16233D] transition"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-bold">
              AI Trade
            </h1>
            <p className="text-sm text-cyan-400">
              Autonomous Trading Engine
            </p>
          </div>
          <button
            type="button"
            className="w-11 h-11 rounded-full bg-[#101A2C] border border-slate-800 flex items-center justify-center hover:bg-[#16233D] transition"
            aria-label="Trading settings"
          >
            <Settings size={20} />
          </button>
        </div>
        {/* BYBIT CONNECTION */}
        <section className="mb-6 rounded-3xl bg-[#101A2C] border border-green-500/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center">
                <Wallet
                  size={21}
                  className="text-green-400"
                />
              </div>
              <div>
                <p className="font-semibold">
                  Trading Account
                </p>
                <p className="text-xs text-gray-400">
                  Bybit Mainnet
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  bybit?.success
                    ? "bg-green-400"
                    : "bg-red-400"
                }`}
              />
              <span
                className={`text-xs font-semibold ${
                  bybit?.success
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {bybit?.success
                  ? "CONNECTED"
                  : "OFFLINE"}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-[#0B1220] rounded-2xl p-4">
              <p className="text-xs text-gray-500">
                Total Equity
              </p>
              <p className="text-lg font-bold mt-1">
                $
                {Number.isFinite(
                  totalEquity
                )
                  ? totalEquity.toFixed(2)
                  : "0.00"}
              </p>
            </div>
            <div className="bg-[#0B1220] rounded-2xl p-4">
              <p className="text-xs text-gray-500">
                Available
              </p>
              <p className="text-lg font-bold mt-1">
                $
                {Number.isFinite(
                  availableBalance
                )
                  ? availableBalance.toFixed(2)
                  : "0.00"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              void loadBybitAccount()
            }
            disabled={bybitLoading}
            className="w-full mt-3 rounded-2xl bg-[#16233D] border border-slate-700 py-3 flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-[#1B2C4C] transition"
          >
            <RefreshCw
              size={17}
              className={
                bybitLoading
                  ? "animate-spin"
                  : ""
              }
            />
            {bybitLoading
              ? "Refreshing..."
              : "Refresh Account"}
          </button>
          {bybit?.message &&
            !bybit.success && (
              <p className="text-xs text-red-400 text-center mt-3">
                {bybit.message}
              </p>
            )}
        </section>
        {/* AI TRADING */}
        <section className="rounded-3xl bg-gradient-to-br from-[#101A2C] to-[#16233D] border border-cyan-500/20 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Bot
                  size={30}
                  className="text-cyan-400"
                />
                <h2 className="text-2xl font-bold">
                  AI Trading
                </h2>
              </div>
              <p className="text-gray-400 mt-2">
                Smart Autonomous Trading
              </p>
            </div>
            <div
              className={`px-4 py-2 rounded-full ${statusColor}`}
            >
              <span className="font-semibold text-sm">
                {statusLabel}
              </span>
            </div>
          </div>
          {/* PROFIT */}
          <div className="mt-6">
            <p className="text-gray-400 text-sm">
              Total Profit
            </p>
            <h3
              className={`text-4xl font-bold mt-2 ${
                aiTrading.totalProfit >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {aiTrading.totalProfit >= 0
                ? "+"
                : ""}
              {Number(
                aiTrading.totalProfit
              ).toFixed(3)}{" "}
              TON
            </h3>
            <p className="text-gray-500 mt-1">
              AI Trading performance
            </p>
          </div>
          {/* COINS */}
          <div className="flex items-center justify-between mt-8">
            <Image
              src="/coins/ton.png"
              alt="TON"
              width={44}
              height={44}
            />
            <Image
              src="/coins/btc.png"
              alt="BTC"
              width={44}
              height={44}
            />
            <Image
              src="/coins/eth.png"
              alt="ETH"
              width={44}
              height={44}
            />
            <Image
              src="/coins/bnb.png"
              alt="BNB"
              width={44}
              height={44}
            />
            <Image
              src="/coins/usdt.png"
              alt="USDT"
              width={44}
              height={44}
            />
          </div>
          {/* TRADING SUPPORT INFORMATION */}
          <div className="mt-5 rounded-2xl bg-[#0B1220] border border-slate-800 p-4">
            <p className="text-xs text-gray-500">
              Bybit trading assets
            </p>
            <p className="text-sm text-gray-300 mt-2">
              BTC • ETH • BNB • USDT
            </p>
            <p className="text-xs text-gray-500 mt-2">
              TON remains available in TONKEEPER but is
              not sent to Bybit while its trading pair is
              unavailable.
            </p>
          </div>
          {/* CONTROLS */}
          <div className="grid grid-cols-3 gap-3 mt-8">
            <button
              type="button"
              onClick={() =>
                void sendAction("START")
              }
              disabled={loading}
              className="rounded-2xl bg-green-500 py-4 flex flex-col items-center text-white disabled:opacity-50 hover:bg-green-600 transition"
            >
              <Play size={22} />
              <span className="mt-2 text-sm font-medium">
                Start
              </span>
            </button>
            <button
              type="button"
              onClick={() =>
                void sendAction("PAUSE")
              }
              disabled={loading}
              className="rounded-2xl bg-yellow-500 py-4 flex flex-col items-center text-white disabled:opacity-50 hover:bg-yellow-600 transition"
            >
              <Pause size={22} />
              <span className="mt-2 text-sm font-medium">
                Pause
              </span>
            </button>
            <button
              type="button"
              onClick={() =>
                void sendAction("STOP")
              }
              disabled={loading}
              className="rounded-2xl bg-red-500 py-4 flex flex-col items-center text-white disabled:opacity-50 hover:bg-red-600 transition"
            >
              <Square size={22} />
              <span className="mt-2 text-sm font-medium">
                Stop
              </span>
            </button>
          </div>
          {/* ANALYZE BUTTON */}
          <button
            type="button"
            onClick={() =>
              void runAnalysis()
            }
            disabled={analysisLoading}
            className="w-full mt-3 rounded-2xl bg-cyan-500 py-4 flex items-center justify-center gap-3 text-white font-semibold disabled:opacity-50 hover:bg-cyan-600 transition"
          >
            <Brain
              size={22}
              className={
                analysisLoading
                  ? "animate-pulse"
                  : ""
              }
            />
            {analysisLoading
              ? "Analyzing Market..."
              : "Analyze Market"}
          </button>
          {message && (
            <div className="mt-4 rounded-2xl bg-[#0B1220] border border-slate-700 p-3 text-center text-sm text-cyan-300">
              {message}
            </div>
          )}
        </section>
        {/* LIVE MARKET */}
        <section className="mt-6 bg-[#101A2C] border border-slate-800 rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                Live Market
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Real-time Bybit market data
              </p>
            </div>
            <span className="text-green-400 text-xs font-semibold">
              LIVE
            </span>
          </div>
          <div className="space-y-3 mt-5">
            {prices.map(
              (market) => (
                <div
                  key={market.symbol}
                  className="bg-[#0B1220] rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        {market.symbol}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        24H
                      </p>
                    </div>
                    <div className="text-right">
                      {market.success ? (
                        <>
                          <p className="font-bold">
                            $
                            {Number(
                              market.price
                            ).toLocaleString(
                              "en-US",
                              {
                                maximumFractionDigits: 8,
                              }
                            )}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              (
                                market.change24h ??
                                0
                              ) >= 0
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {(
                              market.change24h ??
                              0
                            ) >= 0
                              ? "+"
                              : ""}
                            {Number(
                              market.change24h ??
                                0
                            ).toFixed(2)}
                            %
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-yellow-400">
                          Unavailable
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
            {prices.length === 0 && (
              <div className="bg-[#0B1220] rounded-2xl p-5 text-center text-gray-500 text-sm">
                Market data unavailable.
              </div>
            )}
          </div>
        </section>
        {/* AI STATISTICS */}
        <section className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-[#101A2C] border border-slate-800 rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <Activity
                size={24}
                className="text-cyan-400"
              />
              <span className="text-cyan-400 text-xs">
                LIVE
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-4">
              AI Confidence
            </p>
            <h3 className="text-3xl font-bold mt-2">
              {confidence.toFixed(0)}%
            </h3>
          </div>
          <div className="bg-[#101A2C] border border-slate-800 rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <TrendingUp
                size={24}
                className="text-green-400"
              />
              <span className="text-green-400 text-xs">
                TODAY
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-4">
              Today's Profit
            </p>
            <h3
              className={`text-3xl font-bold mt-2 ${
                aiTrading.todayProfit >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {aiTrading.todayProfit >= 0
                ? "+"
                : ""}
              {Number(
                aiTrading.todayProfit
              ).toFixed(3)}{" "}
              TON
            </h3>
          </div>
          <div className="bg-[#101A2C] border border-slate-800 rounded-3xl p-5">
            <p className="text-gray-400 text-sm">
              Win Rate
            </p>
            <h3 className="text-3xl font-bold mt-3">
              {Math.min(
                Math.max(
                  Number(
                    aiTrading.winRate
                  ) || 0,
                  0
                ),
                100
              ).toFixed(0)}
              %
            </h3>
            <div className="mt-4 h-2 rounded-full bg-[#0B1220] overflow-hidden">
              <div
                className="h-2 rounded-full bg-cyan-400 transition-all"
                style={{
                  width: `${Math.min(
                    Math.max(
                      Number(
                        aiTrading.winRate
                      ) || 0,
                      0
                    ),
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
          <div className="bg-[#101A2C] border border-slate-800 rounded-3xl p-5">
            <p className="text-gray-400 text-sm">
              Open Trades
            </p>
            <h3 className="text-3xl font-bold mt-3">
              {Number(
                aiTrading.openTrades
              ) || 0}
            </h3>
            <p className="text-xs text-gray-500 mt-4">
              {aiTrading.openTrades > 0
                ? "Active positions"
                : "No active positions"}
            </p>
          </div>
        </section>
        {/* AI MARKET ANALYSIS */}
        <section className="mt-6 rounded-3xl bg-gradient-to-br from-cyan-600 to-blue-700 p-6">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <Bot size={30} />
              <div>
                <h2 className="text-xl font-bold">
                  AI Market Analysis
                </h2>
                <p className="text-xs text-blue-100 mt-1">
                  Autonomous market intelligence
                </p>
              </div>
            </div>
            <span
              className={`px-3 py-1.5 rounded-full border text-xs font-bold ${signalColor}`}
            >
              {signal}
            </span>
          </div>
          {/* SIGNAL */}
          <div className="bg-black/20 rounded-2xl p-4">
            <p className="text-xs text-blue-100">
              Current Signal
            </p>
            <p className="text-2xl font-bold mt-1">
              {signal}
            </p>
          </div>
          {/* CONFIDENCE */}
          <div className="bg-black/20 rounded-2xl p-4 mt-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-blue-100">
                AI Confidence
              </p>
              <p className="font-bold">
                {confidence.toFixed(0)}%
              </p>
            </div>
            <div className="mt-3 h-2 rounded-full bg-black/30 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{
                  width: `${confidence}%`,
                }}
              />
            </div>
          </div>
          {/* ANALYSIS TEXT */}
          <div className="bg-black/20 rounded-2xl p-4 mt-3">
            <p className="text-xs text-blue-100">
              AI Decision
            </p>
            <p className="text-sm leading-6 mt-2">
              {analysis?.analysis ??
                aiTrading.lastAnalysis ??
                "The AI is ready to analyze the cryptocurrency market."}
            </p>
          </div>
          {/* MARKET PRICES */}
          {analysis?.prices &&
            Object.keys(
              analysis.prices
            ).length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-blue-100 mb-3">
                  Market Prices
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(
                    analysis.prices
                  ).map(
                    ([coin, price]) => (
                      <div
                        key={coin}
                        className="bg-black/20 rounded-xl p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold">
                            {coin}
                          </span>
                          <span className="text-xs text-blue-100 text-right">
                            $
                            {Number(
                              price
                            ).toLocaleString(
                              "en-US",
                              {
                                maximumFractionDigits: 8,
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          {/* TIMESTAMP */}
          {analysis?.timestamp && (
            <p className="text-[11px] text-blue-100 mt-4 text-center">
              Last analysis:{" "}
              {new Date(
                analysis.timestamp
              ).toLocaleString()}
            </p>
          )}
        </section>
        {/* BYBIT ASSETS */}
        <section className="mt-6 bg-[#101A2C] border border-slate-800 rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                Assets
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Assets available through the trading account
              </p>
            </div>
            <Wallet
              size={22}
              className="text-cyan-400"
            />
          </div>
          <div className="space-y-3 mt-5">
            {positiveBalances
              .slice(0, 10)
              .map(
                (balance) => (
                  <div
                    key={balance.coin}
                    className="flex items-center justify-between bg-[#0B1220] rounded-2xl p-4"
                  >
                    <div>
                      <p className="font-semibold">
                        {balance.coin}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Wallet balance
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {Number(
                          balance.walletBalance
                        ).toLocaleString(
                          "en-US",
                          {
                            maximumFractionDigits: 8,
                          }
                        )}
                      </p>
                      {balance.usdValue && (
                        <p className="text-xs text-gray-500 mt-1">
                          $
                          {Number(
                            balance.usdValue
                          ).toLocaleString(
                            "en-US",
                            {
                              maximumFractionDigits: 2,
                            }
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                )
              )}
            {positiveBalances.length ===
              0 && (
              <div className="bg-[#0B1220] rounded-2xl p-5 text-center">
                <p className="text-gray-400">
                  No assets available.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Your Bybit trading account currently has no balance.
                </p>
              </div>
            )}
          </div>
        </section>
        {/* OPEN POSITIONS */}
        <section className="mt-6 bg-[#101A2C] border border-slate-800 rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              Open Positions
            </h2>
            <span className="text-cyan-400 text-sm">
              {openPositions.length}
            </span>
          </div>
          <div className="space-y-3 mt-5">
            {openPositions
              .slice(0, 10)
              .map(
                (
                  position,
                  index
                ) => {
                  const pnl =
                    Number(
                      position.unrealisedPnl ??
                        0
                    );
                  return (
                    <div
                      key={`${position.symbol}-${index}`}
                      className="bg-[#0B1220] rounded-2xl p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">
                            {position.symbol}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {position.side} • Size{" "}
                            {position.size}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-semibold ${
                              pnl >= 0
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {pnl >= 0
                              ? "+"
                              : ""}
                            {Number.isFinite(
                              pnl
                            )
                              ? pnl.toFixed(4)
                              : "0.0000"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PnL
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            {openPositions.length ===
              0 && (
              <div className="bg-[#0B1220] rounded-2xl p-5 text-center">
                <p className="text-gray-400">
                  No open positions.
                </p>
              </div>
            )}
          </div>
        </section>
        {/* OPEN ORDERS */}
        <section className="mt-6 bg-[#101A2C] border border-slate-800 rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              Open Orders
            </h2>
            <span className="text-cyan-400 text-sm">
              {openOrders.length}
            </span>
          </div>
          <div className="space-y-3 mt-5">
            {openOrders
              .slice(0, 10)
              .map(
                (order) => (
                  <div
                    key={order.orderId}
                    className="bg-[#0B1220] rounded-2xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          {order.symbol}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {order.side} •{" "}
                          {order.orderType}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {order.qty}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {order.orderStatus}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}
            {openOrders.length ===
              0 && (
              <div className="bg-[#0B1220] rounded-2xl p-5 text-center">
                <p className="text-gray-400">
                  No open orders.
                </p>
              </div>
            )}
          </div>
        </section>
        {/* PORTFOLIO */}
        <section className="mt-6 bg-[#101A2C] border border-slate-800 rounded-3xl p-5">
          <h2 className="text-xl font-bold">
            Trading Portfolio
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Assets monitored by the AI engine
          </p>
          <div className="flex items-center justify-between mt-6">
            <Image
              src="/coins/ton.png"
              alt="TON"
              width={38}
              height={38}
            />
            <Image
              src="/coins/btc.png"
              alt="BTC"
              width={38}
              height={38}
            />
            <Image
              src="/coins/eth.png"
              alt="ETH"
              width={38}
              height={38}
            />
            <Image
              src="/coins/bnb.png"
              alt="BNB"
              width={38}
              height={38}
            />
            <Image
              src="/coins/usdt.png"
              alt="USDT"
              width={38}
              height={38}
            />
          </div>
        </section>
        {/* REAL-TIME TRADING CHART */}
        <section className="mt-6">
          <TradingChart
            symbol="BTCUSDT"
            category="spot"
          />
        </section>
        {/* RECENT TRADES */}
        <section className="mt-6 bg-[#101A2C] border border-slate-800 rounded-3xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold">
              Recent Trades
            </h2>
            <span className="text-cyan-400 text-sm">
              Live
            </span>
          </div>
          <div className="space-y-4">
            {trades.length === 0 ? (
              <div className="bg-[#0B1220] rounded-2xl p-5 text-center">
                <p className="text-gray-400">
                  No trades yet
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  AI Trading will display trades here.
                </p>
              </div>
            ) : (
              trades
                .slice(0, 5)
                .map(
                  (trade) => {
                    const coinFile =
                      trade.coin
                        .toLowerCase()
                        .replace(
                          /[^a-z0-9]/g,
                          ""
                        );
                    return (
                      <div
                        key={trade.id}
                        className="flex items-center justify-between bg-[#0B1220] rounded-2xl p-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Image
                            src={`/coins/${coinFile}.png`}
                            alt={trade.coin}
                            width={42}
                            height={42}
                            onError={(
                              event
                            ) => {
                              (
                                event.currentTarget as HTMLImageElement
                              ).style.display =
                                "none";
                            }}
                          />
                          <div className="min-w-0">
                            <p className="font-semibold truncate">
                              {trade.pair}
                            </p>
                            <p className="text-xs text-gray-400">
                              {trade.side} •{" "}
                              {trade.status}
                            </p>
                          </div>
                        </div>
                        <span
                          className={
                            trade.status ===
                            "OPEN"
                              ? "text-green-400 font-semibold"
                              : trade.status ===
                                "CLOSED"
                              ? "text-gray-400 font-semibold"
                              : "text-yellow-400 font-semibold"
                          }
                        >
                          {trade.status}
                        </span>
                      </div>
                    );
                  }
                )
            )}
          </div>
        </section>
        {/* SECURITY */}
        <section className="mt-6 bg-[#101A2C] border border-slate-800 rounded-3xl p-5">
          <h2 className="text-xl font-bold mb-5">
            Security
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck
                size={22}
                className="text-green-400 shrink-0"
              />
              <p className="text-gray-300">
                Bybit API credentials remain server-side.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck
                size={22}
                className="text-green-400 shrink-0"
              />
              <p className="text-gray-300">
                Trading data is displayed directly inside TONKEEPER.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck
                size={22}
                className="text-green-400 shrink-0"
              />
              <p className="text-gray-300">
                Every AI operation is recorded in History.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck
                size={22}
                className="text-green-400 shrink-0"
              />
              <p className="text-gray-300">
                Market data is refreshed automatically.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}