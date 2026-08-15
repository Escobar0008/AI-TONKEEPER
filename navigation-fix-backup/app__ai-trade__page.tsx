"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

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
  RefreshCw,
  Brain,
} from "lucide-react";

import TradingChart from "@/components/trading/TradingChart";

type TradingStatus =
  | "ACTIVE"
  | "PAUSED"
  | "STOPPED";

type TradeStatus =
  | "OPEN"
  | "CLOSED"
  | "PENDING";

type TradeSide =
  | "BUY"
  | "SELL";

type Trade = {
  id: string;
  coin: string;
  pair: string;
  side: TradeSide;
  amount: number;
  entryPrice: number;
  currentPrice: number;
  exitPrice: number | null;
  profit: number;
  fee: number;
  confidence: number;
  status: TradeStatus;
  openedAt: string | null;
  closedAt: string | null;
  createdAt: string;
};

type AITrading = {
  status: TradingStatus;
  confidence: number;
  totalProfit: number;
  todayProfit: number;
  winRate: number;
  openTrades: number;
  orderCount: number;
  trades: Trade[];
  lastAnalysis: string | null;
  updatedAt: string;
};

type MarketPrice = {
  symbol: string;
  success: boolean;
  message?: string;
  price: number;
  change24h?: number;
  high24h?: number;
  low24h?: number;
  volume24h?: number;
  marketCap?: number;
};

type AIAnalysis = {
  success: boolean;
  prices?: Record<string, number>;
  signal?: "BUY" | "SELL" | "WAIT";
  confidence?: number;
  analysis?: string;
  timestamp?: string;
};

type AITradingResponse = {
  success?: boolean;
  message?: string;
  aiTrading?: Partial<AITrading> | null;
  analysis?: AIAnalysis;
  prices?: MarketPrice[];
  order?: {
    id: string;
    action: string;
    coin: string;
    pair: string;
    side: string;
    amount: number;
    price: number;
    status: string;
    createdAt: string;
  } | null;
};

const DEFAULT_AI_TRADING: AITrading = {
  status: "STOPPED",
  confidence: 0,
  totalProfit: 0,
  todayProfit: 0,
  winRate: 0,
  openTrades: 0,
  orderCount: 0,
  trades: [],
  lastAnalysis: null,
  updatedAt: "",
};

