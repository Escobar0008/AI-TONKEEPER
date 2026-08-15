import crypto from "crypto";

type BybitResponse<T = unknown> = {
  retCode: number;
  retMsg: string;
  result?: T;
  time?: number;
};

type WalletBalance = {
  coin?: Array<{
    coin: string;
    walletBalance: string;
    availableToWithdraw?: string;
    usdValue?: string;
  }>;
};

const BASE_URL =
  process.env.BYBIT_BASE_URL ||
  "https://api-testnet.bybit.com";

const API_KEY = process.env.BYBIT_API_KEY;
const API_SECRET = process.env.BYBIT_API_SECRET;

const RECV_WINDOW = "5000";

function credentials() {
  if (!API_KEY || !API_SECRET) {
    throw new Error(
      "BYBIT_API_KEY or BYBIT_API_SECRET is missing."
    );
  }

  return {
    apiKey: API_KEY,
    apiSecret: API_SECRET,
  };
}

function sign(
  timestamp: string,
  apiKey: string,
  recvWindow: string,
  queryString: string,
  secret: string
) {
  const payload =
    timestamp +
    apiKey +
    recvWindow +
    queryString;

  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
}

/*
|--------------------------------------------------------------------------
| PRIVATE GET
|--------------------------------------------------------------------------
*/

async function privateGet<T>(
  endpoint: string,
  params: Record<string, string>
): Promise<BybitResponse<T>> {
  const { apiKey, apiSecret } =
    credentials();

  const searchParams =
    new URLSearchParams(params);

  const queryString =
    searchParams.toString();

  const timestamp =
    Date.now().toString();

  const signature = sign(
    timestamp,
    apiKey,
    RECV_WINDOW,
    queryString,
    apiSecret
  );

  const response = await fetch(
    `${BASE_URL}${endpoint}?${queryString}`,
    {
      method: "GET",
      headers: {
        "X-BAPI-API-KEY": apiKey,
        "X-BAPI-TIMESTAMP": timestamp,
        "X-BAPI-RECV-WINDOW":
          RECV_WINDOW,
        "X-BAPI-SIGN": signature,
      },
      cache: "no-store",
    }
  );

  const data =
    (await response.json()) as BybitResponse<T>;

  if (!response.ok) {
    throw new Error(
      data.retMsg ||
        `Bybit HTTP ${response.status}`
    );
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| TEST CONNECTION
|--------------------------------------------------------------------------
*/

export async function testBybitConnection() {
  try {
    credentials();

    const response =
      await privateGet(
        "/v5/account/wallet-balance",
        {
          accountType: "UNIFIED",
        }
      );

    if (response.retCode !== 0) {
      return {
        success: false,
        message:
          response.retMsg ||
          "Bybit connection failed.",
      };
    }

    return {
      success: true,
      message:
        "Bybit connection successful.",
      testnet:
        BASE_URL.includes(
          "api-testnet.bybit.com"
        ),
    };
  } catch (error) {
    console.error(
      "BYBIT CONNECTION ERROR:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to connect to Bybit.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| GET ACCOUNT BALANCE
|--------------------------------------------------------------------------
*/

export async function getBybitBalances() {
  try {
    const response =
      await privateGet<WalletBalance>(
        "/v5/account/wallet-balance",
        {
          accountType: "UNIFIED",
        }
      );

    if (response.retCode !== 0) {
      return {
        success: false,
        message:
          response.retMsg ||
          "Unable to retrieve Bybit balance.",
        balances: [],
      };
    }

    const balances =
      response.result?.coin ?? [];

    return {
      success: true,
      message:
        "Bybit balances retrieved.",
      balances,
    };
  } catch (error) {
    console.error(
      "BYBIT BALANCE ERROR:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to retrieve Bybit balance.",
      balances: [],
    };
  }
}