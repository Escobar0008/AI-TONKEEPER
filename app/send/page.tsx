"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ChevronDown,
  QrCode,
  User,
  FileText,
} from "lucide-react";

type AssetSymbol = "TON" | "BTC" | "ETH" | "USDT" | "BNB";

type Balances = Record<AssetSymbol, number>;

type SendResponse = {
  success?: boolean;
  message?: string;
  withdrawalId?: string;
  transactionId?: string;
  coin?: AssetSymbol;
  amount?: number;
  fee?: number;
  total?: number;
  status?: string;
};

type BalanceResponse = {
  success?: boolean;
  message?: string;
  balances?: Partial<Balances>;
};

const assets: {
  symbol: AssetSymbol;
  name: string;
  fee: number;
  icon: string;
}[] = [
  {
    symbol: "TON",
    name: "Toncoin",
    fee: 0.005,
    icon: "/coins/ton.png",
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    fee: 0.00001,
    icon: "/coins/btc.png",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    fee: 0.0005,
    icon: "/coins/eth.png",
  },
  {
    symbol: "USDT",
    name: "Tether",
    fee: 1,
    icon: "/coins/usdt.png",
  },
  {
    symbol: "BNB",
    name: "BNB",
    fee: 0.0005,
    icon: "/coins/bnb.png",
  },
];

const emptyBalances: Balances = {
  TON: 0,
  BTC: 0,
  ETH: 0,
  USDT: 0,
  BNB: 0,
};

function normalizeBalances(
  balances?: Partial<Balances>
): Balances {
  return {
    TON: Number(balances?.TON ?? 0),
    BTC: Number(balances?.BTC ?? 0),
    ETH: Number(balances?.ETH ?? 0),
    USDT: Number(balances?.USDT ?? 0),
    BNB: Number(balances?.BNB ?? 0),
  };
}

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `Server returned an invalid response (${response.status}).`
    );
  }
}

