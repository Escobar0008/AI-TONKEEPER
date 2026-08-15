"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import {
  ArrowLeft,
  ChevronDown,
  Copy,
  FileText,
  HelpCircle,
  Share2,
  ShieldAlert,
} from "lucide-react";

type AssetSymbol = "TON" | "USDT" | "BTC" | "ETH" | "BNB";

type WalletConfig = {
  name: string;
  network: string;
  address: string;
  image: string;
};

type ApiWallet = {
  coin: AssetSymbol;
  network?: string;
  enabled?: boolean;
};

type DepositRecord = {
  id?: string;
  coin?: string;
  amount?: string | number;
  status?: string;
  createdAt?: string;
};

type DepositAddressResponse = {
  success?: boolean;
  wallets?: ApiWallet[];
};

type DepositHistoryResponse = {
  success?: boolean;
  deposits?: DepositRecord[];
};

type ConfirmDepositResponse = {
  success?: boolean;
  message?: string;
  deposit?: {
    coin?: string;
    amount?: number;
    txHash?: string;
    transactionId?: string;
    userId?: string;
    balance?: number;
    notificationId?: string;
    status?: string;
  };
};

/*
|--------------------------------------------------------------------------
| MAIN DEPOSIT WALLETS
|--------------------------------------------------------------------------
|
| Ces adresses sont celles affichées au client.
|
| IMPORTANT :
| Le serveur vérifie ensuite que le dépôt réel correspond
| à l'adresse MainWallet configurée dans la base de données.
|
|--------------------------------------------------------------------------
*/

const wallets: Record<AssetSymbol, WalletConfig> = {
  TON: {
    name: "Toncoin",
    network: "TON Network",
    address:
      "UQAxW8i5MKUjk753WbwWE0KdCSHylv9At4nVjBHJA8UU9yV5",
    image: "/coins/ton.png",
  },

  USDT: {
    name: "Tether",
    network: "TRON (TRC20)",
    address:
      "TBxRVyNAVknojv1WHcCKJDr9xmYeRvCEwD",
    image: "/coins/usdt.png",
  },

  BTC: {
    name: "Bitcoin",
    network: "Bitcoin",
    address:
      "19oN3rzDgERVPWuFv2Y7mqmma1KHt757K9",
    image: "/coins/btc.png",
  },

  ETH: {
    name: "Ethereum",
    network: "ERC20",
    address:
      "0xd864ac40ea36550d1bc4373cb7ea42badaf331aa",
    image: "/coins/eth.png",
  },

  BNB: {
    name: "BNB",
    network: "BNB Smart Chain",
    address:
      "0xd864ac40ea36550d1bc4373cb7ea42badaf331aa",
    image: "/coins/bnb.png",
  },
};

