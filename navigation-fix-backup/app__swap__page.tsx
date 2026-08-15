"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowDownUp, ChevronDown, RefreshCw } from "lucide-react";

const assets = [
  {
    symbol: "TON",
    name: "Toncoin",
    icon: "/coins/ton.png",
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    icon: "/coins/btc.png",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    icon: "/coins/eth.png",
  },
  {
    symbol: "BNB",
    name: "BNB Smart Chain",
    icon: "/coins/bnb.png",
  },
  {
    symbol: "USDT",
    name: "Tether",
    icon: "/coins/usdt.png",
  },
];

type RateData = {
  from: string;
  to: string;
  fromUsd: number;
  toUsd: number;
  rate: number;
  source: string;
  timestamp: string;
};

export default function SwapPage() {
  const [fromAsset, setFromAsset] = useState("TON");
  const [toAsset, setToAsset] = useState("USDT");
  const [amount, setAmount] = useState("");

  const [rateData, setRateData] = useState<RateData | null>(null);

  const [loadingRate, setLoadingRate] = useState(true);

  const [rateError, setRateError] = useState("");

  const [processing, setProcessing] = useState(false);

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );

  const [pendingSwapId, setPendingSwapId] = useState("");

  const [showConfirmation, setShowConfirmation] = useState(false);

  const fromCoin = useMemo(
    () => assets.find((coin) => coin.symbol === fromAsset) || assets[0],
    [fromAsset],
  );

  const toCoin = useMemo(
    () => assets.find((coin) => coin.symbol === toAsset) || assets[0],
    [toAsset],
  );

  async function loadRate() {
    if (fromAsset === toAsset) {
      setRateData(null);
      setRateError(
        "Source and destination cryptocurrencies must be different.",
      );
      setLoadingRate(false);
      return;
    }

    try {
      setLoadingRate(true);
      setRateError("");

      const response = await fetch(
        `/api/swap/rate?from=${encodeURIComponent(
          fromAsset,
        )}&to=${encodeURIComponent(toAsset)}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to retrieve live rate.");
      }

      setRateData(data);
    } catch (error) {
      setRateData(null);

      setRateError(
        error instanceof Error
          ? error.message
          : "Unable to retrieve live rate.",
      );
    } finally {
      setLoadingRate(false);
    }
  }

  useEffect(() => {
    loadRate();

    const interval = setInterval(loadRate, 15000);

    return () => clearInterval(interval);
  }, [fromAsset, toAsset]);

  function handleSwapAssets() {
    const previousFrom = fromAsset;

    setFromAsset(toAsset);
    setToAsset(previousFrom);

    setMessage("");
    setPendingSwapId("");
    setShowConfirmation(false);
  }

  const numericAmount = Number(amount);

  const estimatedAmount =
    rateData && Number.isFinite(numericAmount) && numericAmount > 0
      ? numericAmount * rateData.rate
      : 0;

  async function createSwapRequest() {
    setMessage("");

    if (!rateData) {
      setMessageType("error");
      setMessage("Live rate is not available yet.");
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setMessageType("error");
      setMessage(`Enter a valid ${fromAsset} amount.`);
      return;
    }

    try {
      setProcessing(true);

      const response = await fetch("/api/swap", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromCoin: fromAsset,
          toCoin: toAsset,
          fromAmount: numericAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to create Swap request.");
      }

      setPendingSwapId(data.request.id);

      setShowConfirmation(true);
    } catch (error) {
      setMessageType("error");

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to create Swap request.",
      );
    } finally {
      setProcessing(false);
    }
  }

  async function executeSwap() {
    if (!pendingSwapId) {
      setMessageType("error");
      setMessage("Swap request is missing.");
      return;
    }

    try {
      setProcessing(true);
      setMessage("");

      const response = await fetch("/api/swap/execute", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          swapId: pendingSwapId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to execute Swap.");
      }

      setShowConfirmation(false);
      setPendingSwapId("");
      setAmount("");

      setMessageType("success");

      setMessage(
        `Swap completed successfully: ${numericAmount} ${fromAsset} → ${data.swap.toAmount} ${toAsset}.`,
      );
    } catch (error) {
      setMessageType("error");

      setMessage(
        error instanceof Error ? error.message : "Unable to execute Swap.",
      );
    } finally {
      setProcessing(false);
    }
  }

  function cancelConfirmation() {
    setShowConfirmation(false);
    setPendingSwapId("");
    setMessageType("error");
    setMessage("Swap cancelled.");
  }

  return (
    <main className="min-h-screen bg-[#050B18] text-white">
      <div className="max-w-md mx-auto px-5 py-6">
        {/* Header */}

        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            className="w-12 h-12 rounded-2xl bg-[#101A2C] border border-slate-800 flex items-center justify-center"
          >
            <ArrowLeft size={22} />
          </button>

          <h1 className="text-2xl font-bold">Swap Crypto</h1>

          <button
            type="button"
            onClick={loadRate}
            disabled={loadingRate}
            className="w-12 h-12 rounded-2xl bg-[#101A2C] border border-slate-800 flex items-center justify-center"
          >
            <RefreshCw
              size={22}
              className={loadingRate ? "animate-spin" : ""}
            />
          </button>
        </div>

        {/* Message */}

        {message && (
          <div
            className={`mb-6 rounded-2xl border p-4 text-sm ${
              messageType === "error"
                ? "border-red-500/30 bg-red-500/10 text-red-400"
                : "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
            }`}
          >
            {message}
          </div>
        )}

        {/* Swap Card */}

        <div className="rounded-3xl bg-gradient-to-r from-cyan-600 to-blue-700 p-5">
          <h2 className="text-xl font-bold">Instant Crypto Swap</h2>

          <p className="text-blue-100 text-sm mt-2">
            Exchange your cryptocurrencies instantly inside AI TONKEEPER.
          </p>

          {/* FROM */}

          <div className="mt-6 rounded-2xl bg-white/10 p-4">
            <p className="text-sm text-blue-100 mb-3">You Send</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src={fromCoin.icon}
                  alt={fromCoin.symbol}
                  width={46}
                  height={46}
                />

                <div>
                  <p className="font-bold">{fromCoin.symbol}</p>

                  <p className="text-sm text-blue-100">{fromCoin.name}</p>
                </div>
              </div>

              <ChevronDown size={22} />
            </div>
          </div>

          {/* Swap Button */}

          <div className="flex justify-center my-5">
            <button
              type="button"
              onClick={handleSwapAssets}
              className="w-14 h-14 rounded-full bg-white text-blue-700 flex items-center justify-center shadow-lg hover:rotate-180 transition duration-300"
            >
              <ArrowDownUp size={26} />
            </button>
          </div>

          {/* TO */}

          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-sm text-blue-100 mb-3">You Receive</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src={toCoin.icon}
                  alt={toCoin.symbol}
                  width={46}
                  height={46}
                />

                <div>
                  <p className="font-bold">{toCoin.symbol}</p>

                  <p className="text-sm text-blue-100">{toCoin.name}</p>
                </div>
              </div>

              <ChevronDown size={22} />
            </div>
          </div>
        </div>

        {/* Swap Details */}

        <div className="mt-6 bg-[#101A2C] border border-slate-800 rounded-3xl p-5">
          <h2 className="text-lg font-bold mb-5">Swap Details</h2>

          <label className="text-sm text-gray-400">From</label>

          <select
            value={fromAsset}
            onChange={(e) => setFromAsset(e.target.value)}
            className="mt-2 w-full rounded-2xl bg-[#0B1220] border border-slate-700 px-5 py-4 text-white outline-none focus:border-cyan-500"
          >
            {assets.map((coin) => (
              <option key={coin.symbol} value={coin.symbol}>
                {coin.symbol} - {coin.name}
              </option>
            ))}
          </select>

          <label className="block mt-5 text-sm text-gray-400">To</label>

          <select
            value={toAsset}
            onChange={(e) => setToAsset(e.target.value)}
            className="mt-2 w-full rounded-2xl bg-[#0B1220] border border-slate-700 px-5 py-4 text-white outline-none focus:border-cyan-500"
          >
            {assets.map((coin) => (
              <option key={coin.symbol} value={coin.symbol}>
                {coin.symbol} - {coin.name}
              </option>
            ))}
          </select>

          <label className="block mt-5 text-sm text-gray-400">Amount</label>

          <input
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Enter ${fromAsset} amount`}
            className="mt-2 w-full rounded-2xl bg-[#0B1220] border border-slate-700 px-5 py-4 text-white outline-none focus:border-cyan-500"
          />
        </div>

        {/* Swap Summary */}

        <div className="mt-6 bg-[#101A2C] border border-slate-800 rounded-3xl p-5">
          <h2 className="text-lg font-bold mb-5">Swap Summary</h2>

          <div className="space-y-4">
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">From</span>

              <div className="flex items-center gap-2">
                <Image
                  src={fromCoin.icon}
                  alt={fromCoin.symbol}
                  width={24}
                  height={24}
                />

                <span className="font-semibold">
                  {amount || "0"} {fromCoin.symbol}
                </span>
              </div>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-400">To</span>

              <div className="flex items-center gap-2">
                <Image
                  src={toCoin.icon}
                  alt={toCoin.symbol}
                  width={24}
                  height={24}
                />

                <span className="font-semibold">
                  {loadingRate
                    ? "Loading..."
                    : estimatedAmount > 0
                      ? `${estimatedAmount.toFixed(8)} ${toCoin.symbol}`
                      : `0 ${toCoin.symbol}`}
                </span>
              </div>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Exchange Rate</span>

              <span className="font-semibold text-right">
                {loadingRate
                  ? "Loading..."
                  : rateData
                    ? `1 ${fromAsset} ≈ ${rateData.rate.toLocaleString(
                        "en-US",
                        {
                          maximumFractionDigits: 8,
                        },
                      )} ${toAsset}`
                    : "Unavailable"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Market Price</span>

              <span className="font-semibold text-right">
                {rateData
                  ? `$${rateData.fromUsd.toLocaleString("en-US", {
                      maximumFractionDigits: 8,
                    })} / ${fromAsset}`
                  : "Unavailable"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Network Fee</span>

              <span className="font-semibold">Calculated Automatically</span>
            </div>
          </div>

          {rateError && (
            <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {rateError}
            </div>
          )}

          <button
            type="button"
            disabled={processing || loadingRate || !rateData}
            onClick={createSwapRequest}
            className="w-full mt-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 text-lg font-bold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? "Processing..." : "Swap Now"}
          </button>
        </div>

        {/* Confirmation */}

        {showConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5">
            <div className="w-full max-w-md rounded-3xl bg-[#101A2C] border border-slate-700 p-6 shadow-2xl">
              <h2 className="text-xl font-bold">Confirm Swap</h2>

              <p className="text-slate-400 text-sm mt-2">
                Review the transaction before your balance is changed.
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">You send</span>

                  <span className="font-bold">
                    {numericAmount} {fromAsset}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">You receive</span>

                  <span className="font-bold">
                    {estimatedAmount.toFixed(8)} {toAsset}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Rate</span>

                  <span className="font-semibold text-right">
                    1 {fromAsset} ≈{" "}
                    {rateData?.rate.toLocaleString("en-US", {
                      maximumFractionDigits: 8,
                    })}{" "}
                    {toAsset}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Fee</span>

                  <span className="font-semibold">0 {fromAsset}</span>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-300">
                Your {fromAsset} balance will be debited and your {toAsset}{" "}
                balance will be credited after confirmation.
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  type="button"
                  onClick={cancelConfirmation}
                  disabled={processing}
                  className="rounded-2xl border border-slate-700 bg-[#0B1220] py-4 font-semibold hover:border-slate-500 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={executeSwap}
                  disabled={processing}
                  className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 font-bold hover:opacity-90 disabled:opacity-50"
                >
                  {processing ? "Executing..." : "Confirm Swap"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Swap Information */}

        <div className="mt-6 rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-5">
          <h3 className="text-cyan-400 text-lg font-bold">Swap Information</h3>

          <ul className="mt-3 space-y-2 text-sm text-gray-300">
            <li>• Swap between TON, BTC, ETH, BNB and USDT.</li>

            <li>• Exchange rates are retrieved from live market data.</li>

            <li>• Rates refresh automatically every 15 seconds.</li>

            <li>• Network fees will be calculated before final execution.</li>

            <li>
              • Every Swap request is recorded in your transaction history.
            </li>
          </ul>
        </div>

        {/* Security Notice */}

        <div className="mt-6 rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-5">
          <h3 className="text-yellow-400 text-lg font-bold">Security Notice</h3>

          <ul className="mt-3 space-y-2 text-sm text-gray-300">
            <li>
              • Double-check the selected cryptocurrencies before confirming.
            </li>

            <li>• Confirm the amount before starting the Swap.</li>

            <li>
              • Your balance is not changed until the Swap is successfully
              processed.
            </li>

            <li>
              • AI TONKEEPER protects every transaction using advanced security.
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