function toNumber(
  value: unknown,
  fallback = 0,
): number {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

function normalizeTrade(
  value: unknown,
  index: number,
): Trade {
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
      : `${coin}/USDT`;

  const side: TradeSide =
    raw.side === "SELL"
      ? "SELL"
      : "BUY";

  let status: TradeStatus = "PENDING";

  if (raw.status === "OPEN") {
    status = "OPEN";
  } else if (raw.status === "CLOSED") {
    status = "CLOSED";
  }

  return {
    id:
      typeof raw.id === "string"
        ? raw.id
        : `order-${index}`,

    coin,

    pair,

    side,

    amount: toNumber(raw.amount),

    entryPrice: toNumber(
      raw.entryPrice,
    ),

    currentPrice: toNumber(
      raw.currentPrice,
    ),

    exitPrice:
      raw.exitPrice === null ||
      raw.exitPrice === undefined
        ? null
        : toNumber(raw.exitPrice),

    profit: toNumber(raw.profit),

    fee: toNumber(raw.fee),

    confidence: toNumber(
      raw.confidence,
    ),

    status,

    openedAt:
      typeof raw.openedAt === "string"
        ? raw.openedAt
        : null,

    closedAt:
      typeof raw.closedAt === "string"
        ? raw.closedAt
        : null,

    createdAt:
      typeof raw.createdAt === "string"
        ? raw.createdAt
        : "",
  };
}

function normalizeAITrading(
  value: unknown,
): AITrading {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return {
      ...DEFAULT_AI_TRADING,
    };
  }

  const raw =
    value as Record<string, unknown>;

  const rawTrades =
    Array.isArray(raw.trades)
      ? raw.trades
      : [];

  const trades = rawTrades.map(
    (trade, index) =>
      normalizeTrade(
        trade,
        index,
      ),
  );

  const status: TradingStatus =
    raw.status === "ACTIVE" ||
    raw.status === "PAUSED" ||
    raw.status === "STOPPED"
      ? raw.status
      : "STOPPED";

  return {
    status,

    confidence: toNumber(
      raw.confidence,
    ),

    totalProfit: toNumber(
      raw.totalProfit,
    ),

    todayProfit: toNumber(
      raw.todayProfit,
    ),

    winRate: toNumber(
      raw.winRate,
    ),

    openTrades: toNumber(
      raw.openTrades,
      trades.filter(
        (trade) =>
          trade.status === "OPEN",
      ).length,
    ),

    orderCount: toNumber(
      raw.orderCount,
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

export default function AITradePage() {
  const [aiTrading, setAITrading] =
    useState<AITrading>(
      DEFAULT_AI_TRADING,
    );

  const [prices, setPrices] =
    useState<MarketPrice[]>([]);

  const [analysis, setAnalysis] =
    useState<AIAnalysis | null>(
      null,
    );

  const [loading, setLoading] =
    useState(false);

  const [
    analysisLoading,
    setAnalysisLoading,
  ] = useState(false);

  const [
    marketLoading,
    setMarketLoading,
  ] = useState(false);

  const [message, setMessage] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | LOAD
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
            },
          );

        const data =
          (await response.json()) as AITradingResponse;

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Unable to load AI Trading.",
          );
        }

        setAITrading(
          normalizeAITrading(
            data.aiTrading,
          ),
        );

        if (
          Array.isArray(
            data.prices,
          )
        ) {
          setPrices(data.prices);
        }
      } catch (error) {
        console.error(
          "AI TRADING LOAD ERROR:",
          error,
        );
      }
    }, []);

  /*
  |--------------------------------------------------------------------------
  | MARKET
  |--------------------------------------------------------------------------
  */

  const loadMarket =
    useCallback(async () => {
      try {
        setMarketLoading(true);

        const response =
          await fetch(
            "/api/ai-trade?market=true",
            {
              method: "GET",
              cache: "no-store",
            },
          );

        const data =
          (await response.json()) as AITradingResponse;

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Market request failed.",
          );
        }

        if (
          Array.isArray(
            data.prices,
          )
        ) {
          setPrices(data.prices);
        }
      } catch (error) {
        console.error(
          "LIVE MARKET LOAD ERROR:",
          error,
        );
      } finally {
        setMarketLoading(false);
      }
    }, []);

  /*
  |--------------------------------------------------------------------------
  | ANALYSIS
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
            },
          );

        const data =
          (await response.json()) as AITradingResponse;

        if (
          !response.ok ||
          !data.success
        ) {
          setMessage(
            data.message ||
              "Unable to analyze the market.",
          );

          return;
        }

        if (data.analysis) {
          setAnalysis(
            data.analysis,
          );
        }

        if (data.aiTrading) {
          setAITrading(
            normalizeAITrading(
              data.aiTrading,
            ),
          );
        }

        if (
          Array.isArray(
            data.prices,
          )
        ) {
          setPrices(data.prices);
        }

        if (data.order) {
          setMessage(
            `${data.order.action} order ${data.order.id} created for ${data.order.pair}.`,
          );
        } else {
          setMessage(
            data.message ||
              "Market analysis completed.",
          );
        }
      } catch (error) {
        console.error(
          "AI MARKET ANALYSIS ERROR:",
          error,
        );

        setMessage(
          "Unable to connect to AI Trading.",
        );
      } finally {
        setAnalysisLoading(false);
      }
    }, []);

  /*
  |--------------------------------------------------------------------------
  | START / PAUSE / STOP
  |--------------------------------------------------------------------------
  */

  const sendAction =
    useCallback(
      async (
        action:
          | "START"
          | "PAUSE"
          | "STOP",
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
              },
            );

          const data =
            (await response.json()) as AITradingResponse;

          if (
            !response.ok ||
            !data.success
          ) {
            setMessage(
              data.message ||
                "Action failed.",
            );

            return;
          }

          if (data.aiTrading) {
            setAITrading(
              normalizeAITrading(
                data.aiTrading,
              ),
            );
          }

          if (
            Array.isArray(
              data.prices,
            )
          ) {
            setPrices(data.prices);
          }

          setMessage(
            data.message ||
              `AI Trading ${action.toLowerCase()}.`,
          );

          if (
            action === "STOP"
          ) {
            setAnalysis(null);
          }
        } catch (error) {
          console.error(
            "AI TRADING ACTION ERROR:",
            error,
          );

          setMessage(
            "Unable to connect to AI Trading.",
          );
        } finally {
          setLoading(false);
        }
      },
      [],
    );

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    void loadAITrading();
    void loadMarket();

    const interval =
      window.setInterval(
        () => {
          void loadAITrading();
          void loadMarket();
        },
        10000,
      );

    return () => {
      window.clearInterval(
        interval,
      );
    };
  }, [
    loadAITrading,
    loadMarket,
  ]);

  /*
  |--------------------------------------------------------------------------
  | AUTOMATIC AI ENGINE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      aiTrading.status !==
      "ACTIVE"
    ) {
      return;
    }

    const interval =
      window.setInterval(
        () => {
          void runAnalysis();
        },
        30000,
      );

    return () => {
      window.clearInterval(
        interval,
      );
    };
  }, [
    aiTrading.status,
    runAnalysis,
  ]);

  const trades =
    Array.isArray(
      aiTrading.trades,
    )
      ? aiTrading.trades
      : [];

  const openTrades =
    trades.filter(
      (trade) =>
        trade.status === "OPEN",
    );

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

  const confidence = Math.min(
    Math.max(
      toNumber(
        analysis?.confidence ??
          aiTrading.confidence,
      ),
      0,
    ),
    100,
  );

  const signal =
    analysis?.signal ?? "WAIT";

  const signalColor =
    signal === "BUY"
      ? "bg-green-500/20 text-green-300 border-green-500/30"
      : signal === "SELL"
      ? "bg-red-500/20 text-red-300 border-red-500/30"
      : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";

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
          >
            <ArrowLeft size={20} />
          </button>

          <div className="text-center">
            <h1 className="text-2xl font-bold">
              AI Trade
            </h1>

            <p className="text-sm text-cyan-400">
              Real-Time AI Trading
            </p>
          </div>

          <button
            type="button"
            className="w-11 h-11 rounded-full bg-[#101A2C] border border-slate-800 flex items-center justify-center hover:bg-[#16233D] transition"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* ENGINE */}

        <section className="mb-6 rounded-3xl bg-[#101A2C] border border-cyan-500/20 p-4">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                <Bot
                  size={21}
                  className="text-cyan-400"
                />
              </div>

              <div>
                <p className="font-semibold">
                  AI Trading Engine
                </p>

                <p className="text-xs text-gray-400">
                  Live Market • AI Orders
                </p>
              </div>

            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400" />

              <span className="text-xs font-semibold text-green-400">
                LIVE
              </span>
            </div>

          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">

            <div className="bg-[#0B1220] rounded-2xl p-4">
              <p className="text-xs text-gray-500">
                Market Data
              </p>

              <p className="text-lg font-bold mt-1 text-green-400">
                REAL-TIME
              </p>
            </div>

            <div className="bg-[#0B1220] rounded-2xl p-4">
              <p className="text-xs text-gray-500">
                AI Orders
              </p>

              <p className="text-lg font-bold mt-1 text-cyan-400">
                {aiTrading.orderCount}
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={() =>
              void loadMarket()
            }
            disabled={marketLoading}
            className="w-full mt-3 rounded-2xl bg-[#16233D] border border-slate-700 py-3 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                marketLoading
                  ? "animate-spin"
                  : ""
              }
            />

            {marketLoading
              ? "Refreshing..."
              : "Refresh Market"}
          </button>

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
                Intelligent Automated Trading
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

          {/* ENGINE INFO */}

          <div className="mt-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">

            <p className="text-sm font-semibold text-cyan-300">
              AI TRADING ENGINE
            </p>

            <p className="text-xs text-gray-300 mt-1 leading-5">
              AI analyzes real-time cryptocurrency market data and manages orders according to the configured trading strategy.
            </p>

          </div>

          {/* PROFIT */}

          <div className="mt-6">

            <p className="text-gray-400 text-sm">
              Trading Profit
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
              {aiTrading.totalProfit.toFixed(
                3,
              )}{" "}
              TON
            </h3>

            <p className="text-gray-500 mt-1">
              AI trading performance
            </p>

          </div>

          {/* COINS */}

          <div className="flex items-center justify-between mt-8">

            {[
              ["/coins/ton.png", "TON"],
              ["/coins/btc.png", "BTC"],
              ["/coins/eth.png", "ETH"],
              ["/coins/bnb.png", "BNB"],
              ["/coins/usdt.png", "USDT"],
            ].map(
              ([src, alt]) => (
                <Image
                  key={alt}
                  src={src}
                  alt={alt}
                  width={44}
                  height={44}
                />
              ),
            )}

          </div>

          {/* CONTROLS */}

          <div className="grid grid-cols-3 gap-3 mt-8">

            <button
              type="button"
              onClick={() =>
                void sendAction(
                  "START",
                )
              }
              disabled={loading}
              className="rounded-2xl bg-green-500 py-4 flex flex-col items-center text-white disabled:opacity-50"
            >
              <Play size={22} />

              <span className="mt-2 text-sm font-medium">
                Start
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                void sendAction(
                  "PAUSE",
                )
              }
              disabled={loading}
              className="rounded-2xl bg-yellow-500 py-4 flex flex-col items-center text-white disabled:opacity-50"
            >
              <Pause size={22} />

              <span className="mt-2 text-sm font-medium">
                Pause
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                void sendAction(
                  "STOP",
                )
              }
              disabled={loading}
              className="rounded-2xl bg-red-500 py-4 flex flex-col items-center text-white disabled:opacity-50"
            >
              <Square size={22} />

              <span className="mt-2 text-sm font-medium">
                Stop
              </span>
            </button>

          </div>

          {/* ANALYZE */}

          <button
            type="button"
            onClick={() =>
              void runAnalysis()
            }
            disabled={analysisLoading}
            className="w-full mt-3 rounded-2xl bg-cyan-500 py-4 flex items-center justify-center gap-3 text-white font-semibold disabled:opacity-50"
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

        {/* MARKET */}

        <section className="mt-6 bg-[#101A2C] border border-slate-800 rounded-3xl p-5">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-xl font-bold">
                Live Market
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Real-time public market data
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
                            {market.price.toLocaleString(
                              "en-US",
                              {
                                maximumFractionDigits: 8,
                              },
                            )}
                          </p>

                          <p
                            className={`text-xs mt-1 ${
                              (market.change24h ??
                                0) >= 0
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {(market.change24h ??
                              0) >= 0
                              ? "+"
                              : ""}
                            {(
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
              ),
            )}

            {prices.length === 0 && (
              <div className="bg-[#0B1220] rounded-2xl p-5 text-center text-gray-500 text-sm">
                Loading real-time market data...
              </div>
            )}

          </div>

        </section>

        {/* STATISTICS */}

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
              {aiTrading.todayProfit.toFixed(
                3,
              )}{" "}
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
                  aiTrading.winRate,
                  0,
                ),
                100,
              ).toFixed(0)}
              %
            </h3>

            <div className="mt-4 h-2 rounded-full bg-[#0B1220] overflow-hidden">

              <div
                className="h-2 rounded-full bg-cyan-400 transition-all"
                style={{
                  width: `${Math.min(
                    Math.max(
                      aiTrading.winRate,
                      0,
                    ),
                    100,
                  )}%`,
                }}
              />

            </div>

          </div>

          <div className="bg-[#101A2C] border border-slate-800 rounded-3xl p-5">

            <p className="text-gray-400 text-sm">
              Open Orders
            </p>

            <h3 className="text-3xl font-bold mt-3">
              {aiTrading.openTrades}
            </h3>

            <p className="text-xs text-gray-500 mt-4">
              {aiTrading.openTrades > 0
                ? "Active AI positions"
                : "No active orders"}
            </p>

          </div>

        </section>

        {/* ANALYSIS */}

        <section className="mt-6 rounded-3xl bg-gradient-to-br from-cyan-600 to-blue-700 p-6">

          <div className="flex items-center justify-between gap-3 mb-5">

            <div className="flex items-center gap-3">

              <Bot size={30} />

              <div>
                <h2 className="text-xl font-bold">
                  AI Market Analysis
                </h2>

                <p className="text-xs text-blue-100 mt-1">
                  Real-time market intelligence
                </p>
              </div>

            </div>

            <span
              className={`px-3 py-1.5 rounded-full border text-xs font-bold ${signalColor}`}
            >
              {signal}
            </span>

          </div>

          <div className="bg-black/20 rounded-2xl p-4">

            <p className="text-xs text-blue-100">
              Current Signal
            </p>

            <p className="text-2xl font-bold mt-1">
              {signal}
            </p>

          </div>

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

          {analysis?.prices &&
            Object.keys(
              analysis.prices,
            ).length > 0 && (
              <div className="mt-4">

                <p className="text-xs text-blue-100 mb-3">
                  Market Prices
                </p>

                <div className="grid grid-cols-2 gap-2">

                  {Object.entries(
                    analysis.prices,
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
                              price,
                            ).toLocaleString(
                              "en-US",
                              {
                                maximumFractionDigits: 8,
                              },
                            )}
                          </span>

                        </div>
                      </div>
                    ),
                  )}

                </div>

              </div>
            )}

          {analysis?.timestamp && (
            <p className="text-[11px] text-blue-100 mt-4 text-center">
              Last analysis:{" "}
              {new Date(
                analysis.timestamp,
              ).toLocaleString()}
            </p>
          )}

        </section>

        {/* OPEN ORDERS */}

        <section className="mt-6 bg-[#101A2C] border border-slate-800 rounded-3xl p-5">

          <div className="flex items-center justify-between">

            <h2 className="text-xl font-bold">
              Open Orders
            </h2>

            <span className="text-cyan-400 text-sm">
              {openTrades.length}
            </span>

          </div>

          <div className="space-y-3 mt-5">

            {openTrades
              .slice(0, 10)
              .map((trade) => (
                <div
                  key={trade.id}
                  className="bg-[#0B1220] rounded-2xl p-4"
                >

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="font-semibold">
                        {trade.pair}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        {trade.side} • AI ORDER
                      </p>
                    </div>

                    <div className="text-right">

                      <p
                        className={`font-semibold ${
                          trade.profit >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {trade.profit >= 0
                          ? "+"
                          : ""}
                        {trade.profit.toFixed(
                          4,
                        )}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        PnL
                      </p>

                    </div>

                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">

                    <div>
                      <p className="text-[11px] text-gray-500">
                        Entry
                      </p>

                      <p className="text-sm font-semibold">
                        $
                        {trade.entryPrice.toLocaleString(
                          "en-US",
                          {
                            maximumFractionDigits: 8,
                          },
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[11px] text-gray-500">
                        Current
                      </p>

                      <p className="text-sm font-semibold">
                        $
                        {trade.currentPrice.toLocaleString(
                          "en-US",
                          {
                            maximumFractionDigits: 8,
                          },
                        )}
                      </p>
                    </div>

                  </div>

                </div>
              ))}

            {openTrades.length === 0 && (
              <div className="bg-[#0B1220] rounded-2xl p-5 text-center">

                <p className="text-gray-400">
                  No open orders.
                </p>

                <p className="text-xs text-gray-500 mt-2">
                  Start AI Trading to allow the engine to manage orders.
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
            Assets monitored by AI Trading
          </p>

          <div className="flex items-center justify-between mt-6">

            {[
              ["/coins/ton.png", "TON"],
              ["/coins/btc.png", "BTC"],
              ["/coins/eth.png", "ETH"],
              ["/coins/bnb.png", "BNB"],
              ["/coins/usdt.png", "USDT"],
            ].map(
              ([src, alt]) => (
                <Image
                  key={alt}
                  src={src}
                  alt={alt}
                  width={38}
                  height={38}
                />
              ),
            )}

          </div>

        </section>

        {/* CHART */}

        <section className="mt-6">
          <TradingChart
            symbol="BTCUSDT"
            category="spot"
          />
        </section>

        {/* RECENT ORDERS */}

        <section className="mt-6 bg-[#101A2C] border border-slate-800 rounded-3xl p-5">

          <div className="flex items-center justify-between mb-5">

            <h2 className="text-xl font-bold">
              Recent AI Orders
            </h2>

            <span className="text-cyan-400 text-sm">
              Live
            </span>

          </div>

          <div className="space-y-4">

            {trades.length === 0 ? (
              <div className="bg-[#0B1220] rounded-2xl p-5 text-center">

                <p className="text-gray-400">
                  No orders yet.
                </p>

                <p className="text-xs text-gray-500 mt-2">
                  AI Trading orders will appear here.
                </p>

              </div>
            ) : (
              trades
                .slice(0, 10)
                .map((trade) => {
                  const coinFile =
                    trade.coin
                      .toLowerCase()
                      .replace(
                        /[^a-z0-9]/g,
                        "",
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
                            event,
                          ) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />

                        <div className="min-w-0">

                          <p className="font-semibold truncate">
                            {trade.pair}
                          </p>

                          <p className="text-xs text-gray-400">
                            {trade.side} • AI ORDER
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
                })
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
                AI Trading uses real-time public market data.
              </p>

            </div>

            <div className="flex items-center gap-3">

              <ShieldCheck
                size={22}
                className="text-green-400 shrink-0"
              />

              <p className="text-gray-300">
                Trading decisions are recorded in AI TONKEEPER.
              </p>

            </div>

            <div className="flex items-center gap-3">

              <ShieldCheck
                size={22}
                className="text-green-400 shrink-0"
              />

              <p className="text-gray-300">
                Orders and positions are tracked with their current market prices.
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