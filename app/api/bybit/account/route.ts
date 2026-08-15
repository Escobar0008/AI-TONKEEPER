import { NextResponse } from "next/server";

import {
  getBybitBalances,
  getBybitMarketPrice,
  getBybitOpenOrders,
  getBybitPositions,
  getBybitOrderHistory,
} from "@/lib/bybit/client";

const SUPPORTED_SYMBOLS = [
  "TONUSDT",
  "BTCUSDT",
  "ETHUSDT",
  "BNBUSDT",
] as const;

type OperationResult = {
  success: boolean;
  message?: string;
};

function getErrorMessage(
  result: OperationResult
): string | null {
  if (result.success) {
    return null;
  }

  return (
    result.message ||
    "Bybit request failed."
  );
}

export async function GET() {
  try {
    /*
     * ------------------------------------------------------------
     * LOAD ACCOUNT DATA
     * ------------------------------------------------------------
     */

    const [
      balanceResult,
      ordersResult,
      positionsResult,
      historyResult,
    ] = await Promise.all([
      getBybitBalances(),
      getBybitOpenOrders("spot"),
      getBybitPositions("linear"),
      getBybitOrderHistory("spot", "50"),
    ]);

    /*
     * ------------------------------------------------------------
     * MARKET PRICES
     * ------------------------------------------------------------
     */

    const prices = await Promise.all(
      SUPPORTED_SYMBOLS.map(
        async (symbol) => {
          try {
            const result =
              await getBybitMarketPrice(
                symbol,
                "spot"
              );

            return {
              symbol,
              ...result,
            };
          } catch (error) {
            console.error(
              `BYBIT PRICE ERROR ${symbol}:`,
              error
            );

            return {
              symbol,
              success: false,
              message:
                error instanceof Error
                  ? error.message
                  : "Unable to load market price.",
              price: 0,
            };
          }
        }
      )
    );

    /*
     * ------------------------------------------------------------
     * ACCOUNT CONNECTION STATUS
     * ------------------------------------------------------------
     *
     * The authenticated account is considered
     * connected when the balance request succeeds.
     */

    const accountConnected =
      balanceResult.success;

    /*
     * ------------------------------------------------------------
     * RESPONSE
     * ------------------------------------------------------------
     */

    return NextResponse.json({
      success: accountConnected,

      source: "BYBIT_MAINNET",

      account: {
        totalEquity:
          balanceResult.totalEquity ??
          "0",

        totalWalletBalance:
          balanceResult.totalWalletBalance ??
          "0",

        totalAvailableBalance:
          balanceResult.totalAvailableBalance ??
          "0",
      },

      balances:
        balanceResult.balances ?? [],

      prices,

      orders:
        ordersResult.orders ?? [],

      positions:
        positionsResult.positions ?? [],

      history:
        historyResult.orders ?? [],

      errors: {
        balance:
          getErrorMessage(
            balanceResult
          ),

        orders:
          getErrorMessage(
            ordersResult
          ),

        positions:
          getErrorMessage(
            positionsResult
          ),

        history:
          getErrorMessage(
            historyResult
          ),
      },

      updatedAt:
        new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      "BYBIT ACCOUNT API ERROR:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unable to load Bybit account data.";

    return NextResponse.json(
      {
        success: false,

        source: "BYBIT_MAINNET",

        message,

        account: {
          totalEquity: "0",
          totalWalletBalance: "0",
          totalAvailableBalance: "0",
        },

        balances: [],

        prices: [],

        orders: [],

        positions: [],

        history: [],

        errors: {
          balance: message,
          orders:
            "Account request failed.",
          positions:
            "Account request failed.",
          history:
            "Account request failed.",
        },

        updatedAt:
          new Date().toISOString(),
      },
      {
        status: 500,
      }
    );
  }
}