export default function DepositPage() {
  const [asset, setAsset] =
    useState<AssetSymbol>("TON");

  const [addresses, setAddresses] =
    useState<ApiWallet[]>([]);

  const [depositHistory, setDepositHistory] =
    useState<DepositRecord[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [txHash, setTxHash] =
    useState("");

  const [confirming, setConfirming] =
    useState(false);

  const [confirmMessage, setConfirmMessage] =
    useState("");

  const [confirmSuccess, setConfirmSuccess] =
    useState(false);

  const qrRef =
    useRef<HTMLDivElement>(null);

  const qrInstance =
    useRef<QRCodeStyling | null>(null);

  /*
   * ============================================================
   * CURRENT WALLET
   * ============================================================
   */

  const current = useMemo<WalletConfig>(() => {
    return wallets[asset];
  }, [asset]);

  /*
   * ============================================================
   * WALLET STATUS
   * ============================================================
   */

  const apiWallet = useMemo(
    () =>
      addresses.find(
        (wallet) =>
          wallet.coin === asset
      ),
    [addresses, asset]
  );

  const isEnabled =
    apiWallet?.enabled ?? true;

  /*
   * ============================================================
   * LOAD WALLET STATUS
   * ============================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function loadAddresses() {
      try {
        const response = await fetch(
          "/api/deposit/address",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load deposit wallet status"
          );
        }

        const data =
          (await response.json()) as DepositAddressResponse;

        if (
          !cancelled &&
          data.success &&
          Array.isArray(data.wallets)
        ) {
          setAddresses(data.wallets);
        }
      } catch (error) {
        console.error(
          "Failed to load deposit wallet status:",
          error
        );
      }
    }

    void loadAddresses();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * ============================================================
   * LOAD DEPOSIT HISTORY
   * ============================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function loadDeposits() {
      try {
        const response = await fetch(
          "/api/deposit",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load deposits"
          );
        }

        const data =
          (await response.json()) as DepositHistoryResponse;

        if (
          !cancelled &&
          data.success &&
          Array.isArray(data.deposits)
        ) {
          setDepositHistory(
            data.deposits
          );
        }
      } catch (error) {
        console.error(
          "Failed to load deposit history:",
          error
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDeposits();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * ============================================================
   * QR CODE
   * ============================================================
   */

  useEffect(() => {
    if (
      !qrRef.current ||
      !current.address
    ) {
      return;
    }

    const logoUrl =
      `${window.location.origin}/logo.png`;

    if (!qrInstance.current) {
      qrInstance.current =
        new QRCodeStyling({
          width: 210,
          height: 210,
          type: "svg",
          data: current.address,
          image: logoUrl,

          dotsOptions: {
            color: "#000000",
            type: "rounded",
          },

          cornersSquareOptions: {
            type: "extra-rounded",
          },

          backgroundOptions: {
            color: "#ffffff",
          },

          imageOptions: {
            crossOrigin: "anonymous",
            margin: 6,
          },
        });

      qrInstance.current.append(
        qrRef.current
      );
    } else {
      qrInstance.current.update({
        data: current.address,
        image: logoUrl,
      });
    }
  }, [current.address]);

  /*
   * ============================================================
   * COPY ADDRESS
   * ============================================================
   */

  const copyAddress = async () => {
    if (!isEnabled) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        current.address
      );

      alert(
        `${asset} deposit address copied successfully!`
      );
    } catch {
      alert(
        "Unable to copy address."
      );
    }
  };

  /*
   * ============================================================
   * SHARE ADDRESS
   * ============================================================
   */

  const shareAddress = async () => {
    if (!isEnabled) {
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title:
            `AI TONKEEPER ${asset} Deposit`,
          text:
            `Deposit ${asset} using this address:`,
          url: current.address,
        });
      } else {
        await navigator.clipboard.writeText(
          current.address
        );

        alert(
          "Address copied successfully!"
        );
      }
    } catch {
      // User cancelled sharing.
    }
  };

  /*
   * ============================================================
   * CONFIRM DEPOSIT
   * ============================================================
   *
   * Le client envoie uniquement :
   *
   * {
   *   coin,
   *   txHash
   * }
   *
   * Le montant n'est JAMAIS envoyé par le client.
   *
   * Le serveur récupère le montant directement auprès
   * de Bybit et crédite ensuite le Balance interne.
   *
   * ============================================================
   */

  const confirmDeposit = async () => {
    const normalizedTxHash =
      txHash.trim();

    if (!isEnabled) {
      setConfirmSuccess(false);

      setConfirmMessage(
        "Deposits are currently unavailable for this asset."
      );

      return;
    }

    if (!normalizedTxHash) {
      setConfirmSuccess(false);

      setConfirmMessage(
        "Please enter your transaction hash."
      );

      return;
    }

    setConfirming(true);
    setConfirmMessage("");
    setConfirmSuccess(false);

    try {
      const response = await fetch(
        "/api/deposit/confirm",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            coin: asset,
            txHash:
              normalizedTxHash,
          }),
        }
      );

      const data =
        (await response.json()) as ConfirmDepositResponse;

      if (
        !response.ok ||
        !data.success
      ) {
        setConfirmSuccess(false);

        setConfirmMessage(
          data.message ||
            "Unable to confirm this deposit."
        );

        return;
      }

      setConfirmSuccess(true);

      if (
        data.deposit?.amount !==
        undefined
      ) {
        setConfirmMessage(
          `Deposit confirmed: ${data.deposit.amount} ${asset} has been credited to your balance.`
        );
      } else {
        setConfirmMessage(
          "Deposit verified and credited successfully."
        );
      }

      setTxHash("");

      /*
       * Refresh deposit history
       */

      try {
        const historyResponse =
          await fetch(
            "/api/deposit",
            {
              cache: "no-store",
            }
          );

        if (
          historyResponse.ok
        ) {
          const historyData =
            (await historyResponse.json()) as DepositHistoryResponse;

          if (
            historyData.success &&
            Array.isArray(
              historyData.deposits
            )
          ) {
            setDepositHistory(
              historyData.deposits
            );
          }
        }
      } catch (historyError) {
        console.error(
          "Failed to refresh deposit history:",
          historyError
        );
      }
    } catch (error) {
      console.error(
        "Deposit confirmation error:",
        error
      );

      setConfirmSuccess(false);

      setConfirmMessage(
        "Unable to connect to the deposit confirmation service."
      );
    } finally {
      setConfirming(false);
    }
  };

  /*
   * ============================================================
   * DEPOSIT INFORMATION
   * ============================================================
   */

  const minimumDeposit =
    asset === "TON"
      ? "0.05 TON"
      : asset === "BTC"
        ? "0.0001 BTC"
        : asset === "ETH"
          ? "0.005 ETH"
          : asset === "BNB"
            ? "0.01 BNB"
            : "10 USDT";

  const confirmations =
    asset === "BTC"
      ? "2 confirmations"
      : "1 confirmation";

  /*
   * ============================================================
   * FILTER CURRENT ASSET HISTORY
   * ============================================================
   */

  const currentAssetDeposits =
    depositHistory.filter(
      (deposit) =>
        typeof deposit.coin ===
          "string" &&
        deposit.coin.toUpperCase() ===
          asset
    );

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <main className="min-h-screen bg-[#050B18] text-white">
      <div className="mx-auto max-w-md px-5 py-6">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-800 bg-[#101A2C]"
            aria-label="Go back"
            onClick={() =>
              window.history.back()
            }
          >
            <ArrowLeft size={20} />
          </button>

          <h1 className="text-2xl font-bold">
            Deposit
          </h1>

          <div className="flex gap-2">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-800 bg-[#101A2C]"
              aria-label="Help"
            >
              <HelpCircle size={18} />
            </button>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-800 bg-[#101A2C]"
              aria-label="Deposit information"
            >
              <FileText size={18} />
            </button>
          </div>
        </div>

        {/* ================================================== */}
        {/* STEP 1 — SELECT ASSET */}
        {/* ================================================== */}

        <div className="mb-5 rounded-3xl border border-slate-800 bg-[#101A2C] p-5">
          <p className="mb-4 font-semibold text-cyan-400">
            ① Select Asset
          </p>

          <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-[#0B1424] px-4 py-4">
            <div className="flex items-center gap-3">
              <Image
                src={current.image}
                alt={current.name}
                width={42}
                height={42}
              />

              <div>
                <p className="text-lg font-bold">
                  {asset}
                </p>

                <p className="text-sm text-gray-400">
                  {current.name}
                </p>
              </div>
            </div>

            <ChevronDown size={22} />
          </div>

          <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
            {(
              Object.entries(
                wallets
              ) as [
                AssetSymbol,
                WalletConfig
              ][]
            ).map(
              ([
                symbol,
                coin,
              ]) => (
                <button
                  key={symbol}
                  type="button"
                  onClick={() =>
                    setAsset(symbol)
                  }
                  className={`min-w-[82px] rounded-2xl border p-3 transition ${
                    asset === symbol
                      ? "border-cyan-400 bg-[#16233D]"
                      : "border-slate-800 bg-[#0B1424]"
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <Image
                      src={
                        coin.image
                      }
                      alt={symbol}
                      width={40}
                      height={40}
                    />

                    <span className="mt-2 font-semibold">
                      {symbol}
                    </span>
                  </div>
                </button>
              )
            )}
          </div>
        </div>

        {/* ================================================== */}
        {/* STEP 2 — NETWORK */}
        {/* ================================================== */}

        <div className="mb-5 rounded-3xl border border-slate-800 bg-[#101A2C] p-5">
          <p className="mb-4 font-semibold text-cyan-400">
            ② Select Network
          </p>

          <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-[#0B1424] px-4 py-4">
            <div className="flex items-center gap-3">
              <Image
                src={current.image}
                alt={current.network}
                width={38}
                height={38}
              />

              <div>
                <p className="font-semibold">
                  {current.network}
                </p>

                <span
                  className={`text-sm ${
                    isEnabled
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {isEnabled
                    ? "Available"
                    : "Disabled"}
                </span>
              </div>
            </div>

            <ChevronDown size={20} />
          </div>

          <div className="mt-4 rounded-2xl border border-slate-800 bg-[#0B1424] p-4 text-sm text-gray-400">
            Ensure the selected network matches the network
            used when sending your deposit. Deposits sent
            through another network may be permanently lost.
          </div>
        </div>

        {/* ================================================== */}
        {/* STEP 3 — DEPOSIT ADDRESS */}
        {/* ================================================== */}

        <div className="mb-5 rounded-3xl border border-slate-800 bg-[#101A2C] p-5">
          <p className="mb-4 font-semibold text-cyan-400">
            ③ Deposit Address
          </p>

          <div className="mb-5 flex justify-center">
            <div className="flex justify-center rounded-2xl bg-white p-4 shadow-lg">
              <div ref={qrRef} />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-[#0B1424] px-4 py-4">
            <span className="break-all text-sm">
              {current.address}
            </span>

            <button
              type="button"
              onClick={
                copyAddress
              }
              disabled={!isEnabled}
              aria-label="Copy deposit address"
              className={
                isEnabled
                  ? "text-cyan-400"
                  : "cursor-not-allowed text-gray-600"
              }
            >
              <Copy size={22} />
            </button>
          </div>

          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={
                shareAddress
              }
              disabled={!isEnabled}
              className={`flex items-center gap-2 rounded-xl border px-6 py-3 ${
                isEnabled
                  ? "border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
                  : "cursor-not-allowed border-slate-700 text-gray-600"
              }`}
            >
              <Share2 size={18} />
              Share Address
            </button>
          </div>
        </div>

        {/* ================================================== */}
        {/* STEP 4 — CONFIRM DEPOSIT */}
        {/* ================================================== */}

        <div className="mb-5 rounded-3xl border border-slate-800 bg-[#101A2C] p-5">
          <p className="mb-2 font-semibold text-cyan-400">
            ④ Confirm Your Deposit
          </p>

          <p className="mb-4 text-sm text-gray-400">
            After sending your {asset}, enter the transaction
            hash below. The deposit amount will be verified
            directly with Bybit.
          </p>

          <label
            htmlFor="deposit-tx-hash"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Transaction Hash / TXID
          </label>

          <input
            id="deposit-tx-hash"
            type="text"
            value={txHash}
            onChange={(event) =>
              setTxHash(
                event.target.value
              )
            }
            placeholder={`Enter your ${asset} transaction hash`}
            disabled={
              confirming ||
              !isEnabled
            }
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-2xl border border-slate-800 bg-[#0B1424] px-4 py-4 text-sm text-white outline-none placeholder:text-gray-600 focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          />

          <button
            type="button"
            onClick={
              confirmDeposit
            }
            disabled={
              confirming ||
              !isEnabled ||
              !txHash.trim()
            }
            className={`mt-4 w-full rounded-2xl px-5 py-4 font-semibold transition ${
              confirming ||
              !isEnabled ||
              !txHash.trim()
                ? "cursor-not-allowed bg-slate-800 text-gray-500"
                : "bg-cyan-500 text-[#050B18] hover:bg-cyan-400"
            }`}
          >
            {confirming
              ? "Verifying with Bybit..."
              : "Confirm Deposit"}
          </button>

          {confirmMessage && (
            <div
              className={`mt-4 rounded-2xl border p-4 text-sm ${
                confirmSuccess
                  ? "border-green-500/40 bg-green-500/10 text-green-300"
                  : "border-red-500/40 bg-red-500/10 text-red-300"
              }`}
            >
              {confirmMessage}
            </div>
          )}
        </div>

        {/* ================================================== */}
        {/* DEPOSIT INFORMATION */}
        {/* ================================================== */}

        <div className="mb-5 overflow-hidden rounded-3xl border border-slate-800 bg-[#101A2C]">
          <div className="grid grid-cols-2 gap-px bg-slate-800">

            <div className="bg-[#101A2C] p-4">
              <p className="text-sm text-gray-400">
                Minimum Deposit
              </p>

              <p className="mt-2 font-bold text-white">
                {minimumDeposit}
              </p>
            </div>

            <div className="bg-[#101A2C] p-4">
              <p className="text-sm text-gray-400">
                Confirmations
              </p>

              <p className="mt-2 font-bold text-white">
                {confirmations}
              </p>
            </div>

            <div className="bg-[#101A2C] p-4">
              <p className="text-sm text-gray-400">
                Estimated Arrival
              </p>

              <p className="mt-2 font-bold text-white">
                ~1–3 minutes
              </p>
            </div>

            <div className="bg-[#101A2C] p-4">
              <p className="text-sm text-gray-400">
                Network
              </p>

              <p className="mt-2 font-bold text-white">
                {current.network}
              </p>
            </div>

          </div>

          <div className="m-4 rounded-2xl border border-yellow-600 bg-yellow-500/10 p-4">
            <div className="flex items-start gap-3">
              <ShieldAlert
                size={22}
                className="mt-1 text-yellow-400"
              />

              <div>
                <p className="font-semibold text-yellow-300">
                  Send only {asset} to this deposit address.
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  Sending any other asset or using another
                  network may result in permanent loss.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* RECENT DEPOSITS */}
        {/* ================================================== */}

        <div className="mb-5 rounded-3xl border border-slate-800 bg-[#101A2C] p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold">
              Recent Deposits
            </h2>

            <button
              type="button"
              className="text-sm text-cyan-400"
            >
              View All
            </button>
          </div>

          <div className="space-y-4">

            <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-[#0B1424] p-4">
              <div>
                <p className="font-semibold">
                  {asset} Deposit
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {isEnabled
                    ? "Wallet ready to receive deposits."
                    : "Deposits are temporarily unavailable."}
                </p>
              </div>

              <span
                className={`text-sm ${
                  isEnabled
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {isEnabled
                  ? "Ready"
                  : "Disabled"}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-[#0B1424] p-4">
              <div>
                <p className="font-semibold">
                  Deposit Activity
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {loading
                    ? "Loading deposit history..."
                    : currentAssetDeposits.length >
                        0
                      ? "Recent deposit activity available."
                      : "No confirmed deposits"}
                </p>
              </div>

              <span className="text-sm text-gray-400">
                {loading
                  ? "..."
                  : currentAssetDeposits.length >
                      0
                    ? `${currentAssetDeposits.length}`
                    : "--"}
              </span>
            </div>

          </div>
        </div>

        {/* ================================================== */}
        {/* IMPORTANT */}
        {/* ================================================== */}

        <div className="mb-10 rounded-3xl border border-slate-800 bg-[#101A2C] p-5">
          <h3 className="mb-3 text-lg font-bold">
            Important
          </h3>

          <ul className="space-y-3 text-sm text-gray-400">
            <li>
              • Deposit only{" "}
              <span className="font-medium text-white">
                {asset}
              </span>{" "}
              using the selected network.
            </li>

            <li>
              • Deposits are credited automatically after
              the required confirmations.
            </li>

            <li>
              • Your balance is displayed in your AI Wallet
              interface after confirmation.
            </li>

            <li>
              • Never send unsupported assets to this address.
            </li>

            <li>
              • All deposits are managed through the
              corresponding AI TONKEEPER main wallet.
            </li>
          </ul>
        </div>

      </div>
    </main>
  );
}