export default function SendPage() {
  const [asset, setAsset] =
    useState<AssetSymbol>("TON");

  const [address, setAddress] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [balances, setBalances] =
    useState<Balances>(emptyBalances);

  const [loadingBalances, setLoadingBalances] =
    useState(true);

  const [balanceError, setBalanceError] =
    useState("");

  const [sending, setSending] =
    useState(false);

  const [sendError, setSendError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [transactionId, setTransactionId] =
    useState("");

  const [withdrawalId, setWithdrawalId] =
    useState("");

  /*
   * ============================================================
   * CURRENT ASSET
   * ============================================================
   */

  const current = useMemo(() => {
    return (
      assets.find(
        (item) => item.symbol === asset
      ) || assets[0]
    );
  }, [asset]);

  /*
   * ============================================================
   * CURRENT REAL BALANCE
   * ============================================================
   */

  const currentBalance =
    Number(balances[current.symbol]) || 0;

  /*
   * ============================================================
   * FEE
   * ============================================================
   */

  const networkFee = current.fee;

  /*
   * ============================================================
   * AMOUNT
   * ============================================================
   */

  const receiveAmount =
    amount.trim() === ""
      ? 0
      : Number(amount);

  /*
   * ============================================================
   * TOTAL
   * ============================================================
   */

  const total =
    Number.isFinite(receiveAmount)
      ? receiveAmount + networkFee
      : networkFee;

  /*
   * ============================================================
   * MAX SENDABLE AMOUNT
   *
   * Balance - network fee
   * ============================================================
   */

  const maxAmount = Math.max(
    currentBalance - networkFee,
    0
  );

  /*
   * ============================================================
   * LOAD BALANCES
   * ============================================================
   */

  async function loadBalances(
    showLoading = true
  ) {
    try {
      if (showLoading) {
        setLoadingBalances(true);
      }

      setBalanceError("");

      const response = await fetch(
        "/api/send/balances",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data =
        await readJson<BalanceResponse>(
          response
        );

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to retrieve balances."
        );
      }

      setBalances(
        normalizeBalances(data.balances)
      );
    } catch (error) {
      console.error(
        "SEND BALANCES ERROR:",
        error
      );

      setBalanceError(
        error instanceof Error
          ? error.message
          : "Unable to retrieve balances."
      );
    } finally {
      if (showLoading) {
        setLoadingBalances(false);
      }
    }
  }

  /*
   * ============================================================
   * INITIAL BALANCE LOAD
   * ============================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      try {
        setLoadingBalances(true);
        setBalanceError("");

        const response = await fetch(
          "/api/send/balances",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const data =
          await readJson<BalanceResponse>(
            response
          );

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Unable to retrieve balances."
          );
        }

        if (!cancelled) {
          setBalances(
            normalizeBalances(
              data.balances
            )
          );
        }
      } catch (error) {
        console.error(
          "SEND PAGE BALANCES ERROR:",
          error
        );

        if (!cancelled) {
          setBalanceError(
            error instanceof Error
              ? error.message
              : "Unable to retrieve balances."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingBalances(false);
        }
      }
    }

    initialLoad();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * ============================================================
   * CHANGE ASSET
   * ============================================================
   */

  function handleAssetChange(
    newAsset: AssetSymbol
  ) {
    if (sending) {
      return;
    }

    setAsset(newAsset);
    setAmount("");

    setSendError("");
    setSuccessMessage("");
    setTransactionId("");
    setWithdrawalId("");
  }

  /*
   * ============================================================
   * SET MAX
   * ============================================================
   */

  function handleMax() {
    if (
      loadingBalances ||
      sending ||
      maxAmount <= 0
    ) {
      return;
    }

    setAmount(
      maxAmount.toString()
    );

    setSendError("");
    setSuccessMessage("");
  }

  /*
   * ============================================================
   * SEND
   * ============================================================
   */

  async function handleSend() {
    if (sending) {
      return;
    }

    setSendError("");
    setSuccessMessage("");
    setTransactionId("");
    setWithdrawalId("");

    /*
     * ADDRESS
     */

    const cleanAddress =
      address.trim();

    if (!cleanAddress) {
      setSendError(
        "Please enter the recipient address."
      );
      return;
    }

    if (
      cleanAddress.length < 10 ||
      cleanAddress.length > 200
    ) {
      setSendError(
        "Invalid recipient address."
      );
      return;
    }

    /*
     * AMOUNT
     */

    const numericAmount =
      Number(amount);

    if (
      !Number.isFinite(
        numericAmount
      ) ||
      numericAmount <= 0
    ) {
      setSendError(
        "Please enter a valid amount."
      );
      return;
    }

    /*
     * BALANCE
     */

    if (
      numericAmount >
      maxAmount
    ) {
      setSendError(
        `Insufficient ${current.symbol} balance. Maximum available to send is ${maxAmount.toFixed(
          8
        )} ${current.symbol}.`
      );
      return;
    }

    /*
     * TOTAL
     */

    const calculatedTotal =
      numericAmount +
      networkFee;

    if (
      calculatedTotal >
      currentBalance
    ) {
      setSendError(
        `Insufficient ${current.symbol} balance. Required: ${calculatedTotal} ${current.symbol}. Available: ${currentBalance} ${current.symbol}.`
      );
      return;
    }

    /*
     * SEND
     */

    setSending(true);

    try {
      const response =
        await fetch(
          "/api/send",
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              coin: current.symbol,
              address: cleanAddress,
              amount: numericAmount,
            }),
          }
        );

      const data =
        await readJson<SendResponse>(
          response
        );

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to create send request."
        );
      }

      /*
       * SUCCESS
       */

      setSuccessMessage(
        data.message ||
          "Your send request has been created successfully."
      );

      setTransactionId(
        data.transactionId || ""
      );

      setWithdrawalId(
        data.withdrawalId || ""
      );

      /*
       * CLEAR FORM
       */

      setAddress("");
      setAmount("");

      /*
       * REFRESH BALANCES
       *
       * The current /api/send API creates
       * a PENDING request and does not
       * debit the balance yet.
       */

      await loadBalances(false);
    } catch (error) {
      console.error(
        "SEND PAGE ERROR:",
        error
      );

      setSendError(
        error instanceof Error
          ? error.message
          : "Unable to create send request."
      );
    } finally {
      setSending(false);
    }
  }

  /*
   * ============================================================
   * SEND BUTTON STATE
   * ============================================================
   */

  const sendDisabled =
    sending ||
    loadingBalances ||
    !address.trim() ||
    !amount.trim() ||
    !Number.isFinite(
      receiveAmount
    ) ||
    receiveAmount <= 0 ||
    total > currentBalance;

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <main className="min-h-screen bg-[#050B18] text-white">
      <div className="max-w-md mx-auto px-5 py-6">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-8">

          <button
            type="button"
            className="w-12 h-12 rounded-2xl bg-[#101A2C] border border-slate-800 flex items-center justify-center" onClick={() => window.history.back()}>
    <ArrowLeft size={24} />
  </button>

          <h1 className="text-3xl font-bold">
            Send
          </h1>

          <button
            type="button"
            className="w-12 h-12 rounded-2xl bg-[#101A2C] border border-slate-800 flex items-center justify-center"
          >
            <FileText size={22} />
          </button>

        </div>

        {/* SELECT ASSET */}

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
                className="h-auto w-auto"
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
                type="button"
                key={coin.symbol}
                onClick={() =>
                  handleAssetChange(
                    coin.symbol
                  )
                }
                disabled={sending}
                className={`min-w-[82px] rounded-2xl border p-3 transition ${
                  asset === coin.symbol
                    ? "border-cyan-500 bg-[#16233D]"
                    : "border-slate-700 bg-[#0B1424]"
                } disabled:opacity-50`}
              >

                <div className="flex flex-col items-center">

                  <Image
                    src={coin.icon}
                    alt={coin.symbol}
                    width={36}
                    height={36}
                    className="h-auto w-auto"
                  />

                  <span className="mt-2 text-sm font-semibold">
                    {coin.symbol}
                  </span>

                  <span className="mt-1 text-[10px] text-slate-500">
                    {balances[coin.symbol].toFixed(
                      4
                    )}
                  </span>

                </div>

              </button>

            ))}

          </div>

        </div>

        {/* RECIPIENT ADDRESS */}

        <div className="bg-[#101A2C] border border-slate-800 rounded-3xl p-5 mb-5">

          <p className="text-cyan-400 font-semibold mb-4">
            Recipient Address
          </p>

          <div className="flex items-center bg-[#0B1424] border border-slate-700 rounded-2xl">

            <input
              type="text"
              value={address}
              onChange={(e) => {
                setAddress(
                  e.target.value
                );
                setSendError("");
              }}
              placeholder={`Enter ${current.symbol} wallet address`}
              className="flex-1 min-w-0 bg-transparent px-4 py-4 text-white outline-none placeholder:text-slate-500"
              disabled={sending}
            />

            <button
              type="button"
              disabled={sending}
              className="px-4 text-cyan-400 hover:text-cyan-300 disabled:opacity-40"
            >
              <QrCode size={22} />
            </button>

            <div className="w-px h-7 bg-slate-700" />

            <button
              type="button"
              disabled={sending}
              className="px-4 text-cyan-400 hover:text-cyan-300 disabled:opacity-40"
            >
              <User size={22} />
            </button>

          </div>

          <p className="text-xs text-gray-500 mt-3">
            Verify the recipient address carefully before sending funds.
          </p>

        </div>

        {/* AMOUNT */}

        <div className="bg-[#101A2C] border border-slate-800 rounded-3xl p-5 mb-5">

          <div className="flex items-center justify-between mb-4">

            <p className="text-cyan-400 font-semibold">
              Amount
            </p>

            <p className="text-sm text-gray-400">

              {loadingBalances
                ? "Loading..."
                : `Balance: ${currentBalance.toFixed(
                    6
                  )} ${current.symbol}`}

            </p>

          </div>

          <div className="relative">

            <input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => {
                setAmount(
                  e.target.value
                );
                setSendError("");
              }}
              placeholder="0.00"
              className="w-full bg-[#0B1424] border border-slate-700 rounded-2xl px-5 py-5 pr-24 text-3xl font-bold text-white outline-none"
              disabled={sending}
            />

            <button
              type="button"
              onClick={handleMax}
              disabled={
                loadingBalances ||
                sending ||
                maxAmount <= 0
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 rounded-xl text-sm font-semibold"
            >
              Max
            </button>

          </div>

          <div className="flex justify-between mt-4 text-sm">

            <span className="text-gray-400">
              Network Fee
            </span>

            <span className="text-white">
              {networkFee}{" "}
              {current.symbol}
            </span>

          </div>

          <div className="flex justify-between mt-2 text-lg font-bold">

            <span>
              Total
            </span>

            <span className="text-cyan-400">
              {total.toFixed(6)}{" "}
              {current.symbol}
            </span>

          </div>

          {balanceError && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3">
              <p className="text-sm text-red-400">
                {balanceError}
              </p>
            </div>
          )}

        </div>

        {/* TRANSACTION SUMMARY */}

        <div className="bg-[#101A2C] border border-slate-800 rounded-3xl p-5 mb-5">

          <h2 className="text-lg font-bold mb-4">
            Transaction Summary
          </h2>

          <div className="space-y-3">

            <div className="flex justify-between gap-4">

              <span className="text-gray-400">
                Asset
              </span>

              <span className="font-semibold">
                {current.symbol}
              </span>

            </div>

            <div className="flex justify-between gap-4">

              <span className="text-gray-400">
                Amount
              </span>

              <span className="font-semibold">
                {Number.isFinite(
                  receiveAmount
                )
                  ? receiveAmount.toFixed(
                      6
                    )
                  : "0.000000"}{" "}
                {current.symbol}
              </span>

            </div>

            <div className="flex justify-between gap-4">

              <span className="text-gray-400">
                Network Fee
              </span>

              <span className="font-semibold">
                {networkFee}{" "}
                {current.symbol}
              </span>

            </div>

            <div className="border-t border-slate-700 pt-3 flex justify-between gap-4">

              <span className="font-bold">
                Total
              </span>

              <span className="text-cyan-400 font-bold">
                {total.toFixed(6)}{" "}
                {current.symbol}
              </span>

            </div>

          </div>

        </div>

        {/* ERROR */}

        {sendError && (
          <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">

            <p className="text-sm text-red-400">
              {sendError}
            </p>

          </div>
        )}

        {/* SUCCESS */}

        {successMessage && (
          <div className="mb-5 rounded-2xl border border-green-500/30 bg-green-500/10 p-4">

            <h3 className="font-bold text-green-400">
              Send request created
            </h3>

            <p className="mt-2 text-sm text-gray-300">
              {successMessage}
            </p>

            <div className="mt-3 space-y-2 text-xs text-gray-400">

              {withdrawalId && (
                <p>
                  Withdrawal ID:
                  <span className="ml-2 text-white break-all">
                    {withdrawalId}
                  </span>
                </p>
              )}

              {transactionId && (
                <p>
                  Transaction ID:
                  <span className="ml-2 text-white break-all">
                    {transactionId}
                  </span>
                </p>
              )}

              <p>
                Status:
                <span className="ml-2 text-yellow-400">
                  PENDING
                </span>
              </p>

            </div>

          </div>
        )}

        {/* SEND BUTTON */}

        <button
          type="button"
          onClick={handleSend}
          disabled={sendDisabled}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {sending
            ? "Processing..."
            : `Send ${current.symbol}`}
        </button>

        {/* SECURITY NOTICE */}

        <div className="mt-6 rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-5">

          <h3 className="text-yellow-400 text-lg font-bold">
            Security Notice
          </h3>

          <ul className="mt-3 space-y-2 text-sm text-gray-300">

            <li>
              â€¢ Double-check the recipient address before sending.
            </li>

            <li>
              â€¢ Blockchain transactions cannot be cancelled.
            </li>

            <li>
              â€¢ Network fees are automatically deducted.
            </li>

            <li>
              â€¢ Your withdrawal request will be securely processed by AI TONKEEPER.
            </li>

            <li>
              â€¢ Outgoing transactions are processed from the AI TONKEEPER main wallet after validation.
            </li>

          </ul>

        </div>

      </div>
    </main>
  );
}
