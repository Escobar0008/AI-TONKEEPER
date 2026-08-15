"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ChevronDown,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

const assets = [
  {
    symbol: "TON",
    name: "Toncoin",
    icon: "/coins/ton.png",
    price: 0,
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    icon: "/coins/btc.png",
    price: 0,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    icon: "/coins/eth.png",
    price: 0,
  },
  {
    symbol: "BNB",
    name: "BNB",
    icon: "/coins/bnb.png",
    price: 0,
  },
  {
    symbol: "USDT",
    name: "Tether (TRC20)",
    icon: "/coins/usdt.png",
    price: 1,
  },
];

const fiatCurrencies = [
  "USD",
  "EUR",
  "GBP",
];
const onramperBuyUrl = "https://onramper.com/buy";
export default function BuyPage() {
  const [asset, setAsset] = useState("TON");
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState("");
const [orderId, setOrderId] = useState("");
const [creatingOrder, setCreatingOrder] = useState(false);
const [orderMessage, setOrderMessage] = useState("");
const [verifyOrderId, setVerifyOrderId] = useState("");
const [verifyMessage, setVerifyMessage] = useState("");
const current = useMemo(
    () => assets.find((coin) => coin.symbol === asset) || assets[0],
    [asset]
  );
const createOrder = async () => {
  if (!amount || Number(amount) <= 0) {
    setOrderMessage("Please enter a valid amount.");
    return;
  }

  try {
    setCreatingOrder(true);
    setOrderMessage("");

    const res = await fetch("/api/buy/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        asset,
        currency,
        amount: Number(amount),
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      setOrderMessage(data.message || "Unable to create order.");
      return;
    }

    setOrderId(data.orderId);
     setVerifyOrderId(data.orderId);
    setOrderMessage("Order created successfully.");

window.location.href = onramperBuyUrl;
  } catch (error) {
    console.error(error);
    setOrderMessage("Something went wrong.");
  } finally {
    setCreatingOrder(false);
  }
};
const verifyOrder = () => {
  if (!verifyOrderId.trim()) {
    setVerifyMessage("Please enter your Order ID.");
    return;
  }

  if (orderId && verifyOrderId.trim() === orderId) {
    setVerifyMessage(
      "Order ID found. Please confirm the purchase transaction before crediting the balance."
    );
  } else {
    setVerifyMessage(
      "Order ID not found in the current session."
    );
  }
};
return (
    <main className="min-h-screen bg-[#050B18] text-white">
      <div className="max-w-md mx-auto px-5 py-6">

        {/* Header */}

        <div className="flex items-center justify-between mb-6">

          <button className="w-12 h-12 rounded-2xl bg-[#101A2C] border border-slate-800 flex items-center justify-center">
            <ArrowLeft size={22} />
          </button>

          <h1 className="text-2xl font-bold">
            Buy Crypto
          </h1>

          <button className="w-12 h-12 rounded-2xl bg-[#101A2C] border border-slate-800 flex items-center justify-center">
            <CreditCard size={22} />
          </button>

        </div>

        {/* Buy Card */}

        <div className="rounded-3xl bg-gradient-to-r from-cyan-600 to-blue-700 p-5">

          <div className="flex items-center gap-4">

            <Image
              src={current.icon}
              alt={current.symbol}
              width={60}
              height={60}
            />

            <div>

              <h2 className="text-xl font-bold">
                Buy {current.symbol}
              </h2>

              <p className="text-blue-100 text-sm mt-1">
                Purchase crypto securely using an external payment provider.
              </p>

            </div>

          </div>

          <div className="mt-5 flex items-center gap-2 text-sm text-blue-100">

            <ShieldCheck size={18} />

            <span>
              Secure purchase • Fast processing • Order ID generated
            </span>

          </div>

        </div>
        {/* Select Crypto */}

        <div className="mt-6 bg-[#101A2C] border border-slate-800 rounded-3xl p-5">

          <div className="flex items-center justify-between mb-4">

            <h2 className="text-lg font-bold">
              Select Cryptocurrency
            </h2>

            <ChevronDown size={20} className="text-gray-400" />

          </div>

          <div className="space-y-3">

            {assets.map((coin) => (

              <button
                key={coin.symbol}
                onClick={() => setAsset(coin.symbol)}
                className={`w-full flex items-center justify-between rounded-2xl p-4 border transition ${
                  asset === coin.symbol
                    ? "bg-[#16233D] border-cyan-500"
                    : "bg-[#0B1220] border-slate-700"
                }`}
              >

                <div className="flex items-center gap-3">

                  <Image
                    src={coin.icon}
                    alt={coin.symbol}
                    width={42}
                    height={42}
                    className="rounded-full"
                  />

                  <div className="text-left">

                    <p className="font-semibold">
                      {coin.name}
                    </p>

                    <p className="text-xs text-gray-400">
                      {coin.symbol}
                    </p>

                  </div>

                </div>

                {asset === coin.symbol && (
                  <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
                )}

              </button>

            ))}

          </div>

        </div>
        {/* Purchase Details */}

        <div className="mt-6 bg-[#101A2C] border border-slate-800 rounded-3xl p-5">

          <h2 className="text-lg font-bold mb-5">
            Purchase Details
          </h2>

          {/* Amount */}

          <div>

            <label className="text-sm text-gray-400">
              Amount
            </label>

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="mt-2 w-full rounded-2xl bg-[#0B1220] border border-slate-700 px-5 py-4 text-white outline-none focus:border-cyan-500"
            />

          </div>

          {/* Currency */}

          <div className="mt-5">

            <label className="text-sm text-gray-400">
              Payment Currency
            </label>

            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="mt-2 w-full rounded-2xl bg-[#0B1220] border border-slate-700 px-5 py-4 text-white outline-none focus:border-cyan-500"
            >
              {fiatCurrencies.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

          </div>

          {/* Wallet Destination */}

          <div className="mt-6 rounded-2xl bg-[#0B1220] border border-slate-700 p-4">

            <div className="flex items-center gap-3">

              <Image
                src={current.icon}
                alt={current.symbol}
                width={36}
                height={36}
              />

              <div>

                <p className="text-sm text-gray-400">
                  Destination Wallet
                </p>

                <p className="font-semibold">
                  AI TONKEEPER Main Wallet
                </p>

              </div>

            </div>

            <p className="text-xs text-gray-500 mt-4">
              After your purchase is confirmed, the selected cryptocurrency will
              be processed through the AI TONKEEPER main wallet and credited to
              your AI TONKEEPER account.
            </p>

          </div>

        </div>
        {/* Order Summary */}

        <div className="mt-6 bg-[#101A2C] border border-slate-800 rounded-3xl p-5">

          <h2 className="text-lg font-bold mb-5">
            Order Summary
          </h2>

          <div className="space-y-4">

            <div className="flex justify-between">

              <span className="text-gray-400">
                Cryptocurrency
              </span>

              <div className="flex items-center gap-2">

                <Image
                  src={current.icon}
                  alt={current.symbol}
                  width={22}
                  height={22}
                />

                <span className="font-semibold">
                  {current.symbol}
                </span>

              </div>

            </div>

            <div className="flex justify-between">

              <span className="text-gray-400">
                Amount
              </span>

              <span className="font-semibold">
                {amount || "0"} {currency}
              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-gray-400">
                Payment
              </span>

              <span className="font-semibold">
                External Provider
              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-gray-400">
                Order ID
              </span>

              <span className="font-mono text-cyan-400">
                Generated Automatically
              </span>

            </div>

          </div>

          <button
  onClick={createOrder}
  disabled={creatingOrder}
  className="w-full mt-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 text-lg font-bold hover:opacity-90 transition disabled:opacity-50"
>
  {creatingOrder ? "Creating Order..." : `Buy ${current.symbol}`}
</button>
{orderMessage && (
  <div className="mt-4 rounded-2xl bg-[#0B1220] border border-slate-700 p-4 text-sm">
    <p className="text-gray-300">
      {orderMessage}
    </p>

    {orderId && (
      <p className="mt-2 font-mono text-cyan-400 break-all">
        Order ID: {orderId}
      </p>
    )}
  </div>
)}
        </div>

        {/* Information */}

        <div className="mt-6 rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-5">

          <h3 className="font-bold text-cyan-400">
            Purchase Information
          </h3>

          <ul className="mt-3 space-y-2 text-sm text-gray-300">

            <li>
              • Select the cryptocurrency you want to purchase.
            </li>

            <li>
              • An Order ID will be generated before payment.
            </li>

            <li>
              • Complete payment with the selected external provider.
            </li>

            <li>
              • Return to AI TONKEEPER and verify your Order ID.
            </li>

            <li>
              • After verification, the purchase will be reviewed before the balance is credited.
            </li>

          </ul>

        </div>
        {/* Order Verification */}

        <div className="mt-6 bg-[#101A2C] border border-slate-800 rounded-3xl p-5">

          <h2 className="text-lg font-bold">
            Order Verification
          </h2>

          <p className="text-sm text-gray-400 mt-2">
            After completing your purchase, enter your Order ID to request a purchase review.
          </p>

          <input
  type="text"
  value={verifyOrderId}
  onChange={(e) => setVerifyOrderId(e.target.value)}
  placeholder="Enter your Order ID"
  className="mt-5 w-full rounded-2xl bg-[#0B1220] border border-slate-700 px-5 py-4 text-white outline-none focus:border-cyan-500"
/>

          <button
  onClick={verifyOrder}
  disabled={!verifyOrderId.trim()}
  className="w-full mt-5 rounded-2xl bg-cyan-600 hover:bg-cyan-700 py-4 font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
>
  Verify Order
</button>
{verifyMessage && (
  <div className="mt-4 rounded-2xl bg-[#0B1220] border border-slate-700 p-4 text-sm text-gray-300">
    {verifyMessage}
  </div>
)}
        </div>

        {/* Security Notice */}

        <div className="mt-6 rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-5">

          <h3 className="text-yellow-400 text-lg font-bold">
            Security Notice
          </h3>

          <ul className="mt-3 space-y-2 text-sm text-gray-300">

            <li>
              • Never share your Order ID with anyone.
            </li>

            <li>
              • Purchases are credited only after successful verification.
            </li>

            <li>
              • AI TONKEEPER does not ask users to connect a personal wallet.
            </li>

            <li>
              • All purchases are processed through the AI TONKEEPER main wallet.
            </li>

          </ul>

        </div>

      </div>

    </main>

  );